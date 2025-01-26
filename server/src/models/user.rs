use serde_json::Value;
use serde::{Deserialize, Serialize};

#[derive(sqlx::FromRow, Serialize, Deserialize)]
pub struct User {
    pub id: i32,
    pub pubkey: String,
    pub pump_portal_payload: Value
}