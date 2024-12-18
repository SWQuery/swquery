pub mod errors;
pub mod llm;
pub mod parser;

use crate::errors::SdkError;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::HashMap;
use std::time::Duration;
use tracing::error;

/// A representation of a response from the getSignaturesForAddress RPC.
#[derive(Debug, Deserialize, Serialize)]
pub struct GetSignaturesForAddressResponse {
    pub result: Vec<Signature>,
}

/// A transaction signature entry.
#[derive(Debug, Deserialize, Serialize)]
pub struct Signature {
    pub block_time: u64,
    pub confirmation_status: String,
    pub err: Value,
    pub memo: Option<String>,
    pub signature: String,
    pub slot: u64,
}

/// A recent transaction entry used by `getRecentTransactions`.
#[derive(Debug, Serialize, Deserialize)]
pub struct RecentTransaction {
    pub signature: String,
    pub slot: u64,
    pub timestamp: u64,
    pub status: String,
}

/// Response structure for `getRecentTransactions`.
#[derive(Debug, Serialize, Deserialize)]
pub struct RecentTransactionsResponse {
    pub jsonrpc: String,
    pub result: Vec<RecentTransaction>,
    pub id: u64,
}

/// A single signature info object.
#[derive(Debug, Deserialize, Serialize)]
pub struct SignatureInfo {
    pub signature: String,
    pub slot: u64,
    #[allow(non_snake_case)]
    pub blockTime: Option<u64>,
    #[allow(non_snake_case)]
    pub confirmationStatus: String,
    pub err: Option<Value>,
}

/// Response structure for `getSignaturesForAddress` or similar.
#[derive(Debug, Deserialize, Serialize)]
pub struct SignaturesResponse {
    pub jsonrpc: String,
    pub result: Vec<SignatureInfo>,
    pub id: u64,
}

/// Represents an NFT or asset entry used by the `getAssetsByOwner`, etc.
#[derive(Debug, Deserialize, Serialize)]
pub struct Asset {
    pub id: String,
    pub content: Value,
    pub ownership: Value,
}

/// Response for asset-related RPCs.
#[derive(Debug, Deserialize, Serialize)]
pub struct AssetsResponse {
    pub jsonrpc: String,
    pub result: Vec<Asset>,
    pub id: String,
}

/// A generic RPC response format.
#[derive(Debug, Deserialize, Serialize)]
pub struct RpcResponse<T> {
    pub jsonrpc: String,
    pub result: T,
    pub id: Value,
}

/// Result for the getBalance RPC.
#[derive(Debug, Deserialize, Serialize)]
pub struct GetBalanceResult {
    pub value: u64,
}

/// Type alias for getBalance.
pub type GetBalanceResponse = RpcResponse<GetBalanceResult>;

/// Type alias for getBlockHeight.
pub type GetBlockHeightResponse = RpcResponse<u64>;

/// Represents the block production range for getBlockProduction.
#[derive(Debug, Deserialize, Serialize)]
pub struct BlockProductionRange {
    pub firstSlot: u64,
    pub lastSlot: u64,
}

/// Represents the result structure for getBlockProduction.
#[derive(Debug, Deserialize, Serialize)]
pub struct BlockProductionResult {
    pub byIdentity: HashMap<String, Vec<u64>>,
    pub range: BlockProductionRange,
}

/// Type alias for getBlockProduction.
pub type GetBlockProductionResponse = RpcResponse<BlockProductionResult>;

/// Represents the result structure for getBlockCommitment.
#[derive(Debug, Deserialize, Serialize)]
pub struct BlockCommitmentResult {
    pub commitment: Option<[u64; 2]>,
    pub totalStake: u64,
}

/// Type alias for getBlockCommitment.
pub type GetBlockCommitmentResponse = RpcResponse<BlockCommitmentResult>;

/// Type alias for getBlocks.
pub type GetBlocksResponse = RpcResponse<Vec<u64>>;

/// Type alias for getBlockTime.
pub type GetBlockTimeResponse = RpcResponse<Option<u64>>;

/// Represents a cluster node from getClusterNodes.
#[derive(Debug, Deserialize, Serialize)]
pub struct ClusterNode {
    pub pubkey: String,
    pub gossip: Option<String>,
    pub tpu: Option<String>,
    pub rpc: Option<String>,
    pub version: Option<String>,
    pub featureSet: Option<u64>,
    pub shredVersion: Option<u64>,
}

/// Type alias for getClusterNodes.
pub type GetClusterNodesResponse = RpcResponse<Vec<ClusterNode>>;

/// Represents epoch info for getEpochInfo.
#[derive(Debug, Deserialize, Serialize)]
pub struct EpochInfo {
    pub epoch: u64,
    pub slotIndex: u64,
    pub slotsInEpoch: u64,
    pub absoluteSlot: u64,
    pub blockHeight: u64,
    pub transactionCount: Option<u64>,
}

