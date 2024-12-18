use crate::errors::SdkError;

// Helper functions for parameter extraction
pub fn get_required_str_param<'a>(
    params: &'a serde_json::Value,
    field: &str,
) -> Result<&'a str, SdkError> {
    params[field]
        .as_str()
        .ok_or_else(|| SdkError::InvalidInput(format!("Missing {} parameter", field)))
}

pub fn get_optional_str_param<'a>(params: &'a serde_json::Value, field: &str) -> Option<&'a str> {
    params[field].as_str()
}

pub fn get_optional_u64_param(params: &serde_json::Value, field: &str, default: u64) -> u64 {
    params[field].as_u64().unwrap_or(default)
}

pub fn get_required_u64_param(params: &serde_json::Value, field: &str) -> Result<u64, SdkError> {
    params[field]
        .as_u64()
        .ok_or_else(|| SdkError::InvalidInput(format!("Missing {} parameter", field)))
}

// Helper to serialize response to Value
pub fn to_value_response<T: serde::Serialize>(response: T) -> Result<serde_json::Value, SdkError> {
    serde_json::to_value(response).map_err(|e| SdkError::Unexpected(e.to_string()))
}
