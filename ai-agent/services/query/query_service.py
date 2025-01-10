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
        "The user will provide input in natural language, and your role is to return "
        "ONLY a JSON in the following format:\n"
        "{\n"
        "   \"response\": \"<method_name_or_message>\",\n"
        "   \"params\": {,\n"
        "       \"<param_name>\": <param_value>,\n"
        "       ...\n"
        "   },\n"
        "   \"status\": \"success\" or \"error\"\n"
        "}\n\n"
        "If the user's request can be answered by one of the methods in the list, "
        "return the method name and \"status\": \"success\"."
        "If the method requires parameters, include them in the \"params\" array. And always return too the wallet address as a parameter named as 'address'\n"
        "If the user's request is recognized as a Solana RPC query but no suitable method "
        "is available in the list, return:\n"
        "{\n"
        "   \"response\": \"We recognized your request as a Solana RPC query, but no implemented method is available.\",\n"
        "   \"status\": \"error\"\n"
        "}\n\n"
        "If there is no method that meets the user's request and it doesn't seem to be a Solana RPC query, return:\n"
        "{\n"
        "   \"response\": \"We need your request to be a query to be executed on the Solana network via SWQuery SDK\",\n"
        "   \"status\": \"error\"\n"
        "}\n\n"
        "List of available methods in SWQuery SDK (including parameters):\n"
        # "- getAssetsByCreator(creator: String)\n"
        # "- getAssetsByCreatorFiltered(creator: String, filters: HashMap<String, String>)\n"
        # "- getAssetsByOwner(owner: String)\n"
        # "- getAssetsByOwnerSummary(owner: String)\n"
        # "- getAssetsByAuthority(authority: String)\n"
        # "- getSignaturesForAsset(asset_id: String)\n"
        # "- getSignaturesForAddress(address: String)\n"
        # "- getSignaturesForAddressPeriod(address: String, from: u64, to: u64)\n"
        # "- getRecentTransactions(address: String, days: u8)\n"
        # "- getTransaction(signature: String)\n"
        # "- getTransactionDetails(signatures: Vec<String>)\n"
        # "- isTransactionSuccessful(signature: String)\n"
        # "- getBalance(address: String)\n"
        # "- getTotalBalance(owner: String)\n"
        # "- getTokenAccountBalance(account: String)\n"
        # "- getTokenBalancesForOwner(owner: String, mint: String)\n"
        # "- getTokenLargestAccounts(mint: String)\n"
        # "- getLargestTokenAccounts(mint: String)\n"
        # "- getTokenSupply(mint: String)\n"
        # "- getProgramAccounts(program_id: String)\n"
        # "- getProgramAccountsWithFilters(program_id: String, filters: HashMap<String, String>)\n"
        # "- getBlockHeight()\n"
        # "- getBlockProduction()\n"
        # "- getBlockCommitment(block: u64)\n"
        # "- getBlocks(start_slot: u64, end_slot: u64)\n"
        # "- getBlocksInPeriod(from_slot: u64, to_slot: u64)\n"
        # "- getBlockTime(slot: u64)\n"
        # "- getClusterNodes()\n"
        # "- getActiveValidators()\n"
        # "- getEpochInfo()\n"
        # "- getEpochSchedule()\n"
        # "- getFeeForMessage(message: String)\n"
        # "- getFeeStatistics(blocks: Vec<u64>)\n"
        # "- getFirstAvailableBlock()\n"
        # "- getGenesisHash()\n"
        # "- getHealth()\n"
        # "- getHighestSnapshotSlot()\n"
        # "- getIdentity()\n"
        # "- getInflationGovernor()\n"
        # "- getInflationRate()\n"
        # "- getLargestAccounts()\n"
        # "- getLatestBlockhash()\n"
        # "- getLeaderSchedule()\n"
        # "- getLeaderScheduleSummary()\n"
        # "- getMaxRetransmitSlot()\n"
        # "- getMaxShredInsertSlot()\n"
        # "- getMinimumBalanceForRentExemption(size: u64)\n"
        # "- getRecentPerformanceSamples()\n"
        # "- getSlot()\n"
        # "- getSlotLeader()\n"
        # "- getStakeActivation(account: String, epoch: Option<u64>)\n"
        # "- getStakeMinimumDelegation()\n"
        # "- getSupply()\n"
        # "- isBlockhashValid(blockhash: String)\n"
        # "- minimumLedgerSlot()\n"
        # "- getAccountInfo(account: String)\n"
        # "- monitorAddress(address: String, interval: u64, callback: Function)\n"
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
