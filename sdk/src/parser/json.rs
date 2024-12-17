use serde_json;

pub struct JsonParser;

impl JsonParser {
    pub fn parse(&self, data: &str) -> Result<serde_json::Value, crate::errors::SdkError> {
        serde_json::from_str(data).map_err(|e| crate::errors::SdkError::ParseError(e.to_string()))
    }
}
