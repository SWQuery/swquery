pub struct BytecodeParser;

impl BytecodeParser {
    pub fn parse_bytecode(data: &str) -> Result<serde_json::Value, crate::errors::SdkError> {
        let value = serde_json::from_str(data)
            .map_err(|e| crate::errors::SdkError::ParseError(e.to_string()))?;
        Ok(value)
    }
}
