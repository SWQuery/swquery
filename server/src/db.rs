use {
    sqlx::{postgres::PgPoolOptions, Pool, Postgres},
    std::env,
};

pub type DbPool = Pool<Postgres>;

pub async fn connect() -> DbPool {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to the database")
}
