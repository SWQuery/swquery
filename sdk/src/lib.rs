pub mod client;
pub mod errors;
pub mod llm;
pub mod models;

pub use client::SWqueryClient;

#[cfg(test)]
mod tests {
    use crate::{client::Network, SWqueryClient};
    use dotenvy::dotenv;
    use std::time::Duration;

    #[tokio::test]
    async fn test_query_get_recent_transactions() {
        dotenv().expect("Failed to load .env file");

        let swquery_api_key =
            std::env::var("SWQUERY_API_KEY").expect("SWQUERY_API_KEY not found in environment");
        let rpc_api_key =
            std::env::var("RPC_API_KEY").expect("RPC_API_KEY not found in environment");

        let timeout_secs = Some(Duration::from_secs(10));
        let network = Some(Network::Devnet);

        let client = SWqueryClient::new(swquery_api_key, rpc_api_key, timeout_secs, network);

        let result = client
            .query(
                "I want to get all my transactions",
                "GtJHNhKQnnJZQTHq2Vh49HpR4yKKJmUonVYbLeS1RPs8",
            )
            .await;

        match result {
            Ok(response) => println!("Success: {:#?}", response),
            Err(e) => eprintln!("Error: {:?}", e),
        }
    }
}
