use {
    sqlx::{postgres::PgPoolOptions, Pool, Postgres},
    std::env,
    std::time::Duration,
    tokio::time::sleep,
};

pub type DbPool = Pool<Postgres>;

pub async fn connect() -> DbPool {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let mut attempts = 0;
    let max_attempts = 10;

    loop {
        match PgPoolOptions::new()
            .max_connections(5)
            .acquire_timeout(Duration::from_secs(30))
            .connect(&database_url)
            .await
        {
            Ok(pool) => return pool,
            Err(e) => {
                attempts += 1;
                if attempts >= max_attempts {
                    panic!(
                        "Failed to connect to the database after {} attempts: {}",
                        max_attempts, e
                    );
                }
                eprintln!(
                    "Failed to connect to database (attempt {}), retrying in 10 seconds...",
                    attempts
                );
                sleep(Duration::from_secs(10)).await;
            }
        }
    }
}