/// Type alias for getEpochInfo.
pub type GetEpochInfoResponse = RpcResponse<EpochInfo>;

/// Represents the epoch schedule structure for getEpochSchedule.
#[derive(Debug, Deserialize, Serialize)]
pub struct EpochSchedule {
    pub slotsPerEpoch: u64,
    pub leaderScheduleSlotOffset: u64,
    pub warmup: bool,
    pub firstNormalEpoch: u64,
    pub firstNormalSlot: u64,
}

/// Type alias for getEpochSchedule.
pub type GetEpochScheduleResponse = RpcResponse<EpochSchedule>;

/// Represents the fee for a given message in getFeeForMessage.
#[derive(Debug, Deserialize, Serialize)]
pub struct FeeForMessageValue {
    pub value: Option<u64>,
}

/// Type alias for getFeeForMessage.
pub type GetFeeForMessageResponse = RpcResponse<FeeForMessageValue>;

/// Type alias for getFirstAvailableBlock.
pub type GetFirstAvailableBlockResponse = RpcResponse<u64>;

/// Type alias for getGenesisHash.
pub type GetGenesisHashResponse = RpcResponse<String>;

/// Type alias for getHealth.
pub type GetHealthResponse = RpcResponse<String>;

/// Represents the highest snapshot slot for getHighestSnapshotSlot.
#[derive(Debug, Deserialize, Serialize)]
pub struct HighestSnapshotSlot {
    pub full: u64,
    pub incremental: u64,
}

/// Type alias for getHighestSnapshotSlot.
pub type GetHighestSnapshotSlotResponse = RpcResponse<HighestSnapshotSlot>;

/// Type alias for getIdentity.
pub type GetIdentityResponse = RpcResponse<String>;

/// Represents the inflation governor for getInflationGovernor.
#[derive(Debug, Deserialize, Serialize)]
pub struct InflationGovernor {
    pub foundation: f64,
    pub foundationTerm: f64,
    pub initial: f64,
    pub taper: f64,
    pub terminal: f64,
}

/// Type alias for getInflationGovernor.
pub type GetInflationGovernorResponse = RpcResponse<InflationGovernor>;

/// Represents the inflation rate info for getInflationRate.
#[derive(Debug, Deserialize, Serialize)]
pub struct InflationRate {
    pub epoch: u64,
    pub foundation: f64,
    pub total: f64,
    pub validator: f64,
}

/// Type alias for getInflationRate.
pub type GetInflationRateResponse = RpcResponse<InflationRate>;

/// Represents one of the largest accounts for getLargestAccounts.
#[derive(Debug, Deserialize, Serialize)]
pub struct LargestAccount {
    pub lamports: u64,
    pub address: String,
}

/// Type alias for getLargestAccounts.
pub type GetLargestAccountsResponse = RpcResponse<Vec<LargestAccount>>;

/// Represents the latest blockhash info for getLatestBlockhash.
#[derive(Debug, Deserialize, Serialize)]
pub struct LatestBlockhashResult {
    pub blockhash: String,
    pub lastValidBlockHeight: u64,
}

/// Type alias for getLatestBlockhash.
pub type GetLatestBlockhashResponse = RpcResponse<LatestBlockhashResult>;

/// Type alias for getLeaderSchedule (a map of leader to slots).
pub type GetLeaderScheduleResponse = RpcResponse<HashMap<String, Vec<u64>>>;

/// Type alias for getMaxRetransmitSlot.
pub type GetMaxRetransmitSlotResponse = RpcResponse<u64>;

/// Type alias for getMaxShredInsertSlot.
pub type GetMaxShredInsertSlotResponse = RpcResponse<u64>;

/// Type alias for getMinimumBalanceForRentExemption.
pub type GetMinimumBalanceForRentExemptionResponse = RpcResponse<u64>;

/// Represents account data for getProgramAccounts.
#[derive(Debug, Deserialize, Serialize)]
pub struct AccountData {
    pub lamports: u64,
    pub data: (String, String),
    pub owner: String,
    pub executable: bool,
    pub rentEpoch: u64,
}

/// A keyed account used in getProgramAccounts.
#[derive(Debug, Deserialize, Serialize)]
pub struct KeyedAccount {
    pub pubkey: String,
    pub account: AccountData,
}

/// Type alias for getProgramAccounts.
pub type GetProgramAccountsResponse = RpcResponse<Vec<KeyedAccount>>;

/// Represents a performance sample for getRecentPerformanceSamples.
#[derive(Debug, Deserialize, Serialize)]
pub struct PerformanceSample {
    pub slot: u64,
    pub numTransactions: u64,
    pub numSlots: u64,
    pub samplePeriodSecs: u64,
}

/// Type alias for getRecentPerformanceSamples.
pub type GetRecentPerformanceSamplesResponse = RpcResponse<Vec<PerformanceSample>>;

/// Type alias for getSlot.
pub type GetSlotResponse = RpcResponse<u64>;

/// Type alias for getSlotLeader.
pub type GetSlotLeaderResponse = RpcResponse<String>;

