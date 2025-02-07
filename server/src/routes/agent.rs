use serde::{Deserialize, Serialize};
use {
    axum::{
        extract::State,
        http::{HeaderMap, StatusCode},
        Json,
    },
    reqwest::Client,
    serde_json::Value,
    sqlx::PgPool,
};

#[derive(Deserialize, Serialize, Debug)]
pub struct QueryRequest {
    #[serde(rename = "inputUser")]
    pub input_user: String,
    pub address: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct QueryRequestReport {
    #[serde(rename = "jsonReturned")]
    pub input_user: String,
    #[serde(rename = "question")]
    pub chatted: String,
    pub address: String,
    pub openai_key: String,
}

#[derive(Serialize, Deserialize)]
pub struct QueryResponse {
    pub result: QueryResult,
    pub tokens: i64,
}

#[derive(Serialize, Deserialize)]
pub struct QueryResponseReport {
    pub result: String,
    pub tokens: i64,
}

#[derive(Serialize, Deserialize)]
pub struct QueryResult {
    pub response: String,
    status: String,
    params: Value,
}

pub async fn fetch_credit_info(
    pool: &PgPool,
    api_key: &str,
) -> Result<(i32, String, i64, String), (StatusCode, String)> {
    sqlx::query_as::<_, (i32, String, i64, String)>(
        "SELECT c.user_id, u.pubkey, c.remaining_requests::bigint, c.api_key 
         FROM credits c 
         JOIN users u ON u.id = c.user_id 
         WHERE c.api_key = $1 LIMIT 1",
    )
    .bind(api_key)
    .fetch_optional(pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    .ok_or((StatusCode::UNAUTHORIZED, "Invalid API key".to_string()))
}

pub async fn send_query_request(
    payload: &mut QueryRequest,
    api_key: &str,
) -> Result<QueryResponse, (StatusCode, String)> {
    let client = Client::new();

    // Debug print
    println!("Sending payload to AI agent: {:?}", payload);

    let response = client
        .post(format!("{}/query/generate-query", crate::AGENT_API_URL))
        .header("x-api-key", api_key)
        .json(payload)
        .send()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Debug print
    println!("Response status: {}", response.status());

    response
        .json()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
}

pub async fn send_query_request_report(
    payload: &mut QueryRequestReport,
    api_key: &str,
) -> Result<QueryResponseReport, (StatusCode, String)> {
    let client = Client::new();
    payload.input_user = payload.input_user.to_lowercase();
    let response = client
        .post(format!(
            "{}/query/generate-visualization",
            crate::AGENT_API_URL
        ))
        .header("x-api-key", api_key)
        .json(payload)
        .send()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    response
        .json()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
}

pub async fn generate_query(
    State(pool): State<PgPool>,
    headers: HeaderMap,
    Json(mut payload): Json<QueryRequest>,
) -> Result<(StatusCode, Json<QueryResponse>), (StatusCode, String)> {
    println!("Generating query");
    let api_key = headers
        .get("x-api-key")
        .and_then(|v| v.to_str().ok())
        .ok_or((StatusCode::UNAUTHORIZED, "Missing API key".to_string()))?;

    let credit = fetch_credit_info(&pool, api_key).await?;

    if credit.2 < 1 {
        return Err((
            StatusCode::PAYMENT_REQUIRED,
            "Insufficient credits".to_string(),
        ));
    }

    println!("Sending query request");
    let query_response = send_query_request(&mut payload, api_key).await?;

    Ok((StatusCode::OK, Json(query_response)))
}

pub async fn generate_report(
    State(_pool): State<PgPool>,
    headers: HeaderMap,
    Json(mut payload): Json<QueryRequestReport>,
) -> Result<(StatusCode, Json<QueryResponseReport>), (StatusCode, String)> {
    let _api_key = headers
        .get("x-api-key")
        .and_then(|v| v.to_str().ok())
        .ok_or((StatusCode::UNAUTHORIZED, "Missing API key".to_string()))?;

    let query_response = send_query_request_report(&mut payload, _api_key).await?;

    Ok((StatusCode::OK, Json(query_response)))
}

pub async fn generate_report_service(
    _pool: PgPool,
    headers: HeaderMap,
    Json(mut payload): Json<QueryRequestReport>,
) -> Result<(StatusCode, Json<QueryResponseReport>), (StatusCode, String)> {
    let _api_key = headers
        .get("x-api-key")
        .and_then(|v| v.to_str().ok())
        .ok_or((StatusCode::UNAUTHORIZED, "Missing API key".to_string()))?;

    let query_response = send_query_request_report(&mut payload, _api_key).await?;

    Ok((StatusCode::OK, Json(query_response)))
}
