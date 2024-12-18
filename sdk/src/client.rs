use crate::{errors::SdkError, models::*, utils::*};
use reqwest::Client;
use serde::Deserialize;
use serde_json::{json, Value};
use std::time::Duration;
use tracing::error;

const AGENT_API_URL: &str = "http://localhost:8000/query/generate-query";

/// Enum to represent the Solana network.
#[derive(Debug, Clone, Copy, Default)]
pub enum Network {
    #[default]
    Mainnet,
    Devnet,
}

/// SWqueryClient is the main entry point for using this SDK to interact with the Solana RPC
/// via the Helius API and a custom Agent API. It provides typed methods for various RPC calls.
#[derive(Debug)]
pub struct SWqueryClient {
    /// The API key for the Agent server.
    pub api_key: String,
    /// The Helius API key for RPC calls.
    pub helius_api_key: String,
    /// The timeout for requests.
    pub timeout: Duration,
    /// The network to use for Helius RPC calls.
    pub network: Network,
    /// A reusable reqwest client.
    client: Client,
}

impl SWqueryClient {
    /// Constructs a new SWqueryClient.
    ///
    /// # Arguments
    ///
    /// * `api_key` - The API key for the agent.
    /// * `helius_api_key` - The API key for Helius RPC.
    /// * `timeout` - Optional request timeout, defaults to 5 seconds if None.
    /// * `network` - Optional network, defaults to Mainnet if None.
    ///
    /// # Returns
    ///
    /// A new instance of SWqueryClient.
    pub fn new(
        api_key: String,
        helius_api_key: String,
        timeout: Option<Duration>,
        network: Option<Network>,
    ) -> Self {
        SWqueryClient {
            api_key,
            helius_api_key,
            timeout: timeout.unwrap_or(Duration::from_secs(5)),
            network: network.unwrap_or_default(),
            client: Client::builder()
                .timeout(timeout.unwrap_or(Duration::from_secs(5)))
                .build()
                .expect("Failed to build reqwest client"),
        }
    }

    /// Returns the Helius RPC URL based on the selected network.
    fn get_helius_rpc_url(&self) -> String {
        match self.network {
            Network::Mainnet => format!(
                "https://mainnet.helius-rpc.com/?api-key={}",
                self.helius_api_key
            ),
            Network::Devnet => format!(
                "https://devnet.helius-rpc.com/?api-key={}",
                self.helius_api_key
            ),
        }
    }

