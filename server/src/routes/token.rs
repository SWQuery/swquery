use axum::{extract::Path, http::StatusCode, Json, Router, routing::get};
use serde_json::Value;
use std::collections::HashMap;
use reqwest;

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
    reqwest::get(&url).await.ok()?.json::<Value>().await.ok()
}