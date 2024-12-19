use {
    crate::{
        models::ChatModel,
        routes::agent::{fetch_credit_info, send_query_request, QueryRequest},
    },
    axum::{
        extract::{Path, State},
        http::{HeaderMap, StatusCode},
        Json,
    },
    chrono::NaiveDateTime,
    serde::{Deserialize, Serialize, Serializer},
    sqlx::PgPool,
};

fn serialize_naive_date_time<S>(date: &NaiveDateTime, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    let s = date.format("%Y-%m-%d %H:%M:%S").to_string();
    serializer.serialize_str(&s)
}

#[derive(Serialize)]
pub struct ChatResponse {
    pub id: i32,
    pub user_id: i32,
    pub input_user: String,
    pub response: Option<String>,
    pub tokens_used: i64,
    #[serde(serialize_with = "serialize_naive_date_time")]
    pub created_at: NaiveDateTime,
}

/// Retrieve all chats for a specific user
pub async fn get_chats_for_user(
    State(pool): State<PgPool>,
    user_pubkey: String,
) -> Result<(StatusCode, Json<Vec<ChatResponse>>), (StatusCode, String)> {
    let chats = sqlx::query_as::<_, ChatModel>(
        "SELECT c.* 
         FROM chats c
         JOIN users u ON u.id = c.user_id
         WHERE u.pubkey = $1
         ORDER BY c.created_at DESC",
    )
    .bind(user_pubkey)
    .fetch_all(&pool)
    .await
    .map_err(|e| {
        eprintln!("Database error: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Database error".to_string(),
        )
    })?;

    let response: Vec<ChatResponse> = chats
        .into_iter()
        .map(|chat| ChatResponse {
            id: chat.id,
            user_id: chat.user_id,
            input_user: chat.input_user,
            response: chat.response,
            tokens_used: chat.tokens_used,
            created_at: chat.created_at,
        })
        .collect();

    Ok((StatusCode::OK, Json(response)))
}

#[derive(Serialize)]
pub struct ChatDetailsResponse {
    pub id: i32,
    pub input_user: String,
    pub response: Option<String>,
    pub tokens_used: i64,
    pub created_at: NaiveDateTime,
}

/// Retrieve details of a specific chat
pub async fn get_chat_by_id(
    State(pool): State<PgPool>,
    Path(chat_id): Path<i32>, // Extracts the chat ID from the path
) -> Result<(StatusCode, Json<ChatDetailsResponse>), (StatusCode, String)> {
    let chat = sqlx::query_as::<_, ChatModel>(
        "SELECT id, input_user, response, tokens_used, created_at 
         FROM chats 
         WHERE id = $1",
    )
    .bind(chat_id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| {
        eprintln!("Database error: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Database error".to_string(),
        )
    })?;

    if let Some(chat) = chat {
        Ok((
            StatusCode::OK,
            Json(ChatDetailsResponse {
                id: chat.id,
                input_user: chat.input_user,
                response: chat.response,
                tokens_used: chat.tokens_used,
                created_at: chat.created_at,
            }),
        ))
    } else {
        Err((StatusCode::NOT_FOUND, "Chat not found".to_string()))
    }
}

#[derive(Deserialize)]
pub struct ChatRequest {
    pub input_user: String,
    pub address: String,
}

#[derive(Serialize, Deserialize)]
pub struct SDKChatResponse {
    pub response: String,
    pub tokens_used: i64,
}

pub async fn chatbot_interact(
    State(pool): State<PgPool>,
    headers: HeaderMap,
    Json(mut payload): Json<QueryRequest>,
) -> Result<(StatusCode, Json<ChatResponse>), (StatusCode, String)> {
    let api_key = headers
        .get("x-api-key")
        .and_then(|v| v.to_str().ok())
        .ok_or((StatusCode::UNAUTHORIZED, "Missing API key".to_string()))?;

    // Fetch user credits
    let credit = fetch_credit_info(&pool, api_key).await?;

    // Call Agent API through `send_query_request`
    let query_response = send_query_request(&mut payload).await?;

    // Check if the user has sufficient credits
    if credit.2 < query_response.tokens {
        return Err((
            StatusCode::PAYMENT_REQUIRED,
            "Insufficient credits".to_string(),
        ));
    }

    // Deduct tokens from user credits
    sqlx::query("UPDATE credits SET balance = balance - $1 WHERE user_id = $2")
        .bind(query_response.tokens)
        .bind(credit.0)
        .execute(&pool)
        .await
        .map_err(|e| {
            eprintln!("Failed to update credits: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to update credits".to_string(),
            )
        })?;

    // Log the interaction
    sqlx::query(
        "INSERT INTO chats (user_id, input_user, response, tokens_used) VALUES ($1, $2, $3, $4)",
    )
    .bind(credit.0)
    .bind(&payload.input_user)
    .bind(&query_response.result.response)
    .bind(query_response.tokens)
    .execute(&pool)
    .await
    .map_err(|e| {
        eprintln!("Failed to log chat: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to log chat".to_string(),
        )
    })?;

    // Return the response
    Ok((
        StatusCode::OK,
        Json(ChatResponse {
            id: 0,
            user_id: credit.0,
            input_user: payload.input_user,
            response: Some(query_response.result.response),
            tokens_used: query_response.tokens,
            created_at: chrono::Utc::now().naive_utc(),
        }),
    ))
}
