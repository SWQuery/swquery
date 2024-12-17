use std::collections::HashMap;
use serde_json::{self, json, Value};
use thiserror::Error;

/// Tipo de entrada do modelo.
/// podem representar qualquer estrutura JSON dinâmica.
type Input = Value;
type Output = Value;

/// Erros que podem ocorrer durante o processo de transformação.
#[derive(Debug, Error)]
pub enum TransformerError {
    /// Erro de parsing do JSON de entrada.
    #[error("Failed to parse input as JSON: {0}")]
    ParseError(#[from] serde_json::Error),

    /// Erro durante a inferência. Por exemplo, se o campo "prompt" não estiver presente.
    #[error("Inference error: {0}")]
    InferenceError(String),
}

/// `TransformerModel` representa um modelo que transforma prompts em queries.
/// 
/// `input` e `output` podem ser exemplos de entradas e saídas, metadados, ou quaisquer dados auxiliares 
/// que você queira associar ao modelo.
pub struct TransformerModel {
    pub name: String,
    pub version: String,
    pub description: String,
    pub input: Vec<Input>,
    pub output: Vec<Output>,
    pub metadata: HashMap<String, String>,
}

impl TransformerModel {
    /// Cria uma nova instância do `TransformerModel`.
    pub fn new(
        name: String,
        version: String,
        description: String,
        input: Vec<Input>,
        output: Vec<Output>,
        metadata: HashMap<String, String>,
    ) -> Self {
        Self {
            name,
            version,
            description,
            input,
            output,
            metadata,
        }
    }

    /// Transforma um `Input` (espera-se que contenha um campo "prompt") em uma query JSON-RPC.
    /// Caso não encontre o campo "prompt", retorna um `InferenceError`.
    fn run(&self, input: Input) -> Result<Output, TransformerError> {
        // Tenta extrair o campo "prompt" do input.
        if let Some(prompt) = input.get("prompt") {
            // Cria uma query JSON-RPC simples como exemplo:
            let query = json!({
                "jsonrpc": "2.0",
                "method": "transform_prompt",
                "params": {
                    "prompt": prompt
                },
                "id": 1
            });
            Ok(query)
        } else {
            Err(TransformerError::InferenceError(
                "No 'prompt' field found in input JSON.".to_string(),
            ))
        }
    }

    /// `run_inference` recebe uma string JSON, parseia para `Input`, chama `run` para converter o prompt
    /// em uma query, e retorna o resultado como string JSON.
    pub fn run_inference(&self, input: &str) -> Result<String, TransformerError> {
        // Parseia a entrada para um `Value`.
        let input_val: Input = serde_json::from_str(input)?;

        // Executa a transformação.
        let output_val = self.run(input_val)?;

        // Serializa o resultado de volta para string.
        let output_str = serde_json::to_string(&output_val)?;
        Ok(output_str)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_run_inference_ok() {
        let model = TransformerModel::new(
            "TestModel".into(),
            "1.0".into(),
            "A test transformer model.".into(),
            vec![],
            vec![],
            HashMap::new(),
        );

        let input_json = r#"{ "prompt": "Hello, world!" }"#;
        let result = model.run_inference(input_json);
        assert!(result.is_ok());

        let output_str = result.unwrap();
        let output_val: serde_json::Value = serde_json::from_str(&output_str).unwrap();
        assert_eq!(output_val["method"], "transform_prompt");
        assert_eq!(output_val["params"]["prompt"], "Hello, world!");
    }

    #[test]
    fn test_run_inference_missing_prompt() {
        let model = TransformerModel::new(
            "TestModel".into(),
            "1.0".into(),
            "A test transformer model.".into(),
            vec![],
            vec![],
            HashMap::new(),
        );

        let input_json = r#"{"wrong_field": "no prompt"}"#;
        let result = model.run_inference(input_json);
        assert!(result.is_err());

        match result.err().unwrap() {
            TransformerError::InferenceError(msg) => {
                assert!(msg.contains("No 'prompt' field found"))
            }
            _ => panic!("Expected an InferenceError"),
        }
    }
}
