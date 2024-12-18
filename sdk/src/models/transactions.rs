#![allow(non_snake_case)]
use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use serde_json::Value;

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
    pub blockTime: Option<u64>,
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
