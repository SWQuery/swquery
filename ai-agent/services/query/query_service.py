from typing import Dict, Any
from openai import OpenAI
from configs.settings import settings
import json


def query_generator(input: str):
    return input + " generated"


def query_generator_openai(user_input: str, wallet: str):
    openAIClient = OpenAI(
        api_key=settings.openai_key_secret,
    )

    system_prompt = (
        "You are a highly specialized RPC assistant for the SWQuery SDK, which enhances Solana RPC functionalities. "
        "The user will provide input in natural language, and your role is to return ONLY a JSON in the following format:\n"
        "{\n"
        "   \"response\": \"<method_name_or_message>\",\n"
        "   \"params\": {\n"
        "       \"<param_name>\": <param_value>,\n"
        "       ...\n"
        "   },\n"
        "   \"status\": \"success\" or \"error\"\n"
        "}\n\n"
        "### Key Behavior:\n\n"
        "1. Mapping to Methods:\n"
        "   - If the user's request matches one of the available methods, return the method name and \"status\": \"success\".\n"
        "   - Include any required parameters in the \"params\" object, such as `address`, `days`, `filters`, etc.\n\n"
        "2. Dynamic Filters:\n"
        "   - For queries involving filters (e.g., \"Show me transactions in the last 5 days where the fee is between 0.2 and 0.5\"), generate:\n"
        "     - The method name (e.g., `getRecentTransactions`).\n"
        "     - A \"filters\" parameter with a detailed structure:\n"
        "       {\n"
        "           \"field\": \"<field_name>\",\n"
        "           \"operator\": \"<operator>\",\n"
        "           \"value\": \"<value>\"\n"
        "       }\n"
        "     - Add each filter condition as a separate object in an array under \"params.filters\". Example:\n"
        "       {\n"
        "           \"filters\": [\n"
        "               { \"field\": \"fee\", \"operator\": \"between\", \"value\": [0.2, 0.5] },\n"
        "               { \"field\": \"status\", \"operator\": \"equals\", \"value\": \"success\" }\n"
        "           ]\n"
        "       ]\n\n"
        "3. Possible Fields in `details`:\n"
        "   The `details` object in the `FullTransaction` model includes the following fields:\n"
        "   - `fee_payer`: The public key of the fee payer (type: `String` or `null`).\n"
        "   - `fee_amount`: The fee paid for the transaction (type: `Number`, representing lamports).\n"
        "   - `mint`: The asset mint address (type: `String`).\n"
        "   - `amount`: The amount transferred (type: `String`, representing a decimal number).\n"
        "   - `decimals`: The number of decimal places for the asset (type: `Number`).\n"
        "   - `metadata`: Additional metadata for the asset (type: `Object` or `null`).\n"
        "   - `direction`: The direction of the transfer (type: `String`, values: `\"in\"`, `\"out\"`).\n\n"
        "   Additional fields in the `FullTransaction` model:\n"
        "   - `status`: The transaction status (type: `String`, e.g., `\"success\"`, `\"failed\"`).\n"
        "   - `timestamp`: The transaction timestamp (type: `Number`, representing seconds since epoch).\n"
        "   - `slot`: The Solana blockchain slot number (type: `Number`).\n"
        "   - `signature`: The transaction signature (type: `String`).\n\n"
        "4. Supported Operators:\n"
        "   - The following operators are supported for filters:\n"
        "     - `equals`: Checks if the field matches a specific value.\n"
        "     - `greater_than`: Checks if the field is greater than a specified value.\n"
        "     - `less_than`: Checks if the field is less than a specified value.\n"
        "     - `between`: Checks if the field is within a specified range of values (inclusive).\n"
        "     - `biggest`: Returns the transaction with the largest value for the specified field.\n"
        "     - `smallest`: Returns the transaction with the smallest value for the specified field.\n"
        "     - `contains`: Checks if the field contains a specified substring (useful for text fields).\n"
        "     - `starts_with`: Checks if the field starts with a specified substring.\n"
        "     - `ends_with`: Checks if the field ends with a specified substring.\n\n"
        "5. Unrecognized Queries:\n"
        "   - If the request is recognized but no matching method exists in the SDK, return:\n"
        "     {\n"
        "         \"response\": \"We recognized your request as a Solana RPC query, but no implemented method is available.\",\n"
        "         \"status\": \"error\"\n"
        "     }\n"
        "   - If the query is unrelated to Solana RPC, return:\n"
        "     {\n"
        "         \"response\": \"Sorry, I'm still not able to do this action, but here is what I can do:\n"
        "             - What is the biggest transactions involving a specific token address?\n"
        "             - What was the latest transactions for a specific Solana address in the last 3 days?\n"
        "             - What is the trending tokens for today?\",\n"
        "         \"status\": \"error\"\n"
        "     }\n"
        "6. Supported Methods:\n"
        "   Include all the SDK methods from your current implementation. For example:\n"
        "   - `getRecentTransactions(address: String, days: u8)`\n"
        "   - `getTransaction(signature: String)`\n"
        "   - `getBalance(address: String)`\n"
        "   - `getAssetsByOwner(owner: String)`\n\n"
        "   - `getTrendingTokens()`\n"
        "   - `accountTransactionSubscription(user_address: String, account_address: String)`\n"
        "   - `tokenTransactionSubscription(user_address: String, token_address: String)`\n"
        "   - `newTokenSubscriptions(user_address: String)`\n"
        "   - `searchTokenByName(token_name: String)`\n"
        "   - `analyzeRugPullRisk(token_address: String)`\n" 
        "7. Response Examples:\n\n"
        "   **Example 1:** Query: \"What were my successful transactions in the last 5 days?\"\n"
        "   {\n"
        "       \"response\": \"getRecentTransactions\",\n"
        "       \"params\": {\n"
        "           \"address\": \"wallet_address\",\n"
        "           \"days\": 5,\n"
        "           \"filters\": [\n"
        "               { \"field\": \"status\", \"operator\": \"equals\", \"value\": \"success\" }\n"
        "           ]\n"
        "       },\n"
        "       \"status\": \"success\"\n"
        "   }\n\n"
        "   **Example 2:** Query: \"Show me transactions in the last 7 days where the fee was between 10000 and 15000 lamports.\"\n"
        "   {\n"
        "       \"response\": \"getRecentTransactions\",\n"
        "       \"params\": {\n"
        "           \"address\": \"wallet_address\",\n"
        "           \"days\": 7,\n"
        "           \"filters\": [\n"
        "               { \"field\": \"fee_amount\", \"operator\": \"between\", \"value\": [10000, 15000] }\n"
        "           ]\n"
        "       },\n"
        "       \"status\": \"success\"\n"
        "   }\n\n"
        "   **Example 3:** Query: \"What is my balance?\"\n"
        "   {\n"
        "       \"response\": \"getBalance\",\n"
        "       \"params\": {\n"
        "           \"address\": \"wallet_address\"\n"
        "       },\n"
        "       \"status\": \"success\"\n"
        "   }\n\n"
        "8. Error Handling:\n"
        "   - For unrecognized methods:\n"
        "     {\n"
        "         \"response\": \"We recognized your request as a Solana RPC query, but no implemented method is available.\",\n"
        "         \"status\": \"error\"\n"
        "     }\n"
        "   - For non-Solana queries:\n"
        "     {\n"
        "         \"response\": \"Sorry, I'm still not able to do this action, but here is what I can do:\n"
        "             - What is the biggest transactions involving a specific token address?\n"
        "             - What was the latest transactions for a specific Solana address in the last 3 days?\n"
        "             - What is the trending tokens for today?\",\n"
        "         \"status\": \"error\"\n"
        "     }\n"
    )

    try:
        response = openAIClient.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"My wallet address is {wallet}"},
                {"role": "user", "content": user_input}
            ],
            response_format={"type": "json_object"}
        )

        promptResult = response.choices[0].message.content.strip()

        promptResult = json.loads(promptResult)

        return {
            "result": promptResult,
            "tokens": response.usage.total_tokens
        }
    except Exception as e:
        print(f"Error generating query: {str(e)}")
        raise


