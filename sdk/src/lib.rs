pub mod client;
pub mod errors;
pub mod llm;
pub mod models;
pub mod utils;

pub use client::SWqueryClient;

#[cfg(test)]
mod tests {
    use crate::{client::Network, SWqueryClient};

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
