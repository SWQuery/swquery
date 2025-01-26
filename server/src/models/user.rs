use serde_json::Value;

#[derive(sqlx::FromRow)]
pub struct UserModel {
    pub id: i32,
    pub pubkey: String,
    pub pump_portal_payload: Value
}
