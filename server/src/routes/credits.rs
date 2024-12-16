use axum::{extract::State, http::StatusCode, Json};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::models::{CreditModel, UserModel};

#[derive(Deserialize)]
pub struct BuyCredits {
    pub user_pubkey: String,
    pub amount: i64, // Amount in credits
}

#[derive(Serialize)]
pub struct CreditResponse {
    pub user_pubkey: String,
    pub new_balance: i64,
}

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
            // Use INSERT ... ON CONFLICT ... DO UPDATE for atomic upsert
            let credit = sqlx::query_as::<_, CreditModel>(
                "INSERT INTO credits (user_id, balance) 
                 VALUES ($1, $2)
                 ON CONFLICT (user_id) 
                 DO UPDATE SET balance = credits.balance + EXCLUDED.balance
                 RETURNING *",
            )
            .bind(user.id)
            .bind(payload.amount)
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
                }),
            ))
        }
        None => Ok((
            StatusCode::NOT_FOUND,
            Json(CreditResponse {
                user_pubkey: payload.user_pubkey,
                new_balance: 0,
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
        }),
    ))
}
