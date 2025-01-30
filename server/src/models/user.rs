use serde_json::Value;
use serde::{Deserialize, Serialize};

#[derive(sqlx::FromRow, Serialize, Deserialize, Clone, Debug)]
pub struct User {
    pub id: i32,
    pub pubkey: String,
    pub subscriptions: Value
}

#[derive(Serialize, Deserialize)]
pub struct UserWithApiKey {
    pub id: i32,
    pub pubkey: String,
    pub subscriptions: Value,
    pub api_key: Option<String>,
}