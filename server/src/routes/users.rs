use {
    crate::models::User, axum::{
        extract::{Path, State},
        http::StatusCode,
        Json,
    }, serde::Deserialize, sqlx::PgPool
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
    let user =
        sqlx::query_as::<_, User>("INSERT INTO users (pubkey) VALUES ($1) RETURNING id, pubkey, subscriptions")
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
) -> Result<Json<User>, (StatusCode, String)> {
    let user = sqlx::query_as::<_, User>("SELECT id, pubkey, subscriptions FROM users WHERE pubkey = $1")
        .bind(&pubkey)
        .fetch_optional(&pool)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to query user: {}", e),
            )
        })?;

    if let Some(user) = user {
        Ok(Json(User {
            id: user.id,
            pubkey: user.pubkey,
            subscriptions: user.subscriptions,
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
    let user = sqlx::query_as::<_, User>(
        "SELECT id, pubkey, subscriptions FROM users WHERE pubkey = $1",
    )
    .bind(&pubkey)
    .fetch_optional(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Error querying user: {}", e)))?;

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
                if let Some(list) = subscriptions.get_mut(method_key).and_then(|v| v.as_array_mut()) {
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

        Ok((StatusCode::OK, format!("Subscriptions updated for user: {}", updated_user.pubkey)))
    } else {
        Err((StatusCode::NOT_FOUND, "User not found".to_string()))
    }
}