use {
    chrono::{DateTime, NaiveDate, NaiveDateTime, Utc},
    rust_decimal::Decimal,
    serde::{Deserialize, Serialize},
    sqlx::types::Decimal as DecimalType,
};

#[derive(sqlx::FromRow, Serialize)]
pub struct Package {
    pub id: i32,
    pub name: String,
    pub price_usdc: DecimalType,
    pub requests_amount: i32,
    pub description: String,
}

#[derive(sqlx::FromRow, Serialize)]
pub struct Transaction {
    pub id: i32,
    pub user_id: i32,
    pub package_id: i32,
    pub signature: String,
    pub status: String,
    pub created_at: NaiveDateTime,
}

#[derive(Deserialize)]
pub struct VerifyTransactionRequest {
    pub package_id: i32,
    pub signature: String,
    pub user_pubkey: String,
}

#[derive(Serialize)]
pub struct PackageResponse {
    pub id: i32,
    pub name: String,
    #[serde(with = "rust_decimal::serde::float")]
    pub price_usdc: Decimal,
    pub description: String,
    pub requests_amount: i32,
}

#[derive(Deserialize)]
pub struct GetUserUsageRequest {
    pub user_pubkey: String,
}

#[derive(sqlx::FromRow, Serialize, Deserialize)]
pub struct ChatQuantity {
    chat_date: NaiveDate,
    chats_per_day: i64,
}

#[derive(Serialize)]
pub struct GetUserUsageResponse {
    pub remaining_requests: i64,
    pub total_requests: i64,
    pub chats_per_day: Vec<ChatQuantity>,
}

#[derive(Serialize)]
pub struct VerifyTransactionResponse {
    pub message: String,
    pub remaining_requests: i64,
    pub package_requests: i32,
}

impl From<Package> for PackageResponse {
    fn from(package: Package) -> Self {
        Self {
            id: package.id,
            name: package.name,
            price_usdc: package.price_usdc,
            description: package.description,
            requests_amount: package.requests_amount,
        }
    }
}
