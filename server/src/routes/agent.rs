use {
    axum::{
        extract::State,
        http::{HeaderMap, StatusCode},
        Json,
    },
    reqwest::Client,
    serde::{Deserialize, Serialize},
    serde_json::Value,
    sqlx::PgPool,
};

#[derive(Deserialize, Serialize, Debug)]
pub struct QueryRequest {
    #[serde(rename = "inputUser")]
    pub input_user: String,
    pub address: String,
}

#[derive(Serialize, Deserialize)]
pub struct QueryResponse {
    result: QueryResult,
    tokens: i64,
}

#[derive(Serialize, Deserialize)]
pub struct QueryResult {
    response: String,
    status: String,
    params: Value,
}

pub async fn generate_query(
    State(pool): State<PgPool>,
    headers: HeaderMap,
    Json(mut payload): Json<QueryRequest>,
) -> Result<(StatusCode, Json<QueryResponse>), (StatusCode, String)> {
    let api_key = headers
        .get("x-api-key")
        .and_then(|v| v.to_str().ok())
        .ok_or((StatusCode::UNAUTHORIZED, "Missing API key".to_string()))?;

    println!("Getting user info");
    let credit = sqlx::query_as::<_, (i32, String, i64, String)>(
        "SELECT c.user_id, u.pubkey, c.balance, c.api_key 
         FROM credits c 
         JOIN users u ON u.id = c.user_id 
         WHERE c.api_key = $1 
         FOR UPDATE",
    )
    .bind(api_key)
    .fetch_optional(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    .ok_or((StatusCode::UNAUTHORIZED, "Invalid API key".to_string()))?;

    let client = Client::new();
    payload.input_user = payload.input_user.to_lowercase();
    let response = client
        .post(format!("{}/query/generate-query", crate::AGENT_API_URL))
        .json(&payload)
        .send()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let query_response: QueryResponse = response
        .json()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if credit.2 < query_response.tokens {
        return Err((
            StatusCode::PAYMENT_REQUIRED,
            "Insufficient credits".to_string(),
        ));
    }

    sqlx::query("UPDATE credits SET balance = balance - $1 WHERE user_id = $2")
        .bind(query_response.tokens)
        .bind(credit.0)
        .execute(&pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok((StatusCode::OK, Json(query_response)))
}