    /// Sends a query to the SWQuery Agent API, receives a response type and parameters,
    /// and then invokes the appropriate RPC method based on the response_type.
    ///
    /// # Arguments
    ///
    /// * `input` - User input or query for the agent.
    /// * `pubkey` - The public key (address) related to the query.
    ///
    /// # Returns
    ///
    /// A JSON value representing the RPC response, or an error if something went wrong.
    pub async fn query(&self, input: &str, pubkey: &str) -> Result<Value, SdkError> {
        // Send the request to the Agent API
        let payload = json!({
            "inputUser": input,
            "address": pubkey
        });

        let response = self
            .client
            .post(AGENT_API_URL)
            .header("x-api-key", &self.api_key)
            .json(&payload)
            .send()
            .await
            .map_err(|e| {
                error!("Failed to send request to Agent: {:?}", e);
                SdkError::RequestFailed
            })?;

        if !response.status().is_success() {
            error!("Agent API returned error status: {}", response.status());
            return Err(SdkError::ApiRequestFailed(response.status().to_string()));
        }

        let response_text = response.text().await.map_err(|e| {
            error!("Failed to get response text from Agent: {}", e);
            SdkError::ParseError(e.to_string())
        })?;

        // Debug log the raw response
        println!("Raw response: {}", response_text);

        let result: Value = serde_json::from_str(&response_text).map_err(|e| {
            error!("Failed to parse Agent API response: {}", e);
            SdkError::ParseError(e.to_string())
        })?;
        println!("Parsed result: {:#?}", result);

        let response_type = result["result"]["response"]
            .as_str()
            .ok_or_else(|| SdkError::Unexpected("Missing response field".to_string()))?;
        println!("Response type: {}", response_type);

        let params = result["result"].get("params").ok_or_else(|| {
            SdkError::InvalidInput("Missing 'params' field in response.".to_string())
        })?;
        println!("Params: {:#?}", params);

        // Handle all the supported RPC calls based on response_type
        match response_type {
            "getRecentTransactions" => {
                let address = get_optional_str_param(params, "address").unwrap_or_default();
                if address.is_empty() {
                    return Err(SdkError::InvalidInput(
                        "Missing address parameter".to_string(),
                    ));
                }
                let days: u64 = get_optional_u64_param(params, "days", 1);

                let response = self.get_recent_transactions(address, days).await?;
                to_value_response(response)
            }
            // "getSignaturesForAddressPeriod" => {
            //     let address = get_optional_str_param(params, "address").unwrap_or_default();
            //     if address.is_empty() {
            //         return Err(SdkError::InvalidInput(
            //             "Missing address parameter".to_string(),
            //         ));
            //     }

            //     let from = get_optional_u64_param(params, "from", 0);
            //     let to = get_optional_u64_param(params, "to", 0);

            //     let response = self
            //         .get_signatures_for_address_period(address, from, to)
            //         .await?;
            //     to_value_response(response)
            // }
            // "getSignaturesForAddress" => {
            //     let address = get_required_str_param(params, "address")?;
            //     let response = self.get_signatures_for_address(address).await?;
            //     to_value_response(response)
            // }
            // "getAssetsByOwner" => {
            //     let owner = get_required_str_param(params, "owner")?;
            //     let response = self.get_assets_by_owner(owner).await?;
            //     to_value_response(response)
            // }
            // "getAssetsByCreator" => {
            //     let creator = get_required_str_param(params, "creator")?;
            //     let response = self.get_assets_by_creator(creator).await?;
            //     to_value_response(response)
            // }
            // "getAssetsByAuthority" => {
            //     let authority = get_required_str_param(params, "authority")?;
            //     let response = self.get_assets_by_authority(authority).await?;
            //     to_value_response(response)
            // }
            // "getSignaturesForAsset" => {
            //     let asset = get_required_str_param(params, "asset")?;
            //     let response = self.get_signatures_for_asset(asset).await?;
            //     to_value_response(response)
            // }
            // "getBalance" => {
            //     let address = get_required_str_param(params, "address")?;
            //     let response = self.get_balance(address).await?;
            //     to_value_response(response)
            // }
            // "getBlockHeight" => {
            //     let response = self.get_block_height().await?;
            //     to_value_response(response)
            // }
            // "getBlockProduction" => {
            //     let response = self.get_block_production().await?;
            //     to_value_response(response)
            // }
            // "getBlockCommitment" => {
            //     let slot = get_required_u64_param(params, "slot")?;
            //     let response = self.get_block_commitment(slot).await?;
            //     to_value_response(response)
            // }
            // "getBlocks" => {
            //     let start_slot = get_required_u64_param(params, "start_slot")?;
            //     let end_slot = get_optional_u64_param(params, "end_slot", start_slot);
            //     let response = self.get_blocks(start_slot, end_slot).await?;
            //     to_value_response(response)
            // }
            // "getBlockTime" => {
            //     let slot = get_required_u64_param(params, "slot")?;
            //     let response = self.get_block_time(slot).await?;
            //     to_value_response(response)
            // }
            // "getClusterNodes" => {
            //     let response = self.get_cluster_nodes().await?;
            //     to_value_response(response)
            // }
            // "getEpochInfo" => {
            //     let response = self.get_epoch_info().await?;
            //     to_value_response(response)
            // }
            // "getEpochSchedule" => {
            //     let response = self.get_epoch_schedule().await?;
            //     to_value_response(response)
            // }
            // "getFeeForMessage" => {
            //     let message = get_required_str_param(params, "message")?;
            //     let response = self.get_fee_for_message(message).await?;
            //     to_value_response(response)
            // }
            // "getFirstAvailableBlock" => {
            //     let response = self.get_first_available_block().await?;
            //     to_value_response(response)
            // }
            // "getGenesisHash" => {
            //     let response = self.get_genesis_hash().await?;
            //     to_value_response(response)
            // }
            // "getHealth" => {
            //     let response = self.get_health().await?;
            //     to_value_response(response)
            // }
            // "getHighestSnapshotSlot" => {
            //     let response = self.get_highest_snapshot_slot().await?;
            //     to_value_response(response)
            // }
            // "getIdentity" => {
            //     let response = self.get_identity().await?;
            //     to_value_response(response)
            // }
            // "getInflationGovernor" => {
            //     let response = self.get_inflation_governor().await?;
            //     to_value_response(response)
            // }
            // "getInflationRate" => {
            //     let response = self.get_inflation_rate().await?;
            //     to_value_response(response)
            // }
            // "getLargestAccounts" => {
            //     let response = self.get_largest_accounts().await?;
            //     to_value_response(response)
            // }
            // "getLatestBlockhash" => {
            //     let response = self.get_latest_blockhash().await?;
            //     to_value_response(response)
            // }
            // "getLeaderSchedule" => {
            //     let response = self.get_leader_schedule().await?;
            //     to_value_response(response)
            // }
            // "getMaxRetransmitSlot" => {
            //     let response = self.get_max_retransmit_slot().await?;
            //     to_value_response(response)
            // }
            // "getMaxShredInsertSlot" => {
            //     let response = self.get_max_shred_insert_slot().await?;
            //     to_value_response(response)
            // }
            // "getMinimumBalanceForRentExemption" => {
            //     let data_len = get_required_u64_param(params, "data_len")?;
            //     let response = self
            //         .get_minimum_balance_for_rent_exemption(data_len)
            //         .await?;
            //     to_value_response(response)
            // }
            // "getProgramAccounts" => {
            //     let program_id = get_required_str_param(params, "program_id")?;
            //     let response = self.get_program_accounts(program_id).await?;
            //     to_value_response(response)
            // }
            // "getRecentPerformanceSamples" => {
            //     let limit = get_optional_u64_param(params, "limit", 10);
            //     let response = self.get_recent_performance_samples(limit).await?;
            //     to_value_response(response)
            // }
            // "getSlot" => {
            //     let response = self.get_slot().await?;
            //     to_value_response(response)
            // }
            // "getSlotLeader" => {
            //     let response = self.get_slot_leader().await?;
            //     to_value_response(response)
            // }
            // "getStakeActivation" => {
            //     let account = get_required_str_param(params, "account")?;
            //     let epoch = params["epoch"].as_u64();
            //     let response = self.get_stake_activation(account, epoch).await?;
            //     to_value_response(response)
            // }
            // "getStakeMinimumDelegation" => {
            //     let response = self.get_stake_minimum_delegation().await?;
            //     to_value_response(response)
            // }
            // "getSupply" => {
            //     let response = self.get_supply().await?;
            //     to_value_response(response)
            // }
            // "getTokenAccountBalance" => {
            //     let pubkey = get_required_str_param(params, "pubkey")?;
            //     let response = self.get_token_account_balance(pubkey).await?;
            //     to_value_response(response)
            // }
            // "getTokenLargestAccounts" => {
            //     let mint = get_required_str_param(params, "mint")?;
            //     let response = self.get_token_largest_accounts(mint).await?;
            //     to_value_response(response)
            // }
            // "getTokenSupply" => {
            //     let mint = get_required_str_param(params, "mint")?;
            //     let response = self.get_token_supply(mint).await?;
            //     to_value_response(response)
            // }
            // "getTransaction" => {
            //     let signature = get_required_str_param(params, "signature")?;
            //     let response = self.get_transaction(signature).await?;
            //     to_value_response(response)
            // }
            // "getTransactionCount" => {
            //     let response = self.get_transaction_count().await?;
            //     to_value_response(response)
            // }
            // "getVersion" => {
            //     let response = self.get_version().await?;
            //     to_value_response(response)
            // }
            // "getVoteAccounts" => {
            //     let response = self.get_vote_accounts().await?;
            //     to_value_response(response)
            // }
            // "isBlockhashValid" => {
            //     let blockhash = get_required_str_param(params, "blockhash")?;
            //     let response = self.is_blockhash_valid(blockhash).await?;
            //     to_value_response(response)
            // }
            // "minimumLedgerSlot" => {
            //     let response = self.minimum_ledger_slot().await?;
            //     to_value_response(response)
            // }
            // "getAccountInfo" => {
            //     let address = get_required_str_param(params, "address")?;
            //     let response = self.get_account_info(address).await?;
            //     to_value_response(response)
            // }
            _ => Err(SdkError::Unexpected(format!(
                "Unsupported method: {}",
                response_type
            ))),
        }
    }

