pub mod client;
pub mod errors;
pub mod llm;
pub mod models;
pub mod utils;

pub use client::SWqueryClient;

#[cfg(test)]
mod tests {
    use crate::{client::Network, SWqueryClient};
    use dotenvy::dotenv;
    use std::time::Duration;

    // #[tokio::test]
    // async fn test_query_get_recent_transactions() {
    //     dotenv().expect("Failed to load .env file");

    //     let swquery_api_key =
    //         std::env::var("SWQUERY_API_KEY").expect("SWQUERY_API_KEY not found in environment");
    //     let rpc_api_key =
    //         std::env::var("RPC_API_KEY").expect("RPC_API_KEY not found in environment");

    //     let timeout_secs = Some(Duration::from_secs(10));
    //     let network = Some(Network::Mainnet);

    //     let client = SWqueryClient::new(swquery_api_key, rpc_api_key, timeout_secs, network);

    //     let result = client
    //         .query(
    //             "I want to get all my transactions",
    //             "GtJHNhKQnnJZQTHq2Vh49HpR4yKKJmUonVYbLeS1RPs8",
    //         )
    //         .await;

    //     match result {
    //         Ok(response) => println!("Success: {:#?}", response),
    //         Err(e) => eprintln!("Error: {:?}", e),
    //     }
    // }

    #[tokio::test]
    async fn test_get_recent_transactions() {
        let client = SWqueryClient::new(
            "WDAO4Z1Z503DWJH7060GIYGR0TWIIPBM".to_string(),
            "45af5ec2-c5c5-4da2-9226-550f52e126cd".to_string(),
            None,
            Some(Network::Mainnet),
        );

        let result = client
            .query(
                "I want my transactions on the last 2 days",
                "HuMZdNtbaNBPYex53irwAyKvxouLmEyN85MvAon81pXE",
            )
            .await;

        match result {
            Ok(transactions) => {
                println!(
                    "Recent Transactions in JSON format: {:#?}",
                    serde_json::to_string(&transactions)
                );
            }
            Err(err) => {
                eprintln!("Error fetching transactions: {:?}", err);
            }
        }
    }
}
