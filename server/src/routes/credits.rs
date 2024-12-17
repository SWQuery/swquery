use {
    crate::models::{CreditModel, UserModel},
    axum::{extract::State, http::StatusCode, Json},
    serde::{Deserialize, Serialize},
    sqlx::PgPool,
};

#[derive(Deserialize)]
pub struct BuyCredits {
    pub user_pubkey: String,
    pub amount: i64, // Amount in credits
}

#[derive(Serialize)]
pub struct CreditResponse {
    pub user_pubkey: String,
    pub new_balance: i64,
    pub api_key: Option<String>,
}
#[derive(Serialize)]
pub struct ValidateCreditsResponse {
    pub success: bool,
    pub remaining_balance: i64,
}

// Add function to generate API key
fn generate_api_key() -> String {
    use rand::{thread_rng, Rng};
    const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let mut rng = thread_rng();
    let key: String = (0..32)
        .map(|_| {
            let idx = rng.gen_range(0..CHARSET.len());
            CHARSET[idx] as char
        })
        .collect();
    key
}

// Modify buy_credits to handle API key
pub async fn buy_credits(
    State(pool): State<PgPool>,
    Json(payload): Json<BuyCredits>,
) -> Result<(StatusCode, Json<CreditResponse>), (StatusCode, String)> {
    let user = sqlx::query_as::<_, UserModel>("SELECT id, pubkey FROM users WHERE pubkey = $1")
        .bind(&payload.user_pubkey)
        .fetch_optional(&pool)
        .await
        .map_err(|e| {
            eprintln!("Database error: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Database error".to_string(),
            )
        })?;

    match user {
        Some(user) => {
            let api_key = generate_api_key();
            let credit = sqlx::query_as::<_, CreditModel>(
                "INSERT INTO credits (user_id, balance, api_key) 
                 VALUES ($1, $2, $3)
                 ON CONFLICT (user_id) 
                 DO UPDATE SET balance = credits.balance + EXCLUDED.balance,
                             api_key = COALESCE(credits.api_key, EXCLUDED.api_key)
                 RETURNING *",
            )
            .bind(user.id)
            .bind(payload.amount)
            .bind(&api_key)
            .fetch_one(&pool)
            .await
            .map_err(|e| {
                eprintln!("Credits operation error: {}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Failed to update credits".to_string(),
                )
            })?;

            Ok((
                StatusCode::CREATED,
                Json(CreditResponse {
                    user_pubkey: payload.user_pubkey,
                    new_balance: credit.balance,
                    api_key: Some(api_key),
                }),
            ))
        }
        None => Ok((
            StatusCode::NOT_FOUND,
            Json(CreditResponse {
                user_pubkey: payload.user_pubkey,
                new_balance: 0,
                api_key: None,
            }),
        )),
    }
}

#[derive(Deserialize)]
pub struct RefundCredits {
    pub user_pubkey: String,
    pub amount: i64, // Amount to refund in credits
}

pub async fn refund_credits(
    State(pool): State<PgPool>,
    Json(payload): Json<RefundCredits>,
) -> Result<(StatusCode, Json<CreditResponse>), (StatusCode, String)> {
    let user = sqlx::query_as::<_, UserModel>("SELECT id, pubkey FROM users WHERE pubkey = $1")
        .bind(&payload.user_pubkey)
        .fetch_optional(&pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    let mut balance = 0;

    if let Some(user) = user {
        let credit =
            sqlx::query_as::<_, CreditModel>("SELECT * FROM credits WHERE user_id = $1 FOR UPDATE")
                .bind(user.id)
                .fetch_optional(&pool)
                .await
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        if let Some(credit) = credit {
            if credit.balance < payload.amount {
                return Ok((
                    StatusCode::BAD_REQUEST,
                    Json(CreditResponse {
                        user_pubkey: payload.user_pubkey,
                        new_balance: credit.balance,
                        api_key: None,
                    }),
                ));
            }

            let credit = sqlx::query_as::<_, CreditModel>(
                "UPDATE credits SET balance = balance - $1 WHERE user_id = $2 RETURNING *",
            )
            .bind(payload.amount)
            .bind(user.id)
            .fetch_one(&pool)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
            balance = credit.balance;
        }
    }

    Ok((
        StatusCode::CREATED,
        Json(CreditResponse {
            user_pubkey: payload.user_pubkey,
            new_balance: balance,
            api_key: None,
        }),
    ))
}
