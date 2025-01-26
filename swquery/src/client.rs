use {
    crate::{errors::SdkError, models::*, utils::*},
    reqwest::Client,
    reqwest::header::{HeaderMap, HeaderValue, USER_AGENT},
    serde_json::{self, json, Value},
    std::time::Duration,
    tracing::error,
    std::collections::HashMap,
};

const AGENT_API_URL: &str = 
    "http://0.0.0.0:5500/agent/generate-query";
    // "https://api.swquery.xyz/agent/generate-query";

/// Enum to represent the Solana network.
#[derive(Debug, Clone, Copy, Default)]
pub enum Network {
    #[default]
    Mainnet,
    Devnet,
}

/// SWqueryClient is the main entry point for using this SDK to interact with
/// the Solana RPC via the Helius API and a custom Agent API. It provides typed
/// methods for various RPC calls.
#[derive(Debug)]
pub struct SWqueryClient {
    /// The API key for the Agent server.
    pub openai_key: String,
    /// The Helius API key for RPC calls.
    pub helius_key: String,
    /// The timeout for requests.
    pub timeout: Duration,
    /// The network to use for Helius RPC calls.
    pub network: Network,
    /// A reusable reqwest client.
    client: Client,
}

pub struct SWqueryResponse {
    pub response: serde_json::Value,
    pub response_type: String,
}

