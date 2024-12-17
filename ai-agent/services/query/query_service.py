from openai import OpenAI
from configs.settings import settings
import json

openAIClient = OpenAI(
    api_key=settings.openai_key_secret,
)


def query_generator(input: str):
    return input + " generated"


def query_generator_openai(user_input: str):
    system_prompt = (
        "You are a highly specialized RPC assistant. "
        "The user will provide input in natural language, and your role is to return "
        "ONLY a JSON in the following format:\n"
        "{\n"
        "   \"response\": \"<method_name_or_message>\",\n"
        "   \"status\": \"success\" or \"error\"\n"
        "}\n\n"
        "If the user's request can be answered by one of the methods in the list, "
        "return the method name and \"status\": \"success\".\n"
        "If the user's request is recognized as a Solana RPC query but no suitable method "
        "is available in the list, return:\n"
        "{\n"
        "   \"response\": \"We recognized your request as a Solana RPC query, but no implemented method is available.\",\n"
        "   \"status\": \"error\"\n"
        "}\n\n"
        "If there is no method that meets the user's request and it doesn't seem to be a Solana RPC query, return:\n"
        "{\n"
        "   \"response\": \"We need your request to be a query to be executed on the Solana network via RPC\",\n"
        "   \"status\": \"error\"\n"
        "}\n\n"
        "List of available methods: getAsset, getAssetProof, getAssetsByGroup, "
        "getAssetsByCreator, getAssetsByOwner, getAssetsByAuthority, getSignaturesForAsset, "
        "getBalance, getBlockHeight, getBlockProduction, getBlockCommitment, getBlocks, "
        "getBlockTime, getClusterNodes, getEpochInfo, getEpochSchedule, getFeeForMessage, "
        "getFirstAvailableBlock, getGenesisHash, getHealth, getHighestSnapshotSlot, getIdentity, "
        "getInflationGovernor, getInflationRate, getLargestAccounts, getLatestBlockhash, "
        "getLeaderSchedule, getMaxRetransmitSlot, getMaxShredInsertSlot, "
        "getMinimumBalanceForRentExemption, getProgramAccounts, getRecentPerformanceSamples, "
        "getSignaturesForAddress, getSlot, getSlotLeader, getStakeActivation, "
        "getStakeMinimumDelegation, getSupply, getTokenAccountBalance, getTokenLargestAccounts, "
        "getTokenSupply, getTransaction, getTransactionCount, getVersion, getVoteAccounts, "
        "isBlockhashValid, minimumLedgerSlot, getAccountInfo."
    )

    response = openAIClient.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input}
        ],
        response_format={"type": "json_object"}
    )

    promptResult = response.choices[0].message.content.strip();

    promptResult = json.loads(promptResult);

    return {
        "result": promptResult,
        "tokens": response.usage.total_tokens
    }