/// Represents stake activation info for getStakeActivation.
#[derive(Debug, Deserialize, Serialize)]
pub struct StakeActivation {
    pub state: String,
    pub active: u64,
    pub inactive: u64,
}

/// Type alias for getStakeActivation.
pub type GetStakeActivationResponse = RpcResponse<StakeActivation>;

/// Type alias for getStakeMinimumDelegation.
pub type GetStakeMinimumDelegationResponse = RpcResponse<u64>;

/// Represents supply values for getSupply.
#[derive(Debug, Deserialize, Serialize)]
pub struct SupplyValue {
    pub circulating: u64,
    pub nonCirculating: u64,
    pub nonCirculatingAccountsList: Vec<String>,
    pub total: u64,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct SupplyResult {
    pub value: SupplyValue,
}

/// Type alias for getSupply.
pub type GetSupplyResponse = RpcResponse<SupplyResult>;

/// Represents a UI token amount in account balances.
#[derive(Debug, Deserialize, Serialize)]
pub struct UiTokenAmount {
    pub uiAmount: Option<f64>,
    pub amount: String,
    pub decimals: u8,
    pub uiAmountString: String,
}

/// Token balance result for getTokenAccountBalance.
#[derive(Debug, Deserialize, Serialize)]
pub struct TokenBalanceResult {
    pub value: UiTokenAmount,
}

/// Type alias for getTokenAccountBalance.
pub type GetTokenAccountBalanceResponse = RpcResponse<TokenBalanceResult>;

/// Represents a largest account for a token mint from getTokenLargestAccounts.
#[derive(Debug, Deserialize, Serialize)]
pub struct TokenLargestAccount {
    pub address: String,
    pub lamports: u64,
    pub uiAmount: Option<f64>,
    pub decimals: u8,
    pub uiAmountString: String,
}

/// Type alias for getTokenLargestAccounts.
pub type GetTokenLargestAccountsResponse = RpcResponse<Vec<TokenLargestAccount>>;

/// Represents token supply info from getTokenSupply.
#[derive(Debug, Deserialize, Serialize)]
pub struct TokenSupplyValue {
    pub amount: String,
    pub decimals: u8,
    pub uiAmount: Option<f64>,
    pub uiAmountString: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct TokenSupplyResult {
    pub value: TokenSupplyValue,
}

/// Type alias for getTokenSupply.
pub type GetTokenSupplyResponse = RpcResponse<TokenSupplyResult>;

/// Represents the metadata of a transaction.
#[derive(Debug, Deserialize, Serialize)]
pub struct TransactionMeta {
    pub err: Option<Value>,
    pub fee: Option<u64>,
    #[serde(default)]
    pub preBalances: Vec<u64>,
    #[serde(default)]
    pub postBalances: Vec<u64>,
    #[serde(default)]
    pub innerInstructions: Vec<Value>,
    #[serde(default)]
    pub logMessages: Vec<String>,
    #[serde(default)]
    pub preTokenBalances: Vec<Value>,
    #[serde(default)]
    pub postTokenBalances: Vec<Value>,
    #[serde(default)]
    pub rewards: Vec<Value>,
    #[serde(default)]
    pub status: Value,
}

/// Represents an encoded transaction.
#[derive(Debug, Deserialize, Serialize)]
pub struct EncodedTransaction {
    #[serde(rename = "signatures")]
    pub signatures: Vec<String>,
    #[serde(rename = "message")]
    pub message: Value,
}

/// Represents the result of getTransaction.
#[derive(Debug, Deserialize, Serialize)]
pub struct TransactionResult {
    pub slot: u64,
    pub transaction: EncodedTransaction,
    pub meta: Option<TransactionMeta>,
    pub blockTime: Option<u64>,
}

/// Type alias for getTransaction.
pub type GetTransactionResponse = RpcResponse<TransactionResult>;

/// Type alias for getTransactionCount.
pub type GetTransactionCountResponse = RpcResponse<u64>;

/// Represents the version info for getVersion.
#[derive(Debug, Deserialize, Serialize)]
pub struct VersionInfo {
    #[serde(rename = "solana-core")]
    pub solana_core: String,
}

/// Type alias for getVersion.
pub type GetVersionResponse = RpcResponse<VersionInfo>;

/// Represents a vote account info entry for getVoteAccounts.
#[derive(Debug, Deserialize, Serialize)]
pub struct VoteAccountInfo {
    pub votePubkey: String,
    pub nodePubkey: String,
    pub activatedStake: u64,
    pub epochVoteAccount: bool,
    pub commission: u8,
    #[serde(default)]
    pub lastVote: u64,
    #[serde(default)]
    pub epochCredits: Vec<Value>,
}

/// Represents the result of getVoteAccounts.
#[derive(Debug, Deserialize, Serialize)]
pub struct VoteAccountsResult {
    pub current: Vec<VoteAccountInfo>,
    pub delinquent: Vec<VoteAccountInfo>,
}

/// Type alias for getVoteAccounts.
pub type GetVoteAccountsResponse = RpcResponse<VoteAccountsResult>;

/// Represents the context for isBlockhashValid.
#[derive(Debug, Deserialize, Serialize)]
pub struct Context {
    pub slot: u64,
}

/// Represents the result of isBlockhashValid.
#[derive(Debug, Deserialize, Serialize)]
pub struct IsBlockhashValidResult {
    pub context: Context,
    pub value: bool,
}

/// Type alias for isBlockhashValid.
pub type IsBlockhashValidResponse = RpcResponse<IsBlockhashValidResult>;

/// Type alias for minimumLedgerSlot.
pub type MinimumLedgerSlotResponse = RpcResponse<u64>;

/// Represents account info for getAccountInfo.
#[derive(Debug, Deserialize, Serialize)]
pub struct AccountInfoValue {
    pub lamports: u64,
    pub data: (String, String),
    pub owner: String,
    pub executable: bool,
    pub rentEpoch: u64,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct AccountInfoResult {
    pub value: Option<AccountInfoValue>,
}

/// Type alias for getAccountInfo.
pub type GetAccountInfoResponse = RpcResponse<AccountInfoResult>;

/// SWqueryClient is the main entry point for using this SDK to interact with the Solana RPC
/// via the Helius API and a custom Agent API. It provides typed methods for various RPC calls.
#[derive(Debug)]
pub struct SWqueryClient {
    /// The API key for the Agent server.
    pub api_key: String,
    /// The Helius API key for RPC calls.
    pub helius_api_key: String,
    /// The base URL for the Agent API.
    pub base_url: String,
    /// The timeout for requests.
    pub timeout: Duration,
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
    ///
    /// # Returns
    ///
    /// A new instance of SWqueryClient.
    pub fn new(api_key: String, helius_api_key: String, timeout: Option<Duration>) -> Self {
        SWqueryClient {
            api_key,
            helius_api_key,
            base_url: "http://0.0.0.0:5500/agent/generate-query".to_string(),
            timeout: timeout.unwrap_or(Duration::from_secs(5)),
            client: Client::builder()
                .timeout(timeout.unwrap_or(Duration::from_secs(5)))
                .build()
                .expect("Failed to build reqwest client"),
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
            .post(&self.base_url)
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

        let params = result["result"]
            .get("params")
            .ok_or_else(|| SdkError::InvalidInput("Missing 'params' field in response.".to_string()))?;
        println!("Params: {:#?}", params);

        // Helper functions for parameter extraction
        fn get_required_str_param<'a>(params: &'a serde_json::Value, field: &str) -> Result<&'a str, SdkError> {
            params[field]
                .as_str()
                .ok_or_else(|| SdkError::InvalidInput(format!("Missing {} parameter", field)))
        }

