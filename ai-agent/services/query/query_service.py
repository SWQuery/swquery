from typing import Dict, Any
from openai import OpenAI
from configs.settings import settings
import json

openAIClient = OpenAI(
    api_key=settings.openai_key_secret,
)


def query_generator(input: str):
    return input + " generated"


def query_generator_openai(user_input: str, wallet: str):
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
        "   - Include any required parameters in the \"params\" object, including the `address` (wallet address).\n\n"
        "2. Filter Logic:\n"
        "   - If the user's request involves filtering transactions (e.g., \"What was my biggest transaction in the last 5 days?\"):\n"
        "     - Map the query to the relevant method, such as `getRecentTransactions`.\n"
        "     - Include the primary filter parameters (e.g., `days` or equivalent).\n"
        "     - Add \"filter\" to the \"params\" object, describing the filter (e.g., \"biggest\", \"specific criteria\").\n"
        "     - Generate a Rust function that exclusively:\n"
        "         1. Receives a `Vec<FullTransaction>`.\n"
        "         2. Returns a `Vec<FullTransaction>`.\n"
        "         3. Includes the **complete definition of the `FullTransaction` struct** at the start of the generated code.\n"
        "         4. Ensures the necessary dependencies (`serde_json`, `std::collections`, etc.) and `use` statements are included.\n\n"
        "3. Model of the Transaction:\n"
        "   Use this structure as the model for transactions:\n"
        "   pub struct FullTransaction {\n"
        "       pub signature: String,\n"
        "       pub slot: u64,\n"
        "       pub timestamp: u64,\n"
        "       pub status: String,\n"
        "       pub details: serde_json::Value, // Include the full transaction result\n"
        "       pub token_metadata: std::collections::HashMap<String, serde_json::Value>\n"
        "   }\n\n"
        "   Sample transaction data:\n"
        "   [\n"
        "       {\n"
        "           \"details\": {\n"
        "               \"fee\": 14900,\n"
        "               \"transfers\": [\n"
        "                   {\n"
        "                       \"amount\": \"0.001014900\",\n"
        "                       \"decimals\": 9,\n"
        "                       \"direction\": \"out\",\n"
        "                       \"metadata\": null,\n"
        "                       \"mint\": \"SOL\",\n"
        "                       \"owner\": \"N/A\"\n"
        "                   }\n"
        "               ]\n"
        "           },\n"
        "           \"signature\": \"4G8uSr7CPh8vrULE9dhZLWW4GuHRrsdhFUib546vQT2K1rs4aeafGxoqhXvr8YW8VmK8neTbh9UdkTDumekK7Rwx\",\n"
        "           \"slot\": 310637328,\n"
        "           \"status\": \"success\",\n"
        "           \"timestamp\": 1735507895,\n"
        "           \"token_metadata\": {}\n"
        "       }\n"
        "   ]\n\n"
        "4. Example Query and Response:\n"
        "   - For the query \"What were my successful transactions in the last 5 days?\":\n"
        "     {\n"
        "         \"response\": \"getRecentTransactions\",\n"
        "         \"params\": {\n"
        "             \"address\": \"user_wallet_address\",\n"
        "             \"days\": 5,\n"
        "             \"filter\": \"successful\",\n"
        "             \"filter_function\": \"fn filter_successful_transactions(transactions: Vec<FullTransaction>) -> Vec<FullTransaction> { /* Rust filter code here */ }\"\n"
        "         },\n"
        "         \"status\": \"success\"\n"
        "     }\n\n"
        "5. Generated Rust Function:\n"
        "   Always include the full definition of the `FullTransaction` struct in the generated code. Ensure that:\n"
        "   - All necessary dependencies (`serde_json`, `std::collections`, etc.) are declared.\n"
        "   - The code is ready to compile independently, including imports and module declarations.\n\n"
        "   Example Rust code:\n"
        "   use serde_json::Value;\n"
        "   use std::collections::HashMap;\n\n"
        "   pub struct FullTransaction {\n"
        "       pub signature: String,\n"
        "       pub slot: u64,\n"
        "       pub timestamp: u64,\n"
        "       pub status: String,\n"
        "       pub details: Value,\n"
        "       pub token_metadata: HashMap<String, Value>,\n"
        "   }\n\n"
        "   fn filter_successful_transactions(transactions: Vec<FullTransaction>) -> Vec<FullTransaction> {\n"
        "       transactions.into_iter().filter(|tx| tx.status == \"success\").collect()\n"
        "   }\n\n"
        "6. Restriction:\n"
        "   - Only functions that **receive** and **return** `Vec<FullTransaction>` are allowed to be generated.\n"
        "   - Always include the complete `FullTransaction` struct definition and necessary imports (`serde_json`, `std::collections`, etc.) in the response.\n\n"
        "7. Unrecognized Queries:\n"
        "   - If no suitable method exists in the SDK but the query is recognized as a Solana RPC query, return:\n"
        "     {\n"
        "         \"response\": \"We recognized your request as a Solana RPC query, but no implemented method is available.\",\n"
        "         \"status\": \"error\"\n"
        "     }\n\n"
        "   - If the query is not related to Solana RPC, return:\n"
        "     {\n"
        "         \"response\": \"We need your request to be a query to be executed on the Solana network via SWQuery SDK.\",\n"
        "         \"status\": \"error\"\n"
        "     }\n\n"
        "### Available Methods in SWQuery SDK:\n"
        "1. getAssetsByCreator(creator: String)\n"
        "2. getAssetsByCreatorFiltered(creator: String, filters: HashMap<String, String>)\n"
        "3. getAssetsByOwner(owner: String)\n"
        "4. getAssetsByOwnerSummary(owner: String)\n"
        "5. getAssetsByAuthority(authority: String)\n"
        "6. getSignaturesForAsset(asset_id: String)\n"
        "7. getSignaturesForAddress(address: String)\n"
        "8. getSignaturesForAddressPeriod(address: String, from: u64, to: u64)\n"
        "9. getRecentTransactions(address: String, days: u8)\n"
        "10. getTransaction(signature: String)\n"
        "11. getTransactionDetails(signatures: Vec<String>)\n"
        "12. isTransactionSuccessful(signature: String)\n"
        "13. getBalance(address: String)\n"
        "14. getTotalBalance(owner: String)\n"
        "15. getTokenAccountBalance(account: String)\n"
        "16. getTokenBalancesForOwner(owner: String, mint: String)\n"
        "17. getTokenLargestAccounts(mint: String)\n"
        "18. getLargestTokenAccounts(mint: String)\n"
        "19. getTokenSupply(mint: String)\n"
        "20. getProgramAccounts(program_id: String)\n"
        "21. getProgramAccountsWithFilters(program_id: String, filters: HashMap<String, String>)\n"
        "22. getBlockHeight()\n"
        "23. getBlockProduction()\n"
        "24. getBlockCommitment(block: u64)\n"
        "25. getBlocks(start_slot: u64, end_slot: u64)\n"
        "26. getBlocksInPeriod(from_slot: u64, to_slot: u64)\n"
        "27. getBlockTime(slot: u64)\n"
        "28. getClusterNodes()\n"
        "29. getActiveValidators()\n"
        "30. getEpochInfo()\n"
        "31. getEpochSchedule()\n"
        "32. getFeeForMessage(message: String)\n"
        "33. getFeeStatistics(blocks: Vec<u64>)\n"
        "34. getFirstAvailableBlock()\n"
        "35. getGenesisHash()\n"
        "36. getHealth()\n"
        "37. getHighestSnapshotSlot()\n"
        "38. getIdentity()\n"
        "39. getInflationGovernor()\n"
        "40. getInflationRate()\n"
        "41. getLargestAccounts()\n"
        "42. getLatestBlockhash()\n"
        "43. getLeaderSchedule()\n"
        "44. getLeaderScheduleSummary()\n"
        "45. getMaxRetransmitSlot()\n"
        "46. getMaxShredInsertSlot()\n"
        "47. getMinimumBalanceForRentExemption(size: u64)\n"
        "48. getRecentPerformanceSamples()\n"
        "49. getSlot()\n"
        "50. getSlotLeader()\n"
        "51. getStakeActivation(account: String, epoch: Option<u64>)\n"
        "52. getStakeMinimumDelegation()\n"
        "53. getSupply()\n"
        "54. isBlockhashValid(blockhash: String)\n"
        "55. minimumLedgerSlot()\n"
        "56. getAccountInfo(account: String)\n"
        "57. monitorAddress(address: String, interval: u64, callback: Function)\n"
        "58. getAsset(address: String)\n"
        "\nIf the user's query matches any of the above methods, return its name in the JSON response "
        "with \"status\": \"success\". Otherwise, follow the error-handling logic provided."
    )

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