    /// Fetch recent transactions for the last 'n' days using Helius RPC.
    /// This method bypasses `helius_rpc_call` for demonstration, but could be refactored.
    pub async fn get_recent_transactions(
        &self,
        address: &str,
        days: u64,
    ) -> Result<Vec<FullTransaction>, SdkError> {
        if address.trim().is_empty() {
            return Err(SdkError::InvalidInput(
                "Address cannot be empty".to_string(),
            ));
        }

        // Calculate the timestamp for filtering
        let now = chrono::Utc::now().timestamp();
        let from_timestamp = now - (days as i64 * 24 * 60 * 60);

        // Step 1: Fetch signatures for the given address
        let url = self.get_helius_rpc_url();
        let payload = json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getSignaturesForAddress",
            "params": [address, { "commitment": "finalized" }]
        });

        println!("Fetching signatures for address: {}", address);
        let response = self
            .client
            .post(&url)
            .json(&payload)
            .send()
            .await
            .map_err(|e| SdkError::NetworkError(e.to_string()))?;

        if !response.status().is_success() {
            println!("Failed to fetch signatures: {}", response.status());
            return Err(SdkError::ApiRequestFailed(response.status().to_string()));
        }

        let signatures_response: SignaturesResponse = response
            .json()
            .await
            .map_err(|e| SdkError::ParseError(e.to_string()))?;

        println!("Fetched {} signatures", signatures_response.result.len());

        // Step 2: Filter and fetch full transaction details
        let mut transactions = Vec::new();
        for signature_info in signatures_response.result {
            let block_time = if let Some(bt) = signature_info.blockTime {
                bt
            } else {
                // Fetch block time for transactions missing `blockTime`
                let block_time_payload = json!({
                    "jsonrpc": "2.0",
                    "id": 1,
                    "method": "getBlockTime",
                    "params": [signature_info.slot]
                });

                let block_time_response = self
                    .client
                    .post(&url)
                    .json(&block_time_payload)
                    .send()
                    .await
                    .map_err(|e| SdkError::NetworkError(e.to_string()))?;

                if block_time_response.status().is_success() {
                    let block_time_result: GetBlockTimeResponse = block_time_response
                        .json()
                        .await
                        .map_err(|e| SdkError::ParseError(e.to_string()))?;
                    block_time_result.result.unwrap_or(0)
                } else {
                    println!(
                        "Failed to fetch block time for slot {}: {}",
                        signature_info.slot,
                        block_time_response.status()
                    );
                    continue;
                }
            };

            if block_time < from_timestamp as u64 {
                continue;
            }

            // Step 3: Fetch full transaction details
            let transaction_payload = json!({
                "jsonrpc": "2.0",
                "id": 1,
                "method": "getTransaction",
                "params": [signature_info.signature, { "encoding": "json", "maxSupportedTransactionVersion": 0 }]
            });

            println!(
                "Fetching transaction details for signature: {}",
                signature_info.signature
            );

            let transaction_response = self
                .client
                .post(&url)
                .json(&transaction_payload)
                .send()
                .await
                .map_err(|e| SdkError::NetworkError(e.to_string()))?;

            if transaction_response.status().is_success() {
                let response_text = transaction_response.text().await.map_err(|e| {
                    SdkError::ParseError(format!("Failed to read transaction response: {}", e))
                })?;

                match serde_json::from_str::<GetTransactionResponse>(&response_text) {
                    Ok(transaction_response) => {
                        let transaction_result = transaction_response.result;
                        let full_transaction = FullTransaction {
                            signature: transaction_result.transaction.signatures[0].clone(),
                            slot: transaction_result.slot,
                            timestamp: transaction_result.blockTime.unwrap_or_default(),
                            status: transaction_result.meta.as_ref().map_or(
                                "unknown".to_string(),
                                |m| {
                                    if m.err.is_some() {
                                        "failed".to_string()
                                    } else {
                                        "success".to_string()
                                    }
                                },
                            ),
                            details: transaction_result,
                        };
                        transactions.push(full_transaction);
                    }
                    Err(e) => {
                        eprintln!(
                            "Error parsing transaction response: {}. Raw response: {}",
                            e, response_text
                        );
                        continue;
                    }
                }
            } else {
                println!(
                    "Failed to fetch transaction details: {}",
                    transaction_response.status()
                );
            }
        }

        println!("Total transactions fetched: {}", transactions.len());
        Ok(transactions)
    }

    // /// Fetch signatures for a specific address within a given time period.
    // async fn get_signatures_for_address_period(
    //     &self,
    //     address: &str,
    //     from: u64,
    //     to: u64,
    // ) -> Result<SignaturesResponse, SdkError> {
    //     if address.trim().is_empty() {
    //         return Err(SdkError::InvalidInput(
    //             "Address cannot be empty".to_string(),
    //         ));
    //     }

    //     let url = self.get_helius_rpc_url();
    //     let payload = json!({
    //         "jsonrpc": "2.0",
    //         "id": 1,
    //         "method": "getSignaturesForAddress",
    //         "params": [
    //             address,
    //             {
    //                 "before": to,
    //                 "after": from,
    //                 "commitment": "finalized"
    //             }
    //         ]
    //     });

    //     let response = self
    //         .client
    //         .post(&url)
    //         .json(&payload)
    //         .send()
    //         .await
    //         .map_err(|e| SdkError::NetworkError(e.to_string()))?;

    //     if response.status().is_success() {
    //         let result: SignaturesResponse = response
    //             .json()
    //             .await
    //             .map_err(|e| SdkError::Unexpected(format!("Failed to parse response: {}", e)))?;
    //         Ok(result)
    //     } else {
    //         Err(SdkError::ApiRequestFailed(response.status().to_string()))
    //     }
    // }

    // /// Fetch transaction signatures for a specific address.
    // async fn get_signatures_for_address(
    //     &self,
    //     address: &str,
    // ) -> Result<SignaturesResponse, SdkError> {
    //     if address.trim().is_empty() {
    //         return Err(SdkError::InvalidInput(
    //             "Address cannot be empty".to_string(),
    //         ));
    //     }

    //     let params = json!([address]);
    //     self.helius_rpc_call("getSignaturesForAddress", params)
    //         .await
    // }

    // /// Fetch assets owned by a given address.
    // async fn get_assets_by_owner(&self, owner: &str) -> Result<AssetsResponse, SdkError> {
    //     if owner.trim().is_empty() {
    //         return Err(SdkError::InvalidInput(
    //             "Owner address cannot be empty".to_string(),
    //         ));
    //     }

    //     let params = json!([owner, {"page": 1}]);
    //     self.helius_rpc_call("getAssetsByOwner", params).await
    // }

    // /// Fetch assets associated with a given creator.
    // async fn get_assets_by_creator(&self, creator: &str) -> Result<AssetsResponse, SdkError> {
    //     if creator.trim().is_empty() {
    //         return Err(SdkError::InvalidInput(
    //             "Creator cannot be empty".to_string(),
    //         ));
    //     }

    //     let params = json!([creator, {"page": 1}]);
    //     self.helius_rpc_call("getAssetsByCreator", params).await
    // }

    // /// Fetch assets associated with a given authority.
    // async fn get_assets_by_authority(
    //     &self,
    //     authority: &str,
    // ) -> Result<AssetsResponse, SdkError> {
    //     if authority.trim().is_empty() {
    //         return Err(SdkError::InvalidInput(
    //             "Authority cannot be empty".to_string(),
    //         ));
    //     }

    //     let params = json!([authority, {"page": 1}]);
    //     self.helius_rpc_call("getAssetsByAuthority", params).await
    // }

    // /// Fetch signatures related to a specific asset.
    // async fn get_signatures_for_asset(
    //     &self,
    //     asset: &str,
    // ) -> Result<SignaturesResponse, SdkError> {
    //     if asset.trim().is_empty() {
    //         return Err(SdkError::InvalidInput("Asset cannot be empty".to_string()));
    //     }

    //     let params = json!([asset]);
    //     self.helius_rpc_call("getSignaturesForAsset", params).await
    // }

    // /// A generic method for making Helius RPC calls that return typed responses.
    // async fn helius_rpc_call<T: for<'de> Deserialize<'de>>(
    //     &self,
    //     method: &str,
    //     params: Value,
    // ) -> Result<T, SdkError> {
    //     let url = self.get_helius_rpc_url();

    //     let payload = json!({
    //         "jsonrpc": "2.0",
    //         "id": 1,
    //         "method": method,
    //         "params": params
    //     });

    //     let response = self
    //         .client
    //         .post(&url)
    //         .header("Content-Type", "application/json")
    //         .json(&payload)
    //         .send()
    //         .await
    //         .map_err(|e| {
    //             error!("Failed to send request to Helius: {}", e);
    //             SdkError::NetworkError(format!("Failed to send request: {}", e))
    //         })?;

    //     if response.status().is_success() {
    //         let result: T = response.json().await.map_err(|e| {
    //             error!("Failed to parse RPC response for method {}: {}", method, e);
    //             SdkError::Unexpected(format!("Failed to parse response: {}", e))
    //         })?;
    //         Ok(result)
    //     } else {
    //         error!(
    //             "Helius RPC returned a non-success status {} for method {}",
    //             response.status(),
    //             method
    //         );
    //         Err(SdkError::ApiRequestFailed(response.status().to_string()))
    //     }
    // }

    // // Below are all RPC calls structured consistently with the helius_rpc_call method.
    // async fn get_balance(&self, address: &str) -> Result<GetBalanceResponse, SdkError> {
    //     let params = json!([address]);
    //     self.helius_rpc_call("getBalance", params).await
    // }

    // async fn get_block_height(&self) -> Result<GetBlockHeightResponse, SdkError> {
    //     let params = json!([]);
    //     self.helius_rpc_call("getBlockHeight", params).await
    // }

    // async fn get_block_production(&self) -> Result<GetBlockProductionResponse, SdkError> {
    //     let params = json!([]);
    //     self.helius_rpc_call("getBlockProduction", params).await
    // }

    // async fn get_block_commitment(
    //     &self,
    //     slot: u64,
    // ) -> Result<GetBlockCommitmentResponse, SdkError> {
    //     let params = json!([slot]);
    //     self.helius_rpc_call("getBlockCommitment", params).await
    // }

    // async fn get_blocks(
    //     &self,
    //     start_slot: u64,
    //     end_slot: u64,
    // ) -> Result<GetBlocksResponse, SdkError> {
    //     let params = if start_slot == end_slot {
    //         json!([start_slot])
    //     } else {
    //         json!([start_slot, end_slot])
    //     };
    //     self.helius_rpc_call("getBlocks", params).await
    // }

    // async fn get_block_time(&self, slot: u64) -> Result<GetBlockTimeResponse, SdkError> {
    //     let params = json!([slot]);
    //     self.helius_rpc_call("getBlockTime", params).await
    // }

    // async fn get_cluster_nodes(&self) -> Result<GetClusterNodesResponse, SdkError> {
    //     let params = json!([]);
    //     self.helius_rpc_call("getClusterNodes", params).await
    // }

    // async fn get_epoch_info(&self) -> Result<GetEpochInfoResponse, SdkError> {
    //     let params = json!([]);
    //     self.helius_rpc_call("getEpochInfo", params).await
    // }

    // async fn get_epoch_schedule(&self) -> Result<GetEpochScheduleResponse, SdkError> {
    //     let params = json!([]);
    //     self.helius_rpc_call("getEpochSchedule", params).await
    // }

    // async fn get_fee_for_message(
    //     &self,
    //     message: &str,
    // ) -> Result<GetFeeForMessageResponse, SdkError> {
    //     let params = json!([message]);
    //     self.helius_rpc_call("getFeeForMessage", params).await
    // }

    // async fn get_first_available_block(
    //     &self,
    // ) -> Result<GetFirstAvailableBlockResponse, SdkError> {
    //     let params = json!([]);
    //     self.helius_rpc_call("getFirstAvailableBlock", params).await
    // }

    // async fn get_genesis_hash(&self) -> Result<GetGenesisHashResponse, SdkError> {
    //     let params = json!([]);
    //     self.helius_rpc_call("getGenesisHash", params).await
    // }

    // async fn get_health(&self) -> Result<GetHealthResponse, SdkError> {
    //     let params = json!([]);
    //     self.helius_rpc_call("getHealth", params).await
    // }

    // async fn get_highest_snapshot_slot(
    //     &self,
    // ) -> Result<GetHighestSnapshotSlotResponse, SdkError> {
    //     let params = json!([]);
    //     self.helius_rpc_call("getHighestSnapshotSlot", params).await
    // }

    // async fn get_identity(&self) -> Result<GetIdentityResponse, SdkError> {
    //     let params = json!([]);
    //     self.helius_rpc_call("getIdentity", params).await
    // }

    // async fn get_inflation_governor(&self) -> Result<GetInflationGovernorResponse, SdkError> {
    //     let params = json!([]);
    //     self.helius_rpc_call("getInflationGovernor", params).await
    // }

    // async fn get_inflation_rate(&self) -> Result<GetInflationRateResponse, SdkError> {
    //     let params = json!([]);
    //     self.helius_rpc_call("getInflationRate", params).await
    // }

    // async fn get_largest_accounts(&self) -> Result<GetLargestAccountsResponse, SdkError> {
    //     let params = json!([]);
    //     self.helius_rpc_call("getLargestAccounts", params).await
    // }

    // async fn get_latest_blockhash(&self) -> Result<GetLatestBlockhashResponse, SdkError> {
    //     let params = json!([]);
    //     self.helius_rpc_call("getLatestBlockhash", params).await
    // }

    // async fn get_leader_schedule(&self) -> Result<GetLeaderScheduleResponse, SdkError> {
    //     let params = json!([]);
    //     self.helius_rpc_call("getLeaderSchedule", params).await
    // }

    // async fn get_max_retransmit_slot(&self) -> Result<GetMaxRetransmitSlotResponse, SdkError> {
    //     let params = json!([]);
    //     self.helius_rpc_call("getMaxRetransmitSlot", params).await
    // }

    // async fn get_max_shred_insert_slot(
    //     &self,
    // ) -> Result<GetMaxShredInsertSlotResponse, SdkError> {
    //     let params = json!([]);
    //     self.helius_rpc_call("getMaxShredInsertSlot", params).await
    // }

    // async fn get_minimum_balance_for_rent_exemption(
    //     &self,
    //     data_len: u64,
    // ) -> Result<GetMinimumBalanceForRentExemptionResponse, SdkError> {
    //     let params = json!([data_len]);
    //     self.helius_rpc_call("getMinimumBalanceForRentExemption", params)
    //         .await
    // }

    // async fn get_program_accounts(
    //     &self,
    //     program_id: &str,
    // ) -> Result<GetProgramAccountsResponse, SdkError> {
    //     let params = json!([program_id]);
    //     self.helius_rpc_call("getProgramAccounts", params).await
    // }

    // async fn get_recent_performance_samples(
    //     &self,
    //     limit: u64,
    // ) -> Result<GetRecentPerformanceSamplesResponse, SdkError> {
    //     let params = json!([limit]);
    //     self.helius_rpc_call("getRecentPerformanceSamples", params)
    //         .await
    // }

    // async fn get_slot(&self) -> Result<GetSlotResponse, SdkError> {
    //     let params = json!([]);
    //     self.helius_rpc_call("getSlot", params).await
    // }

    // async fn get_slot_leader(&self) -> Result<GetSlotLeaderResponse, SdkError> {
    //     let params = json!([]);
    //     self.helius_rpc_call("getSlotLeader", params).await
    // }

    // async fn get_stake_activation(
    //     &self,
    //     account: &str,
    //     epoch: Option<u64>,
    // ) -> Result<GetStakeActivationResponse, SdkError> {
    //     let params = if let Some(e) = epoch {
    //         json!([account, {"epoch": e}])
    //     } else {
    //         json!([account])
    //     };
    //     self.helius_rpc_call("getStakeActivation", params).await
    // }

    // async fn get_stake_minimum_delegation(
    //     &self,
    // ) -> Result<GetStakeMinimumDelegationResponse, SdkError> {
    //     let params = json!([]);
    //     self.helius_rpc_call("getStakeMinimumDelegation", params)
    //         .await
    // }

    // async fn get_supply(&self) -> Result<GetSupplyResponse, SdkError> {
    //     let params = json!([]);
    //     self.helius_rpc_call("getSupply", params).await
    // }

    // async fn get_token_account_balance(
    //     &self,
    //     pubkey: &str,
    // ) -> Result<GetTokenAccountBalanceResponse, SdkError> {
    //     let params = json!([pubkey]);
    //     self.helius_rpc_call("getTokenAccountBalance", params).await
    // }

    // async fn get_token_largest_accounts(
    //     &self,
    //     mint: &str,
    // ) -> Result<GetTokenLargestAccountsResponse, SdkError> {
    //     let params = json!([mint]);
    //     self.helius_rpc_call("getTokenLargestAccounts", params)
    //         .await
    // }

    // async fn get_token_supply(&self, mint: &str) -> Result<GetTokenSupplyResponse, SdkError> {
    //     let params = json!([mint]);
    //     self.helius_rpc_call("getTokenSupply", params).await
    // }

    // async fn get_transaction(
    //     &self,
    //     signature: &str,
    // ) -> Result<GetTransactionResponse, SdkError> {
    //     let params = json!([signature]);
    //     self.helius_rpc_call("getTransaction", params).await
    // }

    // async fn get_transaction_count(&self) -> Result<GetTransactionCountResponse, SdkError> {
    //     let params = json!([]);
    //     self.helius_rpc_call("getTransactionCount", params).await
    // }

    // async fn get_version(&self) -> Result<GetVersionResponse, SdkError> {
    //     let params = json!([]);
    //     self.helius_rpc_call("getVersion", params).await
    // }

    // async fn get_vote_accounts(&self) -> Result<GetVoteAccountsResponse, SdkError> {
    //     let params = json!([]);
    //     self.helius_rpc_call("getVoteAccounts", params).await
    // }

    // async fn is_blockhash_valid(
    //     &self,
    //     blockhash: &str,
    // ) -> Result<IsBlockhashValidResponse, SdkError> {
    //     let params = json!([blockhash]);
    //     self.helius_rpc_call("isBlockhashValid", params).await
    // }

    // async fn minimum_ledger_slot(&self) -> Result<MinimumLedgerSlotResponse, SdkError> {
    //     let params = json!([]);
    //     self.helius_rpc_call("minimumLedgerSlot", params).await
    // }

    // async fn get_account_info(
    //     &self,
    //     address: &str,
    // ) -> Result<GetAccountInfoResponse, SdkError> {
    //     let params = json!([address]);
    //     self.helius_rpc_call("getAccountInfo", params).await
    // }
}