        fn get_optional_str_param<'a>(params: &'a serde_json::Value, field: &str) -> Option<&'a str> {
            params[field].as_str()
        }

        fn get_optional_u64_param(params: &serde_json::Value, field: &str, default: u64) -> u64 {
            params[field].as_u64().unwrap_or(default)
        }

        fn get_required_u64_param(params: &serde_json::Value, field: &str) -> Result<u64, SdkError> {
            params[field]
                .as_u64()
                .ok_or_else(|| SdkError::InvalidInput(format!("Missing {} parameter", field)))
        }

        // Helper to serialize response to Value
        fn to_value_response<T: serde::Serialize>(response: T) -> Result<serde_json::Value, SdkError> {
            serde_json::to_value(response).map_err(|e| SdkError::Unexpected(e.to_string()))
        }

        // Handle all the supported RPC calls based on response_type
        match response_type {
            "getRecentTransactions" => {
                let address = get_optional_str_param(params, "address").unwrap_or_default();
                if address.is_empty() {
                    return Err(SdkError::InvalidInput("Missing address parameter".to_string()));
                }
                let days = get_optional_u64_param(params, "days", 1);

                let response = self.get_recent_transactions(address, days).await?;
                to_value_response(response)
            }
            "getSignaturesForAddressPeriod" => {
                let address = get_optional_str_param(params, "address").unwrap_or_default();
                if address.is_empty() {
                    return Err(SdkError::InvalidInput("Missing address parameter".to_string()));
                }

                let from = get_optional_u64_param(params, "from", 0);
                let to = get_optional_u64_param(params, "to", 0);

                let response = self.get_signatures_for_address_period(address, from, to).await?;
                to_value_response(response)
            }
            "getSignaturesForAddress" => {
                let address = get_required_str_param(params, "address")?;
                let response = self.get_signatures_for_address(address).await?;
                to_value_response(response)
            }
            "getAssetsByOwner" => {
                let owner = get_required_str_param(params, "owner")?;
                let response = self.get_assets_by_owner(owner).await?;
                to_value_response(response)
            }
            "getAssetsByCreator" => {
                let creator = get_required_str_param(params, "creator")?;
                let response = self.get_assets_by_creator(creator).await?;
                to_value_response(response)
            }
            "getAssetsByAuthority" => {
                let authority = get_required_str_param(params, "authority")?;
                let response = self.get_assets_by_authority(authority).await?;
                to_value_response(response)
            }
            "getSignaturesForAsset" => {
                let asset = get_required_str_param(params, "asset")?;
                let response = self.get_signatures_for_asset(asset).await?;
                to_value_response(response)
            }
            "getBalance" => {
                let address = get_required_str_param(params, "address")?;
                let response = self.get_balance(address).await?;
                to_value_response(response)
            }
            "getBlockHeight" => {
                let response = self.get_block_height().await?;
                to_value_response(response)
            }
            "getBlockProduction" => {
                let response = self.get_block_production().await?;
                to_value_response(response)
            }
            "getBlockCommitment" => {
                let slot = get_required_u64_param(params, "slot")?;
                let response = self.get_block_commitment(slot).await?;
                to_value_response(response)
            }
            "getBlocks" => {
                let start_slot = get_required_u64_param(params, "start_slot")?;
                let end_slot = get_optional_u64_param(params, "end_slot", start_slot);
                let response = self.get_blocks(start_slot, end_slot).await?;
                to_value_response(response)
            }
            "getBlockTime" => {
                let slot = get_required_u64_param(params, "slot")?;
                let response = self.get_block_time(slot).await?;
                to_value_response(response)
            }
            "getClusterNodes" => {
                let response = self.get_cluster_nodes().await?;
                to_value_response(response)
            }
            "getEpochInfo" => {
                let response = self.get_epoch_info().await?;
                to_value_response(response)
            }
            "getEpochSchedule" => {
                let response = self.get_epoch_schedule().await?;
                to_value_response(response)
            }
            "getFeeForMessage" => {
                let message = get_required_str_param(params, "message")?;
                let response = self.get_fee_for_message(message).await?;
                to_value_response(response)
            }
            "getFirstAvailableBlock" => {
                let response = self.get_first_available_block().await?;
                to_value_response(response)
            }
            "getGenesisHash" => {
                let response = self.get_genesis_hash().await?;
                to_value_response(response)
            }
            "getHealth" => {
                let response = self.get_health().await?;
                to_value_response(response)
            }
            "getHighestSnapshotSlot" => {
                let response = self.get_highest_snapshot_slot().await?;
                to_value_response(response)
            }
            "getIdentity" => {
                let response = self.get_identity().await?;
                to_value_response(response)
            }
            "getInflationGovernor" => {
                let response = self.get_inflation_governor().await?;
                to_value_response(response)
            }
            "getInflationRate" => {
                let response = self.get_inflation_rate().await?;
                to_value_response(response)
            }
            "getLargestAccounts" => {
                let response = self.get_largest_accounts().await?;
                to_value_response(response)
            }
            "getLatestBlockhash" => {
                let response = self.get_latest_blockhash().await?;
                to_value_response(response)
            }
            "getLeaderSchedule" => {
                let response = self.get_leader_schedule().await?;
                to_value_response(response)
            }
            "getMaxRetransmitSlot" => {
                let response = self.get_max_retransmit_slot().await?;
                to_value_response(response)
            }
            "getMaxShredInsertSlot" => {
                let response = self.get_max_shred_insert_slot().await?;
                to_value_response(response)
            }
            "getMinimumBalanceForRentExemption" => {
                let data_len = get_required_u64_param(params, "data_len")?;
                let response = self.get_minimum_balance_for_rent_exemption(data_len).await?;
                to_value_response(response)
            }
            "getProgramAccounts" => {
                let program_id = get_required_str_param(params, "program_id")?;
                let response = self.get_program_accounts(program_id).await?;
                to_value_response(response)
            }
            "getRecentPerformanceSamples" => {
                let limit = get_optional_u64_param(params, "limit", 10);
                let response = self.get_recent_performance_samples(limit).await?;
                to_value_response(response)
            }
            "getSlot" => {
                let response = self.get_slot().await?;
                to_value_response(response)
            }
            "getSlotLeader" => {
                let response = self.get_slot_leader().await?;
                to_value_response(response)
            }
            "getStakeActivation" => {
                let account = get_required_str_param(params, "account")?;
                let epoch = params["epoch"].as_u64();
                let response = self.get_stake_activation(account, epoch).await?;
                to_value_response(response)
            }
            "getStakeMinimumDelegation" => {
                let response = self.get_stake_minimum_delegation().await?;
                to_value_response(response)
            }
            "getSupply" => {
                let response = self.get_supply().await?;
                to_value_response(response)
            }
            "getTokenAccountBalance" => {
                let pubkey = get_required_str_param(params, "pubkey")?;
                let response = self.get_token_account_balance(pubkey).await?;
                to_value_response(response)
            }
            "getTokenLargestAccounts" => {
                let mint = get_required_str_param(params, "mint")?;
                let response = self.get_token_largest_accounts(mint).await?;
                to_value_response(response)
            }
            "getTokenSupply" => {
                let mint = get_required_str_param(params, "mint")?;
                let response = self.get_token_supply(mint).await?;
                to_value_response(response)
            }
            "getTransaction" => {
                let signature = get_required_str_param(params, "signature")?;
                let response = self.get_transaction(signature).await?;
                to_value_response(response)
            }
            "getTransactionCount" => {
                let response = self.get_transaction_count().await?;
                to_value_response(response)
            }
            "getVersion" => {
                let response = self.get_version().await?;
                to_value_response(response)
            }
            "getVoteAccounts" => {
                let response = self.get_vote_accounts().await?;
                to_value_response(response)
            }
            "isBlockhashValid" => {
                let blockhash = get_required_str_param(params, "blockhash")?;
                let response = self.is_blockhash_valid(blockhash).await?;
                to_value_response(response)
            }
            "minimumLedgerSlot" => {
                let response = self.minimum_ledger_slot().await?;
                to_value_response(response)
            }
            "getAccountInfo" => {
                let address = get_required_str_param(params, "address")?;
                let response = self.get_account_info(address).await?;
                to_value_response(response)
            }
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
    ) -> Result<RecentTransactionsResponse, SdkError> {
        if address.trim().is_empty() {
            return Err(SdkError::InvalidInput("Address cannot be empty".to_string()));
        }

        let url = format!("https://mainnet.helius-rpc.com/?api-key={}", self.helius_api_key);
        let payload = json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getRecentTransactions",
            "params": [
                address,
                days,
                { "commitment": "finalized" }
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
            let result: RecentTransactionsResponse = response
                .json()
                .await
                .map_err(|e| SdkError::Unexpected(format!("Failed to parse response: {}", e)))?;
            Ok(result)
        } else {
            Err(SdkError::ApiRequestFailed(response.status().to_string()))
        }
    }

    /// Fetch signatures for a specific address within a given time period.
    pub async fn get_signatures_for_address_period(
        &self,
        address: &str,
        from: u64,
        to: u64,
    ) -> Result<SignaturesResponse, SdkError> {
        if address.trim().is_empty() {
            return Err(SdkError::InvalidInput("Address cannot be empty".to_string()));
        }

        let url = format!("https://mainnet.helius-rpc.com/?api-key={}", self.helius_api_key);
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

        let response = self.client.post(&url).json(&payload).send().await
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
    pub async fn get_signatures_for_address(
        &self,
        address: &str,
    ) -> Result<SignaturesResponse, SdkError> {
        if address.trim().is_empty() {
            return Err(SdkError::InvalidInput("Address cannot be empty".to_string()));
        }

        let params = json!([address]);
        self.helius_rpc_call("getSignaturesForAddress", params).await
    }

    /// Fetch assets owned by a given address.
    pub async fn get_assets_by_owner(&self, owner: &str) -> Result<AssetsResponse, SdkError> {
        if owner.trim().is_empty() {
            return Err(SdkError::InvalidInput("Owner address cannot be empty".to_string()));
        }

        let params = json!([owner, {"page": 1}]);
        self.helius_rpc_call("getAssetsByOwner", params).await
    }

    /// Fetch assets associated with a given creator.
    pub async fn get_assets_by_creator(&self, creator: &str) -> Result<AssetsResponse, SdkError> {
        if creator.trim().is_empty() {
            return Err(SdkError::InvalidInput("Creator cannot be empty".to_string()));
        }

        let params = json!([creator, {"page": 1}]);
        self.helius_rpc_call("getAssetsByCreator", params).await
    }

    /// Fetch assets associated with a given authority.
    pub async fn get_assets_by_authority(&self, authority: &str) -> Result<AssetsResponse, SdkError> {
        if authority.trim().is_empty() {
            return Err(SdkError::InvalidInput("Authority cannot be empty".to_string()));
        }

        let params = json!([authority, {"page": 1}]);
        self.helius_rpc_call("getAssetsByAuthority", params).await
    }

    /// Fetch signatures related to a specific asset.
    pub async fn get_signatures_for_asset(&self, asset: &str) -> Result<SignaturesResponse, SdkError> {
        if asset.trim().is_empty() {
            return Err(SdkError::InvalidInput("Asset cannot be empty".to_string()));
        }

        let params = json!([asset]);
        self.helius_rpc_call("getSignaturesForAsset", params).await
    }

    /// A generic method for making Helius RPC calls that return typed responses.
    async fn helius_rpc_call<T: for<'de> Deserialize<'de>>(
        &self,
        method: &str,
        params: Value,
    ) -> Result<T, SdkError> {
        let url = format!("https://mainnet.helius-rpc.com/?api-key={}", self.helius_api_key);

        let payload = json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": method,
            "params": params
        });

        let response = self
            .client
            .post(&url)
            .header("Content-Type", "application/json")
            .json(&payload)
            .send()
            .await
            .map_err(|e| {
                error!("Failed to send request to Helius: {}", e);
                SdkError::NetworkError(format!("Failed to send request: {}", e))
            })?;

        if response.status().is_success() {
            let result: T = response.json().await.map_err(|e| {
                error!("Failed to parse RPC response for method {}: {}", method, e);
                SdkError::Unexpected(format!("Failed to parse response: {}", e))
            })?;
            Ok(result)
        } else {
            error!(
                "Helius RPC returned a non-success status {} for method {}",
                response.status(),
                method
            );
            Err(SdkError::ApiRequestFailed(response.status().to_string()))
        }
    }

    // Below are all RPC calls structured consistently with the helius_rpc_call method.
    pub async fn get_balance(&self, address: &str) -> Result<GetBalanceResponse, SdkError> {
        let params = json!([address]);
        self.helius_rpc_call("getBalance", params).await
    }

    pub async fn get_block_height(&self) -> Result<GetBlockHeightResponse, SdkError> {
        let params = json!([]);
        self.helius_rpc_call("getBlockHeight", params).await
    }

    pub async fn get_block_production(&self) -> Result<GetBlockProductionResponse, SdkError> {
        let params = json!([]);
        self.helius_rpc_call("getBlockProduction", params).await
    }

    pub async fn get_block_commitment(
        &self,
        slot: u64,
    ) -> Result<GetBlockCommitmentResponse, SdkError> {
        let params = json!([slot]);
        self.helius_rpc_call("getBlockCommitment", params).await
    }

    pub async fn get_blocks(
        &self,
        start_slot: u64,
        end_slot: u64,
    ) -> Result<GetBlocksResponse, SdkError> {
        let params = if start_slot == end_slot {
            json!([start_slot])
        } else {
            json!([start_slot, end_slot])
        };
        self.helius_rpc_call("getBlocks", params).await
    }

    pub async fn get_block_time(&self, slot: u64) -> Result<GetBlockTimeResponse, SdkError> {
        let params = json!([slot]);
        self.helius_rpc_call("getBlockTime", params).await
    }

    pub async fn get_cluster_nodes(&self) -> Result<GetClusterNodesResponse, SdkError> {
        let params = json!([]);
        self.helius_rpc_call("getClusterNodes", params).await
    }

    pub async fn get_epoch_info(&self) -> Result<GetEpochInfoResponse, SdkError> {
        let params = json!([]);
        self.helius_rpc_call("getEpochInfo", params).await
    }

    pub async fn get_epoch_schedule(&self) -> Result<GetEpochScheduleResponse, SdkError> {
        let params = json!([]);
        self.helius_rpc_call("getEpochSchedule", params).await
    }

    pub async fn get_fee_for_message(&self, message: &str) -> Result<GetFeeForMessageResponse, SdkError> {
        let params = json!([message]);
        self.helius_rpc_call("getFeeForMessage", params).await
    }

    pub async fn get_first_available_block(&self) -> Result<GetFirstAvailableBlockResponse, SdkError> {
        let params = json!([]);
        self.helius_rpc_call("getFirstAvailableBlock", params).await
    }

    pub async fn get_genesis_hash(&self) -> Result<GetGenesisHashResponse, SdkError> {
        let params = json!([]);
        self.helius_rpc_call("getGenesisHash", params).await
    }

    pub async fn get_health(&self) -> Result<GetHealthResponse, SdkError> {
        let params = json!([]);
        self.helius_rpc_call("getHealth", params).await
    }

    pub async fn get_highest_snapshot_slot(&self) -> Result<GetHighestSnapshotSlotResponse, SdkError> {
        let params = json!([]);
        self.helius_rpc_call("getHighestSnapshotSlot", params).await
    }

    pub async fn get_identity(&self) -> Result<GetIdentityResponse, SdkError> {
        let params = json!([]);
        self.helius_rpc_call("getIdentity", params).await
    }

    pub async fn get_inflation_governor(&self) -> Result<GetInflationGovernorResponse, SdkError> {
        let params = json!([]);
        self.helius_rpc_call("getInflationGovernor", params).await
    }

    pub async fn get_inflation_rate(&self) -> Result<GetInflationRateResponse, SdkError> {
        let params = json!([]);
        self.helius_rpc_call("getInflationRate", params).await
    }

    pub async fn get_largest_accounts(&self) -> Result<GetLargestAccountsResponse, SdkError> {
        let params = json!([]);
        self.helius_rpc_call("getLargestAccounts", params).await
    }

    pub async fn get_latest_blockhash(&self) -> Result<GetLatestBlockhashResponse, SdkError> {
        let params = json!([]);
        self.helius_rpc_call("getLatestBlockhash", params).await
    }

    pub async fn get_leader_schedule(&self) -> Result<GetLeaderScheduleResponse, SdkError> {
        let params = json!([]);
        self.helius_rpc_call("getLeaderSchedule", params).await
    }

    pub async fn get_max_retransmit_slot(&self) -> Result<GetMaxRetransmitSlotResponse, SdkError> {
        let params = json!([]);
        self.helius_rpc_call("getMaxRetransmitSlot", params).await
    }

    pub async fn get_max_shred_insert_slot(&self) -> Result<GetMaxShredInsertSlotResponse, SdkError> {
        let params = json!([]);
        self.helius_rpc_call("getMaxShredInsertSlot", params).await
    }

    pub async fn get_minimum_balance_for_rent_exemption(
        &self,
        data_len: u64,
    ) -> Result<GetMinimumBalanceForRentExemptionResponse, SdkError> {
        let params = json!([data_len]);
        self.helius_rpc_call("getMinimumBalanceForRentExemption", params).await
    }

    pub async fn get_program_accounts(
        &self,
        program_id: &str,
    ) -> Result<GetProgramAccountsResponse, SdkError> {
        let params = json!([program_id]);
        self.helius_rpc_call("getProgramAccounts", params).await
    }

    pub async fn get_recent_performance_samples(
        &self,
        limit: u64,
    ) -> Result<GetRecentPerformanceSamplesResponse, SdkError> {
        let params = json!([limit]);
        self.helius_rpc_call("getRecentPerformanceSamples", params).await
    }

    pub async fn get_slot(&self) -> Result<GetSlotResponse, SdkError> {
        let params = json!([]);
        self.helius_rpc_call("getSlot", params).await
    }

    pub async fn get_slot_leader(&self) -> Result<GetSlotLeaderResponse, SdkError> {
        let params = json!([]);
        self.helius_rpc_call("getSlotLeader", params).await
    }

    pub async fn get_stake_activation(
        &self,
        account: &str,
        epoch: Option<u64>,
    ) -> Result<GetStakeActivationResponse, SdkError> {
        let params = if let Some(e) = epoch {
            json!([account, {"epoch": e}])
        } else {
            json!([account])
        };
        self.helius_rpc_call("getStakeActivation", params).await
    }

    pub async fn get_stake_minimum_delegation(&self) -> Result<GetStakeMinimumDelegationResponse, SdkError> {
        let params = json!([]);
        self.helius_rpc_call("getStakeMinimumDelegation", params).await
    }

    pub async fn get_supply(&self) -> Result<GetSupplyResponse, SdkError> {
        let params = json!([]);
        self.helius_rpc_call("getSupply", params).await
    }

    pub async fn get_token_account_balance(
        &self,
        pubkey: &str,
    ) -> Result<GetTokenAccountBalanceResponse, SdkError> {
        let params = json!([pubkey]);
        self.helius_rpc_call("getTokenAccountBalance", params).await
    }

    pub async fn get_token_largest_accounts(
        &self,
        mint: &str,
    ) -> Result<GetTokenLargestAccountsResponse, SdkError> {
        let params = json!([mint]);
        self.helius_rpc_call("getTokenLargestAccounts", params).await
    }

    pub async fn get_token_supply(&self, mint: &str) -> Result<GetTokenSupplyResponse, SdkError> {
        let params = json!([mint]);
        self.helius_rpc_call("getTokenSupply", params).await
    }

    pub async fn get_transaction(
        &self,
        signature: &str,
    ) -> Result<GetTransactionResponse, SdkError> {
        let params = json!([signature]);
        self.helius_rpc_call("getTransaction", params).await
    }

    pub async fn get_transaction_count(&self) -> Result<GetTransactionCountResponse, SdkError> {
        let params = json!([]);
        self.helius_rpc_call("getTransactionCount", params).await
    }

    pub async fn get_version(&self) -> Result<GetVersionResponse, SdkError> {
        let params = json!([]);
        self.helius_rpc_call("getVersion", params).await
    }

    pub async fn get_vote_accounts(&self) -> Result<GetVoteAccountsResponse, SdkError> {
        let params = json!([]);
        self.helius_rpc_call("getVoteAccounts", params).await
    }

    pub async fn is_blockhash_valid(
        &self,
        blockhash: &str,
    ) -> Result<IsBlockhashValidResponse, SdkError> {
        let params = json!([blockhash]);
        self.helius_rpc_call("isBlockhashValid", params).await
    }

    pub async fn minimum_ledger_slot(&self) -> Result<MinimumLedgerSlotResponse, SdkError> {
        let params = json!([]);
        self.helius_rpc_call("minimumLedgerSlot", params).await
    }

    pub async fn get_account_info(&self, address: &str) -> Result<GetAccountInfoResponse, SdkError> {
        let params = json!([address]);
        self.helius_rpc_call("getAccountInfo", params).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_query_get_recent_transactions() {
        let client = SWqueryClient::new(
            "WDAO4Z1Z503DWJH7060GIYGR0TWIIPBM".to_string(),
            "1f3f8151-4e8d-46c7-9555-22d4d8b38294".to_string(),
            None,
        );

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
