from fastapi import APIRouter, Depends, File, Form, UploadFile
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
import json

from services.query.query_service import (
    query_generator_openai,
    generate_visualization
)

router = APIRouter(
    prefix="/query",
    tags=["Query"]
)


class QueryBody(BaseModel):
    inputUser: str
    address: str


class VisualizationBody(BaseModel):
    jsonReturned: str
    question: str


@router.post("/generate-query")
async def generate_query_route(
    body: QueryBody
):
    print("Body: ", body)
    result = query_generator_openai(body.inputUser, body.address)
    # result = {'result': {'response': 'getRecentTransactions', 'params': {
    # 'address': 'HuMZdNtbaNBPYex53irwAyKvxouLmEyN85MvAon81pXE', 'days': 70}, 'status': 'success'}, 'tokens': 69420}
    # 'address': '9unenHYtwUowNkWdZmSYTwzGxxdzKVJh7npk6W6uqRF3', 'days': 10}, 'status': 'success'}, 'tokens': 69420}
    # result = {
    #     "result": {
    #         "response": "getLargestTransaction",
    #         "params": {
    #             "address": "9unenHYtwUowNkWdZmSYTwzGxxdzKVJh7npk6W6uqRF3",
    #             "days": 5
    #         },
    #         "status": "success"
    #     },
    #     "tokens": 69420
    # }
    # result = {
    #     "result": {
    #         "response": "getRecentTransactions",
    #         "params": {
    #             "address": "HuMZdNtbaNBPYex53irwAyKvxouLmEyN85MvAon81pXE",
    #             "days": 10,
    #             "filter": "biggest",
    #             "filter_function": "pub struct FullTransaction { pub signature: String, pub slot: u64, pub timestamp: u64, pub status: String, pub details: serde_json::Value, pub token_metadata: std::collections::HashMap<String, serde_json::Value> } fn filter_biggest_transaction(transactions: Vec<FullTransaction>) -> Vec<FullTransaction> { transactions.into_iter().max_by_key(|tx| get_transaction_value(tx)).into_iter().collect() } fn get_transaction_value(transaction: &FullTransaction) -> u64 { // Replace with appropriate logic to extract transaction value transaction.details.get(\"value\").and_then(|v| v.as_u64()).unwrap_or(0) }"
    #         },
    #         "status": "success"
    #     },
    #     "tokens": 1610
    # }
    # result = {
    #     "result": {
    #         "response": "getRecentTransactions",
    #         "params": {
    #             "address": "HuMZdNtbaNBPYex53irwAyKvxouLmEyN85MvAon81pXE",
    #             "days": 10,
    #             "filter": "biggest",
    #             "filter_function": "pub struct FullTransaction {\n    pub signature: String,\n    pub slot: u64,\n    pub timestamp: u64,\n    pub status: String,\n    pub details: serde_json::Value,\n    pub token_metadata: std::collections::HashMap<String, serde_json::Value>,\n}\n\nfn filter_biggest_transactions(transactions: Vec<FullTransaction>) -> Vec<FullTransaction> {\n    transactions.into_iter().max_by(|a, b| {\n        let a_amount: u64 = a.details[\"transfers\"].as_array().unwrap().iter().map(|t| t[\"amount\"].as_str().unwrap().parse::<u64>().unwrap()).sum();\n        let b_amount: u64 = b.details[\"transfers\"].as_array().unwrap().iter().map(|t| t[\"amount\"].as_str().unwrap().parse::<u64>().unwrap()).sum();\n        a_amount.cmp(&b_amount)\n    }).into_iter().collect()\n}"
    #         },
    #         "status": "success"
    #     },
    #     "tokens": 2005
    # }
    # result = {
    #     "result": {
    #         "response": "getRecentTransactions",
    #         "params": {
    #             "address": "HuMZdNtbaNBPYex53irwAyKvxouLmEyN85MvAon81pXE",
    #             "days": 10,
    #             "filter": "biggest",
    #             "filter_function": "use serde_json::Value;\nuse std::collections::HashMap;\n\npub struct FullTransaction {\n    pub signature: String,\n    pub slot: u64,\n    pub timestamp: u64,\n    pub status: String,\n    pub details: Value,\n    pub token_metadata: HashMap<String, Value>,\n}\n\nfn filter_biggest_transaction(transactions: Vec<FullTransaction>) -> Vec<FullTransaction> {\n    transactions.into_iter().max_by(|a, b| {\n        let a_amount: f64 = a.details[\"transfers\"].as_array().unwrap().iter().map(|t| t[\"amount\"].as_str().unwrap().parse::<f64>().unwrap()).sum();\n        let b_amount: f64 = b.details[\"transfers\"].as_array().unwrap().iter().map(|t| t[\"amount\"].as_str().unwrap().parse::<f64>().unwrap()).sum();\n        a_amount.partial_cmp(&b_amount).unwrap()\n    }).into_iter().collect()\n}"
    #         },
    #         "status": "success"
    #     },
    #     "tokens": 2023
    # }

    print("Result: ", result)

    return result


@router.post("/generate-visualization")
async def generate_visualization_route(
    body: VisualizationBody  # { "jsonReturned": "{\"abc\":\"abc\"}" }
):
    result = generate_visualization(body.jsonReturned, body.question)
    # result = {
    # "result": "",
    # "tokens": 10765
    # }

    return result
