use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(sqlx::FromRow, Serialize, Deserialize, Clone, Debug)]
pub struct User {
    pub id: i32,
    pub pubkey: String,
    pub subscriptions: Value,
}

#[derive(Serialize, Deserialize)]
pub struct UserWithApiKey {
    pub id: i32,
    pub pubkey: String,
    pub subscriptions: Value,
    pub api_key: Option<String>,
}

#[derive(Serialize)]
pub struct UserUsage {
    pub remaining_credits: i64,
    pub last_purchases: Vec<Transaction>,
    pub last_7_days_usage: i64,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct Transaction {
    pub id: i64,
    pub package_id: i32,
    pub created_at: NaiveDateTime,
    pub name: String,
    pub price_usdc: rust_decimal::Decimal,
    pub requests_amount: i32,
}
