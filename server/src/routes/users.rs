use {
    crate::models::{User, UserWithApiKey},
    axum::{
        extract::{Path, State},
        http::StatusCode,
        Json,
    },
    serde::{Deserialize, Serialize},
    sqlx::PgPool,
    rust_decimal::Decimal,
};

#[derive(Deserialize)]
pub struct CreateUser {
    pub pubkey: String,
}

#[derive(Deserialize)]
pub struct SubscriptionPayload {
    method: String,
    keys: Option<Vec<String>>,
}

#[derive(Debug, Serialize)]
pub struct UsageResponse {
    remaining_credits: i64,
    last_transaction: Option<Transaction>,
    total_spent_usdc: Decimal,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Transaction {
    id: i32,
    package_id: i32,
    amount_usdc: Decimal,
    created_at: chrono::NaiveDateTime,
}

pub async fn create_user(
    State(pool): State<PgPool>,
    Json(payload): Json<CreateUser>,
) -> Result<(StatusCode, Json<User>), (StatusCode, String)> {
    // Ensure pubkey respects Solana public key length
    // if payload.pubkey.len() != 44 {
    //     return Err((StatusCode::BAD_REQUEST, "Invalid pubkey length".into()));
    // }

    // Check if user already exists
    if let Some(existing_user) =
        sqlx::query_as::<_, User>("SELECT id, pubkey, subscriptions FROM users WHERE pubkey = $1")
            .bind(&payload.pubkey)
            .fetch_optional(&pool)
            .await
            .expect("Failed to query user")
    {
        return Ok((
            StatusCode::OK,
            Json(User {
                id: existing_user.id,
                pubkey: existing_user.pubkey,
                subscriptions: existing_user.subscriptions,
            }),
        ));
    }

    // Insert new user
    let user = sqlx::query_as::<_, User>(
        "INSERT INTO users (pubkey) VALUES ($1) RETURNING id, pubkey, subscriptions",
    )
    .bind(&payload.pubkey)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to insert user: {}", e),
        )
    })?;

    Ok((
        StatusCode::CREATED,
        Json(User {
            id: user.id,
            pubkey: user.pubkey,
            subscriptions: user.subscriptions,
        }),
    ))
}

pub async fn get_users(State(pool): State<PgPool>) -> Json<Vec<User>> {
    let users = sqlx::query_as::<_, User>("SELECT id, pubkey, subscriptions FROM users")
        .fetch_all(&pool)
        .await
        .expect("Failed to fetch users")
        .into_iter()
        .map(|user| User {
            id: user.id,
            pubkey: user.pubkey,
            subscriptions: user.subscriptions,
        })
        .collect();

    Json(users)
}

pub async fn get_user_by_pubkey(
    State(pool): State<PgPool>,
    Path(pubkey): Path<String>,
) -> Result<Json<UserWithApiKey>, (StatusCode, String)> {
    let user =
        sqlx::query_as::<_, User>("SELECT id, pubkey, subscriptions FROM users WHERE pubkey = $1")
            .bind(&pubkey)
            .fetch_optional(&pool)
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    format!("Failed to query user: {}", e),
                )
            })?;

    if user.is_none() {
        return Err((StatusCode::NOT_FOUND, "User not found".into()));
    }

    // Get user API-key
    let user_api_key =
        sqlx::query_scalar::<_, String>("SELECT api_key FROM credits WHERE user_id = $1")
            .bind(user.clone().unwrap().id)
            .fetch_optional(&pool)
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    format!("Failed to query user API-key: {}", e),
                )
            })?;

    if let Some(user) = user {
        Ok(Json(UserWithApiKey {
            id: user.id,
            pubkey: user.pubkey,
            subscriptions: user.subscriptions,
            api_key: user_api_key,
        }))
    } else {
        Err((StatusCode::NOT_FOUND, "User not found".into()))
    }
}

pub async fn manage_subscription(
    State(pool): State<PgPool>,
    Path(pubkey): Path<String>,
    Json(payload): Json<SubscriptionPayload>,
) -> Result<(StatusCode, String), (StatusCode, String)> {
    let user =
        sqlx::query_as::<_, User>("SELECT id, pubkey, subscriptions FROM users WHERE pubkey = $1")
            .bind(&pubkey)
            .fetch_optional(&pool)
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    format!("Error querying user: {}", e),
                )
            })?;

    if let Some(mut user) = user {
        let mut subscriptions = if user.subscriptions.is_null() {
            serde_json::json!({})
        } else {
            user.subscriptions.clone()
        };

        if let Some(keys) = payload.keys {
            if payload.method.starts_with("subscribe") {
                let method_key = payload.method.strip_prefix("subscribe").unwrap();
        
                if !subscriptions.get(method_key).is_some() {
                    subscriptions[method_key] = serde_json::json!([]);
                }

                let list = subscriptions
                    .get_mut(method_key)
                    .unwrap()
                    .as_array_mut()
                    .unwrap();

                for key in keys {
                    if !list.contains(&serde_json::json!(key)) {
                        list.push(serde_json::json!(key));
                    }
                }
            } else if payload.method.starts_with("unsubscribe") {
                let method_key = payload.method.strip_prefix("unsubscribe").unwrap();
                if let Some(list) = subscriptions
                    .get_mut(method_key)
                    .and_then(|v| v.as_array_mut())
                {
                    list.retain(|v| !keys.contains(&v.as_str().unwrap_or_default().to_string()));
                }
            }
        }

        let updated_user = sqlx::query_as::<_, User>(
            "UPDATE users SET subscriptions = $1 WHERE pubkey = $2 RETURNING id, pubkey, subscriptions",
        )
        .bind(serde_json::to_value(subscriptions).unwrap())
        .bind(&pubkey)
        .fetch_one(&pool)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Error updating subscriptions: {}", e),
            )
        })?;

        Ok((
            StatusCode::OK,
            format!("Subscriptions updated for user: {}", updated_user.pubkey),
        ))
    } else {
        Err((StatusCode::NOT_FOUND, "User not found".to_string()))
    }
}

pub async fn get_usage(
    State(pool): State<PgPool>,
    Path(pubkey): Path<String>,
) -> Result<Json<UsageResponse>, (StatusCode, String)> {
    // First try to get the user, if not exists, create it
    let user = sqlx::query_as::<_, User>("SELECT id, pubkey, subscriptions FROM users WHERE pubkey = $1")
        .bind(&pubkey)
        .fetch_optional(&pool)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Error querying user: {}", e),
            )
        })?;

    let user = match user {
        Some(user) => user,
        None => {
            // Insert new user
            sqlx::query_as::<_, User>(
                "INSERT INTO users (pubkey) VALUES ($1) RETURNING id, pubkey, subscriptions",
            )
            .bind(&pubkey)
            .fetch_one(&pool)
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    format!("Failed to insert user: {}", e),
                )
            })?
        }
    };

    // Check if user has any credits or transactions
    let has_activity = sqlx::query_scalar::<_, bool>(
        "SELECT EXISTS (
            SELECT 1 FROM credits WHERE user_id = $1
            UNION
            SELECT 1 FROM transactions WHERE user_id = $1
        )",
    )
    .bind(user.id)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Error checking user activity: {}", e),
        )
    })?;

    // If first time user, create credits entry with 3 trial credits and record the transaction
    if !has_activity {
        let mut tx = pool.begin().await.map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Error starting transaction: {}", e),
            )
        })?;

        // Insert free trial package if it doesn't exist
        let free_trial_package = sqlx::query_scalar!(
            "INSERT INTO packages (name, price_usdc, requests_amount, description)
             VALUES ('Free Trial', 0, 3, 'Free trial credits for new users')
             ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
             RETURNING id",
        )
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Error inserting/getting free trial package: {}", e),
            )
        })?;

        // Insert credits
        sqlx::query(
            "INSERT INTO credits (user_id, remaining_requests, api_key) 
             VALUES ($1, 3, $2)",
        )
        .bind(user.id)
        .bind(crate::utils::generate_api_key())
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Error inserting trial credits: {}", e),
            )
        })?;

        // Record free trial transaction
        sqlx::query(
            "INSERT INTO transactions (user_id, package_id, signature, status)
             VALUES ($1, $2, 'FREE_TRIAL', 'completed')",
        )
        .bind(user.id)
        .bind(free_trial_package)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Error recording trial transaction: {}", e),
            )
        })?;

        tx.commit().await.map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Error committing transaction: {}", e),
            )
        })?;
    }

    // Rest of the existing code for fetching usage data
    let remaining_credits = sqlx::query_scalar::<_, i32>(
        "SELECT COALESCE(remaining_requests, 0) FROM credits WHERE user_id = $1",
    )
    .bind(user.id)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Error querying remaining credits: {}", e),
        )
    })?;

    let last_transaction = sqlx::query_as::<_, Transaction>(
        "SELECT 
            t.id::INT4 as id, 
            t.package_id::INT4 as package_id, 
            p.price_usdc as amount_usdc, 
            t.created_at 
         FROM transactions t
         JOIN packages p ON t.package_id = p.id
         WHERE t.user_id = $1
         ORDER BY t.created_at DESC
         LIMIT 1",
    )
    .bind(user.id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Error querying last transaction: {}", e),
        )
    })?;

    let total_spent_usdc = sqlx::query_scalar::<_, Option<Decimal>>(
        "SELECT COALESCE(SUM(p.price_usdc), 0) as total_spent_usdc
         FROM transactions t
         JOIN packages p ON t.package_id = p.id
         WHERE t.user_id = $1",
    )
    .bind(user.id)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Error querying total spent USDC: {}", e),
        )
    })?
    .unwrap_or_else(|| Decimal::new(0, 0));

    Ok(Json(UsageResponse {
        remaining_credits: remaining_credits as i64,
        last_transaction,
        total_spent_usdc,
    }))
}