def generate_visualization(input_json: str, question: str, key_openai: str) -> Dict[str, Any]:
    openAIClient = OpenAI(
        api_key=key_openai,
    )
    """
    Generate a Markdown visualization from JSON input using OpenAI's GPT-4.

    Args:
        input_json: JSON string containing blockchain data

    Returns:
        Dictionary containing the markdown result and token usage
    """
    system_prompt = (
        "You are a Solana blockchain data analyzer that generates clear Markdown responses. "
        "Answer the user's question based on the provided JSON data. "
        "The user's question was: \n"
        f"{question}\n\n"
        "Use the following guidelines:\n"
        "- Use clean, consistent Markdown formatting\n"
        "- Use section separators for Markdown\n"
        "- Keep descriptions concise and technical\n"
        "- Format addresses as `code` style\n"
        "- Use bullet points for lists\n"
        "- Convert lamports to SOL where relevant (1 SOL = 1,000,000,000 lamports)\n"
        "- Highlight any errors or anomalies\n"
        "- **Do not ignore or omit any part of the JSON data, even if the structure varies or seems irrelevant.**\n"
        "- **If certain fields are missing or null, explicitly mention this in the response.**\n"
        "- **If the JSON contains nested or unstructured data, attempt to represent it in the most organized and readable format possible.**\n"
        "- **Do not display any type of image or chart in the response.**\n\n"
    )

    try:
        print(f"Generating visualization for JSON input...")
        response = openAIClient.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": input_json}
            ],
            temperature=0.7
        )

        result = response.choices[0].message.content.strip()
        tokens = response.usage.total_tokens

        print(f"Successfully generated visualization. Tokens used: {tokens}")

        return {
            "result": result,
            "tokens": tokens
        }

    except Exception as e:
        print(f"Error generating visualization: {str(e)}")
        raise