def generate_visualization(input_json: str, question: str) -> Dict[str, Any]:
    """
    Generate a Markdown visualization from JSON input using OpenAI's GPT-4.

    Args:
        input_json: JSON string containing blockchain data

    Returns:
        Dictionary containing the markdown result and token usage
    """
    system_prompt = (
        "You are a Solana blockchain data analyzer that generates clear Markdown summaries. "
        "Analyze the provided JSON data and create a structured summary with these exact sections:"
        "\n\n"
        "You need to provide a Markdown visualization of the JSON data, based on the question made by the user before. That was: \n"
        f"{question}"
        "\n\n"
        "Guidelines:\n"
        "- Use clean, consistent Markdown formatting\n"
        "- Keep descriptions concise and technical\n"
        "- Format addresses as `code` style\n"
        "- Use bullet points for lists\n"
        "- Convert lamports to SOL where relevant (1 SOL = 1,000,000,000 lamports)\n"
        "- Highlight any errors or anomalies\n"
        "- **Do not ignore or omit any part of the JSON data, even if the structure varies or seems irrelevant.**\n"
        "- **If certain fields are missing or null, explicitly mention this in the summary.**\n"
        "- **If the JSON contains nested or unstructured data, attempt to represent it in the most organized and readable format possible.**\n"
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
