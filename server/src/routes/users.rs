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
        sqlx::query_as::<_, User>("SELECT id, pubkey, pump_portal_payload FROM users WHERE pubkey = $1")
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
                pump_portal_payload: existing_user.pump_portal_payload,
            }),
        ));
    }

    // Insert new user
    let user =
        sqlx::query_as::<_, User>("INSERT INTO users (pubkey) VALUES ($1) RETURNING id, pubkey, pump_portal_payload")
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
            pump_portal_payload: user.pump_portal_payload,
        }),
    ))
}

pub async fn get_users(State(pool): State<PgPool>) -> Json<Vec<User>> {
    let users = sqlx::query_as::<_, User>("SELECT id, pubkey, pump_portal_payload FROM users")
        .fetch_all(&pool)
        .await
        .expect("Failed to fetch users")
        .into_iter()
        .map(|user| User {
            id: user.id,
            pubkey: user.pubkey,
            pump_portal_payload: user.pump_portal_payload,
        })
        .collect();

    Json(users)
}

pub async fn get_user_by_pubkey(
    State(pool): State<PgPool>,
    Path(pubkey): Path<String>,
) -> Result<Json<User>, (StatusCode, String)> {
    let user = sqlx::query_as::<_, User>("SELECT id, pubkey, pump_portal_payload FROM users WHERE pubkey = $1")
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
            pump_portal_payload: user.pump_portal_payload,
        }))
    } else {
        Err((StatusCode::NOT_FOUND, "User not found".into()))
    }
}

// pub async fn manage_subscription(
//     State(pool): State<PgPool>,
//     Path(pubkey): Path<String>,          
//     Json(payload): Json<SubscriptionPayload>,
// ) -> Result<(StatusCode, String), (StatusCode, String)> {
//     let user = sqlx::query!("SELECT subscriptions FROM users WHERE pubkey = $1", &pubkey)
//         .fetch_optional(&pool)
//         .await
//         .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Error querying user: {}", e)))?;

//     if let Some(mut user) = user {
//         let mut subscriptions = serde_json::from_value(
//             user.subscriptions.unwrap_or_else(|| serde_json::json!({})),
//         )
//         .unwrap_or_else(|_| serde_json::json!({}));

//         if let Some(keys) = payload.keys {
//             if payload.method.starts_with("subscribe") {
//                 let method_key = payload.method.strip_prefix("subscribe").unwrap();
//                 let list = subscriptions
//                     .get_mut(method_key)
//                     .and_then(|v| v.as_array_mut())
//                     .unwrap_or_else(|| {
//                         subscriptions[method_key] = serde_json::json!([]);
//                         subscriptions[method_key].as_array_mut().unwrap()
//                     });

//                 for key in keys {
//                     if !list.contains(&serde_json::json!(key)) {
//                         list.push(serde_json::json!(key));
//                     }
//                 }
//             } else if payload.method.starts_with("unsubscribe") {
//                 let method_key = payload.method.strip_prefix("unsubscribe").unwrap();
//                 if let Some(list) = subscriptions
//                     .get_mut(method_key)
//                     .and_then(|v| v.as_array_mut())
//                 {
//                     list.retain(|v| !keys.contains(&v.as_str().unwrap_or_default().to_string()));
//                 }
//             }
//         }

//         sqlx::query!(
//             "UPDATE users SET subscriptions = $1 WHERE pubkey = $2",
//             serde_json::to_value(subscriptions).unwrap(),
//             &pubkey
//         )
//         .execute(&pool)
//         .await
//         .map_err(|e| {
//             (
//                 StatusCode::INTERNAL_SERVER_ERROR,
//                 format!("Error updating subscriptions: {}", e),
//             )
//         })?;

//         Ok((StatusCode::OK, "Subscriptions updated".to_string()))
//     } else {
//         Err((StatusCode::NOT_FOUND, "User not found".to_string()))
//     }
// }