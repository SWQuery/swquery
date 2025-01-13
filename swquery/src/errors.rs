use {reqwest, thiserror::Error};

#[derive(Debug, Error)]
pub enum SdkError {
    #[error("Invalid input: {0}")]
    InvalidInput(String),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Parse error: {0}")]
    ParseError(String),

    #[error("HTTP error: {0}")]
    HttpError(#[from] reqwest::Error),

    #[error("Network error occurred: {0}")]
    NetworkError(String),

    #[error("Wallet not found")]
    WalletNotFound,

    #[error("Failed to parse the query")]
    QueryParsingFailed,

    #[error("API request failed: {0}")]
    ApiRequestFailed(String),

    #[error("Unknown error")]
    Unknown,

    #[error("Unexpected error: {0}")]
    Unexpected(String),

    #[error("Failed to send request")]
    RequestFailed,
}
