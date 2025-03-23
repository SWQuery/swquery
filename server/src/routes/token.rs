use axum::{extract::Path, http::StatusCode, Json, Router, routing::get, response::IntoResponse};
use serde_json::Value;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use reqwest::Client;
use solana_client::rpc_client::RpcClient;

#[derive(Debug, Deserialize)]
struct TokenInfo {
    supply: Option<u64>,
    holders: HashMap<String, u64>,
    liquidity_locked: bool,
    contract_audited: bool,
}

#[derive(Debug, Deserialize)]
pub struct RugPullRequest {
    token_address: String,
}

#[derive(Debug, Serialize)]
pub struct RugPullResponse {
    risk_level: String,
    explanation: String,
}


pub async fn get_token_info(Path(token_name): Path<String>) -> Result<Json<Value>, StatusCode> {
    println!("Fetching token info for {}", token_name);
    
    let token_address = match fetch_token_address(&token_name).await {
        Some(address) => address,
        None => {
            println!("Token {} not found in Solana token list", token_name);
            return Err(StatusCode::NOT_FOUND);
        }
    };
    
    match fetch_market_data(&token_address).await {
        Some(data) => Ok(Json(data)),
        None => {
            println!("Failed to fetch market data for token {}", token_name);
            Err(StatusCode::BAD_GATEWAY)
        }
    }
}

async fn fetch_token_address(token_name: &str) -> Option<String> {
    let url = "https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json";
    let response: Value = reqwest::get(url).await.ok()?.json().await.ok()?;

    let tokens = response.get("tokens")?.as_array()?; 
    
    tokens.iter()
        .find(|token| {
            token.get("name")
                .and_then(|name| name.as_str())
                .map(|name_str| name_str.eq_ignore_ascii_case(token_name))
                .unwrap_or(false)
        })
        .and_then(|token| {
            let address = token.get("address")?.as_str()?.to_string();
            println!("Found token {} with address {}", token_name, address);
            Some(address)
        })
}

async fn fetch_market_data(contract_address: &str) -> Option<Value> {
    let url = format!("https://api.coingecko.com/api/v3/coins/solana/contract/{}", contract_address);
    let response = reqwest::get(&url).await.ok()?.json::<Value>().await.ok();
        
    response
}

pub async fn analyze_rug_pull_risk(
    Json(payload): Json<RugPullRequest>,
) -> impl IntoResponse {
    let rpc_client = RpcClient::new(format!(
        "https://mainnet.helius-rpc.com/?api-key={}",
        std::env::var("TEST_HELIUS_API_KEY").unwrap_or_default()
    ));

    let client = Client::new();

    let response = client
        .get(format!(
            "{}/getTokenInfo?address={}",
            rpc_client.url(),
            payload.token_address
        ))
        .send()
        .await;

    let token_info: serde_json::Value = match response {
        Ok(resp) => match resp.json().await {
            Ok(data) => data,
            Err(err) => {
                return (
                    StatusCode::BAD_REQUEST,
                    Json(RugPullResponse {
                        risk_level: "Error".to_string(),
                        explanation: format!("Error processing token JSON: {}", err),
                    }),
                );
            }
        },
        Err(err) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(RugPullResponse {
                    risk_level: "Error".to_string(),
                    explanation: format!("Error querying the API: {}", err),
                }),
            );
        }
    };

    let liquidity_locked = token_info.get("liquidity_locked").and_then(|v| v.as_bool()).unwrap_or(false);
    let contract_audited = token_info.get("contract_audited").and_then(|v| v.as_bool()).unwrap_or(false);
    let total_supply = token_info.get("supply").and_then(|v| v.as_u64()).unwrap_or(1) as f64;
    let holders_list = token_info.get("holders").and_then(|v| v.as_array());
    let empty_vec = Vec::new(); 
    let holders = holders_list.unwrap_or(&empty_vec);

    let mut risk_score = 0;

    if liquidity_locked {
        println!("✅ Liquidity locked.");
    } else {
        println!("⚠️ Liquidity not locked! High risk of rug pull.");
        risk_score += 3;
    }

    if contract_audited {
        println!("✅ Contract audited.");
    } else {
        println!("⚠️ Contract not audited! Medium risk.");
        risk_score += 2;
    }

    let mut top_holder_percent = 0.0;

    if let Some(top_holder) = holders.iter().max_by_key(|entry| entry.get(1).and_then(|v| v.as_u64()).unwrap_or(0)) {
        if let Some(amount) = top_holder.get(1).and_then(|v| v.as_u64()) {
            top_holder_percent = (amount as f64 / total_supply) * 100.0;
            println!(
                "Top holder ({}) holds {:.2}% of the supply.",
                top_holder.get(0).and_then(|v| v.as_str()).unwrap_or("Unknown"),
                top_holder_percent
            );
        }
    }

    if top_holder_percent > 50.0 {
        println!("⚠️ A single holder holds more than 50%! High risk.");
        risk_score += 4;
    } else if top_holder_percent > 20.0 {
        println!("⚠️ A holder has more than 20%, caution.");
        risk_score += 2;
    } else {
        println!("✅ Reasonable distribution.");
    }

    let risk_level = match risk_score {
        0..=3 => "Low risk 🚀",
        4..=6 => "Moderate risk ⚠️",
        _ => "High risk of rug pull! ❌",
    };

    (
        StatusCode::OK,
        Json(RugPullResponse {
            risk_level: risk_level.to_string(),
            explanation: format!("Token analysis {}: {}", payload.token_address, risk_level),
        }),
    )
}