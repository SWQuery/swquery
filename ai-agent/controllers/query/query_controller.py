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
        'address': '9unenHYtwUowNkWdZmSYTwzGxxdzKVJh7npk6W6uqRF3', 'days': 10}, 'status': 'success'}, 'tokens': 69420}
    print("Result: ", result)

    return result


@router.post("/generate-visualization")
async def generate_visualization_route(
    body: VisualizationBody  # { "jsonReturned": "{\"abc\":\"abc\"}" }
):
    # result = generate_visualization(body.jsonReturned, body.question)

    result = {
        "result": "# Solana Blockchain Data Summary\n\n## Transactions Overview\n\nBelow is a summary of the recent transactions recorded on the Solana blockchain.\n\n### General Information\n- **Total Transactions Analyzed**: 18\n- **Block Slot Range**: 308307399 - 308692900\n\n### Specific Transactions\n\n#### Transaction 1\n- **Signature**: `46jnbj2mhly3qq2qs6tai5gsysbgkvwftru9lyrok2xt2ebdu8zhwjkrablmpcuevi9pf6fsgjwiwuzsvwbjmihy`\n- **Slot**: 308692900\n- **Timestamp**: 1734706600\n- **Status**: Success\n- **Fee**: 0.00000632 SOL\n- **Transfers**:\n - **Amount**: 0.00000632 SOL\n - **Direction**: Out\n - **Owner**: `n/a`\n - **Mint**: `sol`\n- **Token Metadata**: None\n\n#### Transaction 2\n- **Signature**: `3xishw1abdvunfx4gwetphmq7s9dgpbygoe5xkpsyxj7zew4sxpn5vopdiswuresk9mrbinedrecb7neen3rbych`\n- **Slot**: 308528632\n- **Timestamp**: 1734638735\n- **Status**: Success\n- **Fee**: 0.00000632 SOL\n- **Transfers**:\n - **Amount**: 0.00000632 SOL\n - **Direction**: Out\n - **Owner**: `n/a`\n - **Mint**: `sol`\n- **Token Metadata**: None\n\n#### Transaction 3\n- **Signature**: `hn78pvbfyxd3ui3bib3chdmchpowmoznqofuvwzmdsvp7w57g5jb8b6kxsbzkosypk4xewstmqgqrdurfvuqnb1`\n- **Slot**: 308462396\n- **Timestamp**: 1734610961\n- **Status**: Success\n- **Fee**: 0.000005825 SOL\n- **Transfers**:\n - **Out**: 0.000005845 SOL\n - **In**: Total of 22 transfers, each 0.000000001 SOL\n - **Mint**: `sol`\n - **Owner**: `n/a`\n- **Token Metadata**: None\n\n#### Transaction 4\n- **Signature**: `5sr7rvg7i8mckdzqkyq7w2naeymyj4ebhzyngt5asra6n85xbckgbg5mo97dphqyfqydokjkr6psk1zvjz8ubbmd`\n- **Slot**: 308448998\n- **Timestamp**: 1734605392\n- **Status**: Success\n- **Fee**: 0.00000632 SOL\n- **Transfers**:\n - **Amount**: 0.00000632 SOL\n - **Direction**: Out\n - **Owner**: `n/a`\n - **Mint**: `sol`\n- **Token Metadata**: None\n\n#### Transaction 5\n- **Signature**: `3yej8agkyfpzdbl3io25q2hweqdkieyppcjzwnqnoyfdavafjpkwlqmk9f5tu7aipmzre5n2caxzkrsz73tqpfun`\n- **Slot**: 308448971\n- **Timestamp**: 1734605380\n- **Status**: Success\n- **Fee**: 0.00000632 SOL\n- **Transfers**:\n - **Amount**: 0.00000632 SOL\n - **Direction**: Out\n - **Owner**: `n/a`\n - **Mint**: `sol`\n- **Token Metadata**: None\n\n#### Transaction 6\n- **Signature**: `67sevdhstvy2yhsbd9dftkfs1g27wtaoitovtype9h4duwww6zaqtgoaahxdqbbygzfrcky52zascatlauyrysfa`\n- **Slot**: 308448932\n- **Timestamp**: 1734605364\n- **Status**: Success\n- **Fee**: 0.00000632 SOL\n- **Transfers**:\n - **Amount**: 0.00000632 SOL\n - **Direction**: Out\n - **Owner**: `n/a`\n - **Mint**: `sol`\n- **Token Metadata**: None\n\n#### Transaction 7\n- **Signature**: `2zylgdjgdxczbzqetlrewh4nd2u9ax3cfaszkrumhmm8m1mmg6pzqrcaqtbf5uwg3xv4c1y67dfmpnunscqhan8o`\n- **Slot**: 308448895\n- **Timestamp**: 1734605348\n- **Status**: Success\n- **Fee**: 0.00000632 SOL\n- **Transfers**:\n - **Amount**: 0.00000632 SOL\n - **Direction**: Out\n - **Owner**: `n/a`\n - **Mint**: `sol`\n- **Token Metadata**: None\n\n#### Transaction 8\n- **Signature**: `3qqlxsb5fhd1qjpimtnsczbtabupnnqgggrkqyrkzj3zprybutfvuxoj83zwwaur26cachyks3d4zjzt59qbibwa`\n- **Slot**: 308448886\n- **Timestamp**: 1734605344\n- **Status**: Success\n- **Fee**: 0.00000632 SOL\n- **Transfers**:\n - **Amount**: 0.00000632 SOL\n - **Direction**: Out\n - **Owner**: `n/a`\n - **Mint**: `sol`\n- **Token Metadata**: None\n\n#### Transaction 9\n- **Signature**: `ovwqtvzfotd4puitfcu354ty63sycxk61fs6rgcugcjvpo4vrtsii4iyfqakbmsnjsubxp3jj42cgubockvw1ui`\n- **Slot**: 308448847\n- **Timestamp**: 1734605327\n- **Status**: Success\n- **Fee**: 0.00000632 SOL\n- **Transfers**:\n - **Amount**: 0.00000632 SOL\n - **Direction**: Out\n - **Owner**: `n/a`\n - **Mint**: `sol`\n- **Token Metadata**: None\n\n#### Transaction 10\n- **Signature**: `39wucid6xgflsmeudzszr4ufmsyzkugsfokm1cbgmgzfkezoltpmmu5z3a1gghncxxh5hfb8gefqxsacttrsxqid`\n- **Slot**: 308448831\n- **Timestamp**: 1734605319\n- **Status**: Success\n- **Fee**: 0.00000632 SOL\n- **Transfers**:\n - **Amount**: 0.00000632 SOL\n - **Direction**: Out\n - **Owner**: `n/a`\n - **Mint**: `sol`\n- **Token Metadata**: None\n\n#### Transaction 11\n- **Signature**: `3grjxyjaqddz4c7cudfcspqaw5tbqxss1jwej7dr4nuysdh2p6qcdrkdw8xxsvrxdpdhdiwfraci71tvm7hxlqsc`\n- **Slot**: 308448808\n- **Timestamp**: 1734605310\n- **Status**: Success\n- **Fee**: 0.00000632 SOL\n- **Transfers**:\n - **Amount**: 0.00000632 SOL\n - **Direction**: Out\n - **Owner**: `n/a`\n - **Mint**: `sol`\n- **Token Metadata**: None\n\n#### Transaction 12\n- **Signature**: `blw7klgldwmhbucevknxt3ubpqmmr9zti4ovibvscp4slzvupjvbqqvnnjgmfgtdem8gzpvkzccess5xay22zea`\n- **Slot**: 308357500\n- **Timestamp**: 1734567295\n- **Status**: Success\n- **Fee**: 0.000005825 SOL\n- **Transfers**:\n - **Out**: 0.000005845 SOL\n - **In**: Total of 22 transfers, each 0.000000001 SOL\n - **Mint**: `sol`\n - **Owner**: `n/a`\n- **Token Metadata**: None\n\n#### Transaction 13\n- **Signature**: `4ckkc5k3du31sruo8qfbg5nbcjnjjb9h7p723n4ifwbtvmepfopm7ttchxvrgqldqxbsnvahephtbzbxjlzxdr2d`\n- **Slot**: 308330804\n- **Timestamp**: 1734556177\n- **Status**: Success\n- **Fee**: 0.0000149 SOL\n- **Transfers**:\n - **Out**: 0.0200149 SOL\n - **In**: 0.0200000 SOL\n - **Mint**: `sol`\n - **Owner**: `n/a`\n- **Token Metadata**: None\n\n#### Transaction 14\n- **Signature**: `5hgw8wx7agtzuxndzeoc145aabztgaxfardfh5pvf54ptlbkspmmggrxacf1fhgmhq4fsbwp7dkppoa9h4pej958`\n- **Slot**: 308314040\n- **Timestamp**: 1734549219\n- **Status**: Success\n- **Fee**: 1.015698 SOL\n- **Transfers**:\n - Multiple transfers involving wrapped SOL, USDC, USDT, and \"Pudgy Penguins\" with various directions and amounts.\n- **Token Metadata**:\n - **Mint**: `2zmmhcvqexdtde6vsfs7s7d5ouodfjhe8vd1gnbouauv`, **Name**: Pudgy Penguins, **Symbol**: PENGU\n - **Mint**: `epjfwdd5aufqssqem2qn1xzybapc8g4weggkzwytdt1v`, **Name**: USD Coin, **Symbol**: USDC\n - **Mint**: `es9vmfrzacermjfrf4h2fyd4kconky11mcce8benwnyb`, **Name**: USDT, **Symbol**: USDT\n - **Mint**: `so11111111111111111111111111111111111111112`, **Name**: Wrapped SOL, **Symbol**: SOL\n\n#### Transaction 15\n- **Signature**: `5rjskva1oagmw1uqcztmg32lhxff8k1ztp1outkvqiznmmdtwt5cuewq2mchvqbdshumcbdtpjjlnfsxucupmnz2`\n- **Slot**: 308307469\n- **Timestamp**: 1734546462\n- **Status**: Success\n- **Fee**: 0.0000054 SOL\n- **Transfers**:\n - **Amount**: 0.0000054 SOL\n - **Direction**: Out\n - **Owner**: `n/a`\n - **Mint**: `sol`\n- **Token Metadata**: None\n\n#### Transaction 16\n- **Signature**: `2tyxbdqnznfvgskplbdtvajcvps2lnqzfsrh7tpsfukdxrpksx5t5ri596vgqyjwsl2zrmcr79r1r8nhztqbvbhx`\n- **Slot**: 308307416\n- **Timestamp**: 1734546441\n- **Status**: Success\n- **Fee**: 0.0000053 SOL\n- **Transfers**:\n - **Out**: 0.0000071 SOL\n - **In**: Total of 19 transfers, each 0.0000001 SOL\n - **Mint**: `sol`\n - **Owner**: `n/a`\n- **Token Metadata**: None\n\n#### Transaction 17\n- **Signature**: `61ldkyquvu2hdxbyuntwn6icg3hum7nqnxkcpqwwhxzfumxvxw65bcarg1exvfbrregbj8oqnmhhzaunfttdkibe`\n- **Slot**: 308307399\n- **Timestamp**: 1734546433\n- **Status**: Success\n- **Fee**: 0.000060627 SOL\n- **Transfers**:\n - **In**: 27840.000000 PENGU\n - **Out**: 27840.000000 PENGU\n - **Direction**: Mixed\n - **Mint**: `2zmmhcvqexdtde6vsfs7s7d5ouodfjhe8vd1gnbouauv`\n <img src=\"https://arweave.net/BW67hICaKGd2_wamSB0IQq-x7Xwtmr2oJj1WnWGJRHU\" alt=\"Pudgy Penguins\" style=\"border-radius: 50%; width: 50px; height: 50px; vertical-align: middle;\"> **Name**: Pudgy Penguins, **Symbol**: PENGU\n\n### Anomalies & Notes\n- All transactions have a status of \"success\".\n- Transaction fees vary significantly across transactions.\n- Token metadata is mostly absent except for a few transactions involving specific tokens.\n\nThis concludes the summary of the analyzed data.\n",
        "tokens": 10765
    }

    return result
