use axum::{
    extract::{Json, State},
    http::StatusCode,
    response::IntoResponse,
};
use reqwest::multipart;
use serde_json::json;
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::models::token::{CreateTokenRequest, CreateTokenResponse};

pub async fn create_pumpfun_token(
    State(pool): State<Arc<Mutex<()>>>, // Replace with your shared state if needed
    Json(payload): Json<CreateTokenRequest>,
) -> impl IntoResponse {
    // Generate token metadata
    let form = multipart::Form::new()
        .file("file", payload.image_path.clone())
        .expect("Failed to add image file to form")
        .text("name", payload.name.clone())
        .text("symbol", payload.symbol.clone())
        .text("description", payload.description.clone())
        .text("twitter", payload.twitter.clone())
        .text("telegram", payload.telegram.clone())
        .text("website", payload.website.clone())
        .text("showName", "true");

    // Send metadata to Pump.fun IPFS API
    let client = reqwest::Client::new();
    let metadata_response = client
        .post("https://pump.fun/api/ipfs")
        .multipart(form)
        .send()
        .await;

    if let Err(e) = metadata_response {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to upload metadata: {}", e),
        )
            .into_response();
    }

    let metadata_response = metadata_response.unwrap();
    if metadata_response.status() != StatusCode::OK {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Metadata upload failed".to_string(),
        )
            .into_response();
    }

    let metadata_json: serde_json::Value = metadata_response.json().await.unwrap();
    let metadata_uri = metadata_json["metadataUri"].as_str().unwrap();

    // Create the token using Pump.fun API
    let body = json!({
        "action": "create",
        "tokenMetadata": {
            "name": payload.name,
            "symbol": payload.symbol,
            "uri": metadata_uri,
        },
        "mint": "generate-mint-keypair", // Replace with actual key generation logic
        "denominatedInSol": "true",
        "amount": 1,
        "slippage": 10,
        "priorityFee": 0.0005,
        "pool": "pump"
    });

    let api_key = "your-api-key";
    let response = client
        .post("https://pumpportal.fun/api/trade")
        .header("Content-Type", "application/json")
        .header("api-key", api_key)
        .json(&body)
        .send()
        .await;

    match response {
        Ok(resp) if resp.status() == StatusCode::OK => {
            let data: serde_json::Value = resp.json().await.unwrap();
            let signature = data["signature"].as_str().unwrap();
            (
                StatusCode::OK,
                Json(CreateTokenResponse {
                    transaction_url: format!("https://solscan.io/tx/{}", signature),
                }),
            )
                .into_response()
        }
        Ok(resp) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Error: {}", resp.text().await.unwrap()),
        )
            .into_response(),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to send request: {}", err),
        )
            .into_response(),
    }
}
