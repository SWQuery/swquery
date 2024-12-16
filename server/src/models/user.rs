#[derive(sqlx::FromRow)]
pub struct UserModel {
    pub id: i32,
    pub pubkey: String,
}
