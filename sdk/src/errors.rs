use thiserror::Error; 
use reqwest;

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

    #[error("Transformer error: {0}")]
    TransformerError(#[from] crate::llm::TransformerError),

    #[error("Network error occurred: {0}")]
    NetworkError(String),

    #[error("Unknown error")]
    Unknown,
}