impl SWqueryClient {
    /// Constructs a new SWqueryClient.
    ///
    /// # Arguments
    ///
    /// * `openai_api_key` - The API key for the agent.
    /// * `helius_api_key` - The API key for Helius RPC.
    /// * `timeout` - Optional request timeout, defaults to 5 seconds if None.
    /// * `network` - Optional network, defaults to Mainnet if None.
    ///
    /// # Returns
    ///
    /// A new instance of SWqueryClient.
    pub fn new(
        openai_key: String,
        helius_key: String,
        timeout: Option<Duration>,
        network: Option<Network>,
    ) -> Self {
        SWqueryClient {
            openai_key,
            helius_key,
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
                self.helius_key
            ),
            Network::Devnet => {
                format!("https://devnet.helius-rpc.com/?api-key={}", self.helius_key)
            }
        }
    }

    /// # Arguments
    ///
    /// * `input` - User input or query for the agent.
    /// * `pubkey` - The public key (address) related to the query.
    ///
    /// # Returns
    ///
    /// A JSON value representing the RPC response, or an error if something
    /// went wrong.
    pub async fn query(&self, input: &str, pubkey: &str) -> Result<SWqueryResponse, SdkError> {
        println!(
            "Querying...\nInput: {}\nPubkey: {}\nHelius Key: {}\nOpenAI Key: {}",
            input, pubkey, self.helius_key, self.openai_key
        );

        // Send the request to the Agent API
        let payload = json!({
            "inputUser": input,
            "address": pubkey,
            "openai_key": self.openai_key
        });

        let mut res_type = "transactions";

        println!("Sending request to Agent API: {:#?}", payload);
        let response = self
            .client
            .post(AGENT_API_URL)
            .header("x-api-key", "WDAO4Z1Z503DWJH7060GIYGR0TWIIPBP")
            .json(&payload)
            .send()
            .await
            .map_err(|e| {
                error!("Failed to send request to Agent: {:?}", e);
                println!("Failed to send request to Agent: {:?}", e);
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

        // Extract filters early
        let filters = result["result"]["params"]["filters"].clone();
        println!("Extracted filters: {:#?}", filters);

        let response_type = result["result"]["response"]
            .as_str()
            .ok_or_else(|| SdkError::Unexpected("Missing response field".to_string()))?;
        println!("Response type: {}", response_type);

        let params = result["result"].get("params").ok_or_else(|| {
            SdkError::InvalidInput("Missing 'params' field in response.".to_string())
        })?;
        println!("Params: {:#?}", params);

        // Handle all the supported RPC calls based on response_type
        let mut response: serde_json::Value = serde_json::Value::Null;
        match response_type {
            "getRecentTransactions" => {
                let address = get_optional_str_param(params, "address").unwrap_or_default();
                if address.is_empty() {
                    return Err(SdkError::InvalidInput(
                        "Missing address parameter".to_string(),
                    ));
                }
                let days: u64 = get_optional_u64_param(params, "days", 1);

                let response_unparsed = self.get_recent_transactions(address, days).await?;
                response = to_value_response(response_unparsed).unwrap();
                res_type = "transactions";
            }
            "getSignaturesForAddressPeriod" => {
                let address = get_optional_str_param(params, "address").unwrap_or_default();
                if address.is_empty() {
                    return Err(SdkError::InvalidInput(
                        "Missing address parameter".to_string(),
                    ));
                }

                let from = get_optional_u64_param(params, "from", 0);
                let to = get_optional_u64_param(params, "to", 0);

                let response_unparsed = self
                    .get_signatures_for_address(address, Some(from), Some(to))
                    .await?;
                response = to_value_response(response_unparsed).unwrap();
                res_type = "signatures";
            }
            "getSignaturesForAddress" => {
                let address = get_required_str_param(params, "address")?;
                let response_unparsed =
                    self.get_signatures_for_address(address, None, None).await?;
                response = to_value_response(response_unparsed).unwrap();
                res_type = "signatures";
            }
            "getTrendingTokens" => {
                let response_unparsed = self.get_trending_tokens().await?;
                response = to_value_response(response_unparsed).unwrap();
                res_type = "tokens";
            }
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
            //  }
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
            _ => {
                // // Check if it's a Solana RPC query with filters
                // if result["result"].get("filters").is_some() {
                //     let filters = result["result"]["filters"].clone();
                //     let days = get_optional_u64_param(&result["result"], "days", 30);
                //     let transactions = self.get_recent_transactions(pubkey, days).await?;
                //     let filtered_transactions = apply_filters(transactions, &filters)?;
                //     response = to_value_response(filtered_transactions).unwrap();
                // } else {
                // Format error response according to template
                response = json!({
                    "response": "We recognized your request as a Solana RPC query, but no implemented method is available.",
                    "status": "error"
                });
                // }
            }
        };

        // Apply filters if they exist and response contains transactions
        if let Some(filters) = filters.as_array() {
            println!("Filters: {:#?}", filters);
            if !filters.is_empty() && !response.is_null() {
                if let Ok(transactions) =
                    serde_json::from_value::<Vec<FullTransaction>>(response.clone())
                {
                    if !transactions.is_empty() {
                        println!("Applying filters to {} transactions", transactions.len());
                        let filtered_transactions =
                            apply_filters(transactions, &Value::Array(filters.to_vec()))?;
                        response = serde_json::to_value(filtered_transactions)
                            .map_err(|e| SdkError::ParseError(e.to_string()))?;
                    }
                }
            }
        }



        Ok( SWqueryResponse {response: response, response_type: res_type.to_string()} )
    }

    /// Fetch recent transactions for the last 'n' days using Helius RPC.
    /// This method bypasses `helius_rpc_call` for demonstration, but could be
    /// refactored.
    pub async fn get_recent_transactions(
        &self,
        address: &str,
        days: u64,
    ) -> Result<Vec<FullTransaction>, SdkError> {
        validate_address(address)?;

        // Calculate timestamp range
        let now = chrono::Utc::now().timestamp();
        let from_timestamp = now - (days as i64 * 24 * 60 * 60);

        let url = self.get_helius_rpc_url();

        // Get signatures
        let signatures_response = get_signatures(&self.client, &url, address).await?;
        println!("Fetched {} signatures", signatures_response.result.len());

        // Process signatures and get transaction details
        let mut transactions = Vec::new();
        for signature_info in signatures_response.result {
            // Get block time
            let block_time = if let Some(bt) = signature_info.blockTime {
                bt
            } else {
                get_block_time(&self.client, &url, signature_info.slot).await?
            };

            // Filter by timestamp
            if !is_within_timerange(block_time, Some(from_timestamp as u64), None) {
                continue;
            }

            // Get full transaction details
            match get_transaction_details_with_info(
                &self.client,
                &url,
                &signature_info.signature,
                &address,
            )
            .await
            {
                Ok(transaction) => transactions.push(transaction),
                Err(e) => eprintln!("Error getting transaction details: {}", e),
            }
        }

        println!("Total transactions fetched: {}", transactions.len());
        // println!("Transactions: {:#?}", transactions);

        Ok(transactions)
    }

    // /// Fetch signatures for a specific address within a given time period.
    async fn get_signatures_for_address_period(
        &self,
        address: &str,
        from: u64,
        to: u64,
    ) -> Result<SignaturesResponse, SdkError> {
        if address.trim().is_empty() {
            return Err(SdkError::InvalidInput(
                "Address cannot be empty".to_string(),
            ));
        }

        let url = self.get_helius_rpc_url();
        let payload = json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getSignaturesForAddress",
            "params": [
                address,
                {
                    "before": to,
                    "after": from,
                    "commitment": "finalized"
                }
            ]
        });

        let response = self
            .client
            .post(&url)
            .json(&payload)
            .send()
            .await
            .map_err(|e| SdkError::NetworkError(e.to_string()))?;

        if response.status().is_success() {
            let result: SignaturesResponse = response
                .json()
                .await
                .map_err(|e| SdkError::Unexpected(format!("Failed to parse response: {}", e)))?;
            Ok(result)
        } else {
            Err(SdkError::ApiRequestFailed(response.status().to_string()))
        }
    }

    /// Fetch transaction signatures for a specific address.
    async fn get_signatures_for_address(
        &self,
        address: &str,
        from: Option<u64>,
        to: Option<u64>,
    ) -> Result<SignaturesResponse, SdkError> {
        if address.trim().is_empty() {
            return Err(SdkError::InvalidInput(
                "Address cannot be empty".to_string(),
            ));
        }

        let url = self.get_helius_rpc_url();

        // Get signatures using helper
        let mut signatures_response = get_signatures(&self.client, &url, address).await?;

        // Filter signatures
        let mut filtered_signatures = Vec::new();
        for signature_info in signatures_response.result {
            let block_time = if let Some(bt) = signature_info.blockTime {
                bt
            } else {
                // Get block time using helper
                get_block_time(&self.client, &url, signature_info.slot).await?
            };

            // Apply timestamp filters
            let mut include_signature = true;

            if let Some(from_timestamp) = from {
                if block_time < from_timestamp {
                    include_signature = false;
                }
            }

            if let Some(to_timestamp) = to {
                if block_time > to_timestamp {
                    include_signature = false;
                }
            }

            if include_signature {
                filtered_signatures.push(signature_info);
            }
        }

        signatures_response.result = filtered_signatures;
        println!(
            "Total filtered signatures: {}",
            signatures_response.result.len()
        );

        Ok(signatures_response)
    }

    //make_rpc_call(&self.client,"getAssetsByOwner", "getAssetsByOwner",
    // params).await

    // /// Fetch assets owned by a given address.
    async fn get_assets_by_owner(&self, owner: &str) -> Result<AssetsResponse, SdkError> {
        if owner.trim().is_empty() {
            return Err(SdkError::InvalidInput(
                "Owner address cannot be empty".to_string(),
            ));
        }

        let params = json!([owner, {"page": 1}]);
        make_rpc_call(&self.client, "getAssetsByOwner", "getAssetsByOwner", params).await
    }

    /// Fetch assets associated with a given creator.
    async fn get_assets_by_creator(&self, creator: &str) -> Result<AssetsResponse, SdkError> {
        if creator.trim().is_empty() {
            return Err(SdkError::InvalidInput(
                "Creator cannot be empty".to_string(),
            ));
        }
        let params = json!([creator, { "page": 1 }]);
        make_rpc_call(
            &self.client,
            "getAssetsByCreator",
            "getAssetsByCreator",
            params,
        )
        .await
    }

    /// Fetch assets associated with a given authority.
    async fn get_assets_by_authority(&self, authority: &str) -> Result<AssetsResponse, SdkError> {
        if authority.trim().is_empty() {
            return Err(SdkError::InvalidInput(
                "Authority cannot be empty".to_string(),
            ));
        }
        let params = json!([authority, { "page": 1 }]);
        make_rpc_call(
            &self.client,
            &self.get_helius_rpc_url(),
            "getAssetsByAuthority",
            params,
        )
        .await
    }

    /// Fetch transaction signatures for a specific asset.
    async fn get_signatures_for_asset(&self, asset: &str) -> Result<SignaturesResponse, SdkError> {
        if asset.trim().is_empty() {
            return Err(SdkError::InvalidInput("Asset cannot be empty".to_string()));
        }
        let params = json!([asset]);

        make_rpc_call(
            &self.client,
            &self.get_helius_rpc_url(),
            "getSignaturesForAsset",
            params,
        )
        .await
    }

    /// Fetch the balance for a given address.
    async fn get_balance(&self, address: &str) -> Result<GetBalanceResponse, SdkError> {
        if address.trim().is_empty() {
            return Err(SdkError::InvalidInput(
                "Address cannot be empty".to_string(),
            ));
        }
        let params = json!([address]);
        make_rpc_call(
            &self.client,
            &self.get_helius_rpc_url(),
            "getBalance",
            params,
        )
        .await
    }

    /// Fetch the block height.
    async fn get_block_height(&self) -> Result<GetBlockHeightResponse, SdkError> {
        let params = json!([]);
        make_rpc_call(
            &self.client,
            &self.get_helius_rpc_url(),
            "getBlockHeight",
            params,
        )
        .await
    }

    /// Fetch block production.
    async fn get_block_production(&self) -> Result<GetBlockProductionResponse, SdkError> {
        let params = json!([]);
        make_rpc_call(
            &self.client,
            &self.get_helius_rpc_url(),
            "getBlockProduction",
            params,
        )
        .await
    }

    /// Fetch block commitment for a given slot.
    async fn get_block_commitment(
        &self,
        slot: u64,
    ) -> Result<GetBlockCommitmentResponse, SdkError> {
        let params = json!([slot]);
        make_rpc_call(
            &self.client,
            &self.get_helius_rpc_url(),
            "getBlockCommitment",
            params,
        )
        .await
    }

    /// Fetch blocks within a given slot range.
    async fn get_blocks(
        &self,
        start_slot: u64,
        end_slot: u64,
    ) -> Result<GetBlocksResponse, SdkError> {
        let params = if start_slot == end_slot {
            json!([start_slot])
        } else {
            json!([start_slot, end_slot])
        };
        make_rpc_call(
            &self.client,
            &self.get_helius_rpc_url(),
            "getBlocks",
            params,
        )
        .await
    }

    /// Fetch block time for a given slot.
    async fn get_block_time(&self, slot: u64) -> Result<GetBlockTimeResponse, SdkError> {
        let params = json!([slot]);
        make_rpc_call(
            &self.client,
            &self.get_helius_rpc_url(),
            "getBlockTime",
            params,
        )
        .await
    }

    /// Fetch the cluster nodes.
    async fn get_cluster_nodes(&self) -> Result<GetClusterNodesResponse, SdkError> {
        let params = json!([]);
        make_rpc_call(
            &self.client,
            &self.get_helius_rpc_url(),
            "getClusterNodes",
            params,
        )
        .await
    }

    /// Fetch the epoch schedule.
    async fn get_epoch_info(&self) -> Result<GetEpochInfoResponse, SdkError> {
        let params = json!([]);
        make_rpc_call(
            &self.client,
            &self.get_helius_rpc_url(),
            "getEpochInfo",
            params,
        )
        .await
    }

    /// Fetch the epoch schedule.
    async fn get_supply(&self) -> Result<GetSupplyResponse, SdkError> {
        let params = json!([]);
        make_rpc_call(
            &self.client,
            &self.get_helius_rpc_url(),
            "getSupply",
            params,
        )
        .await
    }

    /// Fetch the fee for a given message.
    async fn get_token_account_balance(
        &self,
        pubkey: &str,
    ) -> Result<GetTokenAccountBalanceResponse, SdkError> {
        if pubkey.trim().is_empty() {
            return Err(SdkError::InvalidInput("Pubkey cannot be empty".to_string()));
        }
        let params = json!([pubkey]);
        make_rpc_call(
            &self.client,
            &self.get_helius_rpc_url(),
            "getTokenAccountBalance",
            params,
        )
        .await
    }

    /// Fetch the fee for a given message.
    async fn get_transaction(&self, signature: &str) -> Result<GetTransactionResponse, SdkError> {
        if signature.trim().is_empty() {
            return Err(SdkError::InvalidInput(
                "Signature cannot be empty".to_string(),
            ));
        }
        let params = json!([signature]);
        make_rpc_call(
            &self.client,
            &self.get_helius_rpc_url(),
            "getTransaction",
            params,
        )
        .await
    }

    pub async fn get_trending_tokens(&self) -> Result<Vec<TokenData>, SdkError> {
        let phantom_url = "https://api.phantom.app/explore/v2/trending-tokens?timeFrame=24h&sortBy=rank&sortDirection=asc&limit=100&rankAlgo=default&platform=extension&locale=pt&appVersion=24.30.0&chainIds%5B%5D=solana%3A101";

        let response = self.client
            .get(phantom_url)
            .header(USER_AGENT, "Mozilla/5.0")
            .send()
            .await
            .map_err(|e| {
                error!("Falha ao enviar requisição para Phantom: {:?}", e);
                SdkError::RequestFailed
            })?;

        println!("Phantom status: {}", response.status());

        if !response.status().is_success() {
            error!("Requisição falhou com status: {}", response.status());
            return Err(SdkError::RequestFailed);
        }

        let trending_tokens_response: GetTrendingTokensResponse = response.json().await.map_err(|e| {
            error!("Falha ao desserializar resposta da Phantom: {:?}", e);
            SdkError::ParseError(e.to_string())
        })?;

        let top_tokens = trending_tokens_response.tokens.into_iter().take(5).collect();

        Ok(top_tokens)
    }
}
