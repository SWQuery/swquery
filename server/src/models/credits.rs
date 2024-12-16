#[derive(sqlx::FromRow)]
#[allow(dead_code)]
pub struct CreditModel {
    pub id: i32,
    pub user_id: i32,
    pub balance: i64,
    pub created_at: chrono::NaiveDateTime,
}