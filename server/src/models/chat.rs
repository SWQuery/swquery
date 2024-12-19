use chrono::NaiveDateTime;

#[derive(sqlx::FromRow)]
pub struct ChatModel {
    pub id: i32,
    pub user_id: i32,
    pub input_user: String,
    pub response: Option<String>,
    pub tokens_used: i64,
    pub created_at: NaiveDateTime,
}
