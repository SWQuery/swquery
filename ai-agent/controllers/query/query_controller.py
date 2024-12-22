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
    # result = query_generator_openai(body.inputUser, body.address)
    result = {'result': {'response': 'getRecentTransactions', 'params': {
        # 'address': 'HuMZdNtbaNBPYex53irwAyKvxouLmEyN85MvAon81pXE', 'days': 70}, 'status': 'success'}, 'tokens': 69420}
        'address': '9unenHYtwUowNkWdZmSYTwzGxxdzKVJh7npk6W6uqRF3', 'days': 5}, 'status': 'success'}, 'tokens': 69420}
    print("Result: ", result)

    return result


@router.post("/generate-visualization")
async def generate_visualization_route(
    body: VisualizationBody  # { "jsonReturned": "{\"abc\":\"abc\"}" }
):
    # result = generate_visualization(body.jsonReturned, body.question)

    result = {
        "result": "# Solana Blockchain Data Summary ## Transactions Overview Below is a summary of the recent transactions recorded on the Solana blockchain. ### General Information - **Total Transactions Analyzed**: 18 - **Block Slot Range**: 308307399 - 308692900 ### Specific Transactions #### Transaction 1 - **Signature**: `46jnbj2mhly3qq2qs6tai5gsysbgkvwftru9lyrok2xt2ebdu8zhwjkrablmpcuevi9pf6fsgjwiwuzsvwbjmihy` - **Slot**: 308692900 - **Timestamp**: 1734706600 - **Status**: Success - **Fee**: 0.00000632 SOL - **Transfers**: - **Amount**: 0.00000632 SOL - **Direction**: Out - **Owner**: `n/a` - **Mint**: `sol` - **Token Metadata**: None #### Transaction 2 - **Signature**: `3xishw1abdvunfx4gwetphmq7s9dgpbygoe5xkpsyxj7zew4sxpn5vopdiswuresk9mrbinedrecb7neen3rbych` - **Slot**: 308528632 - **Timestamp**: 1734638735 - **Status**: Success - **Fee**: 0.00000632 SOL - **Transfers**: - **Amount**: 0.00000632 SOL - **Direction**: Out - **Owner**: `n/a` - **Mint**: `sol` - **Token Metadata**: None #### Transaction 3 - **Signature**: `hn78pvbfyxd3ui3bib3chdmchpowmoznqofuvwzmdsvp7w57g5jb8b6kxsbzkosypk4xewstmqgqrdurfvuqnb1` - **Slot**: 308462396 - **Timestamp**: 1734610961 - **Status**: Success - **Fee**: 0.000005825 SOL - **Transfers**: - **Out**: 0.000005845 SOL - **In**: Total of 22 transfers, each 0.000000001 SOL - **Mint**: `sol` - **Owner**: `n/a` - **Token Metadata**: None #### Transaction 4 - **Signature**: `5sr7rvg7i8mckdzqkyq7w2naeymyj4ebhzyngt5asra6n85xbckgbg5mo97dphqyfqydokjkr6psk1zvjz8ubbmd` - **Slot**: 308448998 - **Timestamp**: 1734605392 - **Status**: Success - **Fee**: 0.00000632 SOL - **Transfers**: - **Amount**: 0.00000632 SOL - **Direction**: Out - **Owner**: `n/a` - **Mint**: `sol` - **Token Metadata**: None #### Transaction 5 - **Signature**: `3yej8agkyfpzdbl3io25q2hweqdkieyppcjzwnqnoyfdavafjpkwlqmk9f5tu7aipmzre5n2caxzkrsz73tqpfun` - **Slot**: 308448971 - **Timestamp**: 1734605380 - **Status**: Success - **Fee**: 0.00000632 SOL - **Transfers**: - **Amount**: 0.00000632 SOL - **Direction**: Out - **Owner**: `n/a` - **Mint**: `sol` - **Token Metadata**: None #### Transaction 6 - **Signature**: `67sevdhstvy2yhsbd9dftkfs1g27wtaoitovtype9h4duwww6zaqtgoaahxdqbbygzfrcky52zascatlauyrysfa` - **Slot**: 308448932 - **Timestamp**: 1734605364 - **Status**: Success - **Fee**: 0.00000632 SOL - **Transfers**: - **Amount**: 0.00000632 SOL - **Direction**: Out - **Owner**: `n/a` - **Mint**: `sol` - **Token Metadata**: None #### Transaction 7 - **Signature**: `2zylgdjgdxczbzqetlrewh4nd2u9ax3cfaszkrumhmm8m1mmg6pzqrcaqtbf5uwg3xv4c1y67dfmpnunscqhan8o` - **Slot**: 308448895 - **Timestamp**: 1734605348 - **Status**: Success - **Fee**: 0.00000632 SOL - **Transfers**: - **Amount**: 0.00000632 SOL - **Direction**: Out - **Owner**: `n/a` - **Mint**: `sol` - **Token Metadata**: None #### Transaction 8 - **Signature**: `3qqlxsb5fhd1qjpimtnsczbtabupnnqgggrkqyrkzj3zprybutfvuxoj83zwwaur26cachyks3d4zjzt59qbibwa` - **Slot**: 308448886 - **Timestamp**: 1734605344 - **Status**: Success - **Fee**: 0.00000632 SOL - **Transfers**: - **Amount**: 0.00000632 SOL - **Direction**: Out - **Owner**: `n/a` - **Mint**: `sol` - **Token Metadata**: None ### Anomalies & Notes - All transactions have a status of 'success'. - Transaction fees vary significantly across transactions. - Token metadata is mostly absent except for a few transactions involving specific tokens. This concludes the summary of the analyzed data.",
        "tokens": 10765
    }

    return result
