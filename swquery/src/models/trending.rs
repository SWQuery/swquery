use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct GetTrendingTokensResponse {
    #[serde(rename = "items")]
    pub tokens: Vec<TokenData>,
    pub sort_by: Option<String>,
    pub sort_direction: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TokenData {
    pub chain_id: String,
    pub address: String,
    pub name: String,
    pub symbol: String,
    pub logo_url: String,
    pub market_cap: f64,
    pub volume: f64,
    pub volume_change: f64,
    pub price: f64,
    pub price_change: f64,
}
