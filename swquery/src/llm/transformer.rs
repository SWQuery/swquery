use {
    reqwest,
    serde::Deserialize,
    serde_json::{self, Value},
    std::collections::HashMap,
    thiserror::Error,
};

/// Tipo de entrada e saída do modelo.
type Input = Value;
type Output = String;

/// Erros que podem ocorrer durante o processo de transformação.
#[derive(Debug, Error)]
pub enum TransformerError {
    /// Erro de parsing do JSON de entrada.
    #[error("Failed to parse input as JSON: {0}")]
    ParseError(#[from] serde_json::Error),

    /// Erro se não encontrar o campo "inputUser" no JSON.
    #[error("Inference error: {0}")]
    InferenceError(String),
}

/// `TransformerModel` representa o modelo que extrai o "inputUser" do JSON
/// recebido.
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

    /// Extrai o campo "inputUser" do JSON. Se não existir, retorna um
    /// `InferenceError`.
    fn run(&self, input: Input) -> Result<Output, TransformerError> {
        if let Some(user_input) = input.get("inputUser") {
            if let Some(user_str) = user_input.as_str() {
                Ok(user_str.to_string())
            } else {
                Err(TransformerError::InferenceError(
                    "'inputUser' field is not a string.".to_string(),
                ))
            }
        } else {
            Err(TransformerError::InferenceError(
                "No 'inputUser' field found in input JSON.".to_string(),
            ))
        }
    }

    /// `run_inference` recebe uma string JSON, parseia para `Input`, chama
    /// `run` para extrair o prompt do usuário e retorna esse prompt como
    /// `String`.
    pub fn run_inference(&self, input: &str) -> Result<String, TransformerError> {
        let input_val: Input = serde_json::from_str(input)?;
        let output_val = self.run(input_val)?;
        Ok(output_val)
    }

    /// Esta função recebe o prompt extraído e envia via POST para a rota do LLM
    /// Espera que o LLM retorne uma string (por exemplo, a query gerada).
    pub async fn send_prompt_to_llm(
        &self,
        prompt: &str,
    ) -> Result<QueryResponse, Box<dyn std::error::Error>> {
        let client = reqwest::Client::new();
        let resp = client
            .post("http://localhost:5500/agent/generate_query")
            .json(&serde_json::json!({"inputUser": prompt}))
            .send()
            .await?;

        match resp.status() {
            status if status.is_success() => {
                let response: QueryResponse = resp.json().await?;
                match response.result.status.as_str() {
                    "error" => Err(format!("LLM Error: {}", response.result.response).into()),
                    "success" => Ok(response),
                    _ => Err("Unknown response status".into()),
                }
            }
            status => Err(format!("Server returned status: {}", status).into()),
        }
    }
}

#[derive(Deserialize)]
pub struct QueryResponse {
    result: QueryResult,
    pub tokens: i64,
}

#[derive(Deserialize, Debug)]
struct QueryResult {
    pub response: String,
    pub status: String,
}
