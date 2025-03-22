use axum::{extract::Path, http::StatusCode, Json, Router, routing::get, response::IntoResponse};
use serde_json::Value;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use reqwest::Client;

const SOLANA_RPC_URL: &str = "";

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
    let client = Client::new();
    let token_address = payload.token_address;

    let response = client
        .get(format!(
            "{}/getTokenInfo?address={}",
            SOLANA_RPC_URL, token_address
        ))
        .send()
        .await;

    println!("Token info response: {:?}", response);

    if let Err(err) = response {
        return (StatusCode::BAD_REQUEST, Json(RugPullResponse {
            risk_level: "Erro".to_string(),
            explanation: format!("Erro ao obter informações do token: {}", err),
        }));
    }

    let token_info = response.unwrap().json::<TokenInfo>().await;
    if let Err(err) = token_info {
        return (StatusCode::BAD_REQUEST, Json(RugPullResponse {
            risk_level: "Erro".to_string(),
            explanation: format!("Erro ao processar JSON do token: {}", err),
        }));
    }

    let token_info = token_info.unwrap();
    let mut risk_score = 0;
    let mut explanation = String::new();

    if token_info.liquidity_locked {
        explanation.push_str("✅ Liquidez bloqueada.\n");
    } else {
        explanation.push_str("⚠️ Liquidez não bloqueada! Alto risco de rug pull.\n");
        risk_score += 3;
    }

    if token_info.contract_audited {
        explanation.push_str("✅ Contrato auditado.\n");
    } else {
        explanation.push_str("⚠️ Contrato não auditado! Risco médio.\n");
        risk_score += 2;
    }

    let total_supply = token_info.supply.unwrap_or(1) as f64;
    let mut top_holder_percent = 0.0;

    if let Some((top_holder, &amount)) = token_info.holders.iter().max_by_key(|entry| entry.1) {
        top_holder_percent = (amount as f64 / total_supply) * 100.0;
        explanation.push_str(&format!(
            "Maior holder ({}) possui {:.2}% do supply.\n",
            top_holder, top_holder_percent
        ));
    }

    if top_holder_percent > 50.0 {
        explanation.push_str("⚠️ Um único holder detém mais de 50%! Alto risco.\n");
        risk_score += 4;
    } else if top_holder_percent > 20.0 {
        explanation.push_str("⚠️ Um holder tem mais de 20%, atenção.\n");
        risk_score += 2;
    } else {
        explanation.push_str("✅ Distribuição razoável.\n");
    }

    let risk_level = match risk_score {
        0..=3 => "Baixo risco 🚀",
        4..=6 => "Risco moderado ⚠️",
        _ => "Alto risco de rug pull! ❌",
    };

    (StatusCode::OK, Json(RugPullResponse {
        risk_level: risk_level.to_string(),
        explanation,
    }))
}