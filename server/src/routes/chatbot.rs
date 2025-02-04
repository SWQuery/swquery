use {
    super::agent::{generate_report_service, QueryRequestReport},
    crate::{models::ChatModel, routes::agent::fetch_credit_info},
    axum::{
        extract::{Path, State},
        http::{HeaderMap, StatusCode},
        Json,
    },
    chrono::NaiveDateTime,
    serde::{Deserialize, Serialize, Serializer},
    sqlx::PgPool,
    std::time::Duration,
    swquery::{client::Network, SWqueryClient},
};

fn serialize_naive_date_time<S>(date: &NaiveDateTime, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    let s = date.format("%Y-%m-%d %H:%M:%S").to_string();
    serializer.serialize_str(&s)
}

#[derive(Serialize)]
pub struct GetChatsResponse {
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
) -> Result<(StatusCode, Json<Vec<GetChatsResponse>>), (StatusCode, String)> {
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

    let response: Vec<GetChatsResponse> = chats
        .into_iter()
        .map(|chat| GetChatsResponse {
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

#[derive(Deserialize, Debug)]
pub struct ChatRequest {
    pub input_user: String,
    pub address: String,
}

#[derive(Serialize)]
pub struct ChatResponse {
    pub credits: i64,
    pub response: serde_json::Value,
    pub metadata: Option<serde_json::Value>,
    pub report: String,
    pub response_type: String,
}

pub async fn chatbot_interact(
    State(pool): State<PgPool>,
    headers: HeaderMap,
    Json(payload): Json<ChatRequest>,
) -> Result<(StatusCode, Json<ChatResponse>), (StatusCode, String)> {
    println!("Chat request: {:#?}", payload);

    let api_key = headers
        .get("x-api-key")
        .and_then(|v| v.to_str().ok())
        .ok_or((StatusCode::UNAUTHORIZED, "Missing API key".to_string()))?;

    // Fetch credit info first to verify user has access
    let (status, credit, remaining_credits, api_key_str) =
        fetch_credit_info(&pool, api_key).await?;

    // Load environment variables
    let helius_api_key = std::env::var("HELIUS_API_KEY").map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Helius API key not configured".to_string(),
        )
    })?;

    let openai_api_key = std::env::var("OPENAI_API_KEY").map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "OpenAI API key not configured".to_string(),
        )
    })?;

    let swquery_client = SWqueryClient::new(
        api_key.to_string(),
        Some(helius_api_key),
        Some(Duration::from_secs(30)),
        Some(Network::Mainnet),
    );

    let query_result = swquery_client
        .query(&payload.input_user, &payload.address)
        .await
        .map_err(|e| {
            eprintln!("SDK query error: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to process query".to_string(),
            )
        })?;

    let metadata = query_result.response.get("metadata").cloned();

    let report_input = QueryRequestReport {
        input_user: query_result.response.clone().to_string(),
        address: payload.address.clone(),
        chatted: payload.input_user.clone(),
        openai_key: openai_api_key.clone(),
    };

    let report = generate_report_service(pool.clone(), headers, axum::Json(report_input)).await?;

    // Get User ID
    let user_id = sqlx::query_scalar::<_, i32>("SELECT id FROM users WHERE pubkey = $1")
        .bind(&payload.address)
        .fetch_one(&pool)
        .await
        .map_err(|e| {
            eprintln!("Database error: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to get user ID".to_string(),
            )
        })?;

    // Create a chat record
    sqlx::query(
        "INSERT INTO chats (user_id, input_user, response, tokens_used) 
         VALUES ($1, $2, $3, $4) RETURNING id",
    )
    .bind(user_id)
    .bind(&payload.input_user)
    .bind(query_result.response.to_string())
    .bind(1000)
    .execute(&pool)
    .await
    .map_err(|e| {
        eprintln!("Database error: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to create chat record".to_string(),
        )
    })?;

    Ok((
        StatusCode::OK,
        Json(ChatResponse {
            credits: remaining_credits,
            response: query_result.response,
            response_type: query_result.response_type,
            metadata,
            report: report.1.result.clone(),
        }),
    ))
}
