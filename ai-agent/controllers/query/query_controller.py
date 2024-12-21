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
        'address': 'HuMZdNtbaNBPYex53irwAyKvxouLmEyN85MvAon81pXE', 'days': 70}, 'status': 'success'}, 'tokens': 69420}
    print("Result: ", result)

    return result


@router.post("/generate-visualization")
async def generate_visualization_route(
    body: VisualizationBody  # { "jsonReturned": "{\"abc\":\"abc\"}" }
):
    # result = generate_visualization(body.jsonReturned, body.question)

    result = {
        "result": "# Solana Blockchain Data Summary\n\n## Transaction Overview\n\n### Transaction 1\n- **Signature:** `4dsjzbcz6ge2v6uan4xk8ck84exqcth39vaamgeb3cu6xm8b2l9gtqpazqmuex9mb76rchvkumftz371gtk1txtd`\n- **Slot:** 296153212\n- **Blocktime:** 1729179206\n- **Status:** Success\n- **Fee:** 0.00001 SOL\n- **Accounts Involved:**\n - `6s3qfeth7kfqupco4df2owu8suhmjz8c9hnka9hrazno`\n - `7fjbrjmvca2pyczvirbeqsuf1usvpl4lnzjaap3dj2cx`\n - `humzdntbanbpyex53irwaykvxoulmeyn85mvaon81pxe`\n - `11111111111111111111111111111111`\n- **Instructions:**\n - Program ID `11111111111111111111111111111111`: Data - `3bxs4fftu9t19dnf`\n- **Balances:**\n - Pre: `[672.609468 SOL, 0 SOL, 1.00083658 SOL, 0.000000001 SOL]`\n - Post: `[672.598468 SOL, 0 SOL, 1.00083658 SOL, 0.000000001 SOL]`\n\n### Transaction 2\n- **Signature:** `3uqawb24yaheouzehfut5g3bqqvw3ijcne46nhqe5y7cpg7zh9bzf29kmzvhdfot5tnd17s9ydkaavmwt4gvrj5s`\n- **Slot:** 296153044\n- **Blocktime:** 1729179125\n- **Status:** Success\n- **Fee:** 0.000085 SOL\n- **Accounts Involved:**\n - `humzdntbanbpyex53irwaykvxoulmeyn85mvaon81pxe`\n - `7fs9uqvpvvnbwena2hrfqbbeya8rgpuuzyyzlrypj2cx`\n - `11111111111111111111111111111111`\n - `computebudget111111111111111111111111111111`\n- **Instructions:**\n - Program ID `computebudget111111111111111111111111111111`: Data - `3atjtxcctbsv`\n- **Balances:**\n - Pre: `[6699.99992058 SOL, 1 SOL, 0.000000001 SOL]`\n - Post: `[1.00083558 SOL, 6699.9999 SOL, 0.000000001 SOL]`\n\n### Transaction 3\n- **Signature:** `3mcub44vvbclpcdpaazrcrfwf3ftzqcnrlqtxdhhot1nvmvcekhntn9mcwbp7lte8inblrqkniplkqzqguhmhkzn`\n- **Slot:** 296152896\n- **Blocktime:** 1729179057\n- **Status:** Success\n- **Fee:** 0.0000056 SOL\n- **Accounts Involved:**\n - `habp5bncmssbc3vkchyebepym5dctnryeg2lvg464e96`\n - `2krz7w2sbxe12s6mnirqicuysmuml6mec7yych2wbqip`\n - `57g9cgvywksxypvmu3iefqjxvcdtq45bvpckhvay9rrs`\n - `5jk3ym9qzew7uv7kgmaqw72nco8oxhs553zaasrwawhl`\n - `64t1sjx3a1yqhdvxjrdhj1magfszjmd7fsgu7hr8zjlz`\n - `6aqrcj1as8jkuvyofukhpnztegaesegnbkfhmfvr8kph`\n - `6js18rizfyhzet9jcmnfj3s2sg7honnt4d1bey4nzfjo`\n - `742a6uladqkhwrfwsxy2uqorwt1wxepy5jcucn75ig6`\n - `8loyn38nuzeu2ns3r7t4of4yx6eayjzuxhxztlzgrpmb`\n - `8yt4aysz1q9fpbzg4kkvhzt9anbbyjpqjnejog4qkmke`\n - `93deefj1pofpxly3bvjtbsc57xmfsmnduhsddpphoiuu`\n - `9a6d8ygvvjpjhryjzmvwhyynglxevkt8yy5yxredfupp`\n - `bnbbbhvbrpepsieattv4ts2o2xoe4mykjmdyk7uxzdcw`\n - `ejpzcjw9gqxvaxeiptsf93fmouvwkttindkt6tb93uqg`\n - `fkxep5ws8rg37sr4qdad5hohx1yxizhbi17mcwmjplti`\n - `hh1kb1dto4f8jtkkcstsdoh7ivq2cmmcy5nfae4aj6sv`\n - `hiuamcd18cwlekkucdukqg9vjfbughkcvsdyzzcypcxu`\n - `humzdntbanbpyex53irwaykvxoulmeyn85mvaon81pxe`\n - `hyykie831gjzbjunxfwlgpdtmh4nazzwi9h2k45ny6uv`\n - `11111111111111111111111111111111`\n - `computebudget111111111111111111111111111111`\n- **Instructions:**\n - Program ID `computebudget111111111111111111111111111111`: Data - `jnv5sf`\n- **Balances:**\n - Pre: `[2262.182635 SOL, 0.266985876 SOL, 0.291207927 SOL, 4124.546179 SOL, 0.098921370 SOL, 0.047263766 SOL, 0.684210726 SOL, 0.039021580 SOL, 201954.346629 SOL, 0.075601875 SOL, 0.031062262 SOL, 0.061059720 SOL, 0.992357697 SOL, 2268.052939 SOL, 0.710617119 SOL, 0.009874695 SOL, 1178.525857 SOL, 6699.999920480 SOL, 0.208467105 SOL, 0.000000001 SOL, 0.000000001 SOL]`\n - Post: `[2262.175235 SOL, 0.266985976 SOL, 0.291208027 SOL, 4124.546279 SOL, 0.098921470 SOL, 0.047263866 SOL, 0.684210826 SOL, 0.039021680 SOL, 201954.346729 SOL, 0.075601975 SOL, 0.031062362 SOL, 0.061059820 SOL, 0.992357797 SOL, 2268.053039 SOL, 0.710617219 SOL, 0.009874795 SOL, 1178.525957 SOL, 6699.999920580 SOL, 0.208467205 SOL, 0.000000001 SOL, 0.000000001 SOL]`\n\n### Transaction 4\n- **Signature:** `2vcjhahyhzdwhiwsyzhwjkae35fapcngzchbp41fbngnwfgfgjcuczsea3ufyu7ckha8fmtdzhxrj1k11w8mjtgm`\n- **Slot:** 296152895\n- **Blocktime:** 1729179057\n- **Status:** Success\n- **Fee:** 0.0000056 SOL\n- **Accounts Involved:** Same as Transaction 3\n- **Instructions:** Same as Transaction 3\n- **Balances:** Same as Transaction 3\n\n### Transaction 5\n- **Signature:** `ssnegcovxfek1te3wj8fqgn5ub75brji2fme1mc9yqopos9vplhot5rrbp3jpir3figd3ydw3c6vyyy9hqjmskg`\n- **Slot:** 296152872\n- **Blocktime:** 1729179046\n- **Status:** Success\n- **Fee:** 0.000085 SOL\n- **Accounts Involved:**\n - `humzdntbanbpyex53irwaykvxoulmeyn85mvaon81pxe`\n - `7fs9uqvpvvnbwena2hrfqbbeya8rgpuuzyyzlrypj2cx`\n - `11111111111111111111111111111111`\n - `computebudget111111111111111111111111111111`\n- **Instructions:**\n - Program ID `computebudget111111111111111111111111111111`: Data - `3atjtxcctbsv`\n- **Balances:**\n - Pre: `[6701.000005380 SOL, 1 SOL, 0.000000001 SOL]`\n - Post: `[6699.999920380 SOL, 1 SOL, 0.000000001 SOL]`\n\n### Transaction 6\n- **Signature:** `2kdfdwhwtnqgxcm4edbjs4rd2zvzfvmvhi2vdfrru9yizdqxnx3j6frywmwqr4dcsqzqxtfmpispawp9pmeudhmn`\n- **Slot:** 296152116\n- **Blocktime:** 1729178693\n- **Status:** Success\n- **Fee:** 0.000005 SOL\n- **Accounts Involved:**\n - `grzspengu2kxom9mw8esodmqou52adhmnwmzpp2nusgh`\n - `humzdntbanbpyex53irwaykvxoulmeyn85mvaon81pxe`\n - `11111111111111111111111111111111`\n- **Instructions:**\n - Program ID `11111111111111111111111111111111`: Data - `3bxs3zwuubafwypb`\n- **Balances:**\n - Pre: `[20683.997452357 SOL, 5708.000005380 SOL, 0.000000001 SOL]`\n - Post: `[19690.997447357 SOL, 6701.000005380 SOL, 0.000000001 SOL]`\n\n### Transaction 7\n- **Signature:** `3m3hnuyurxgqlikaj4niqv6psuqlmh7staujfs9yuoddxisssufygm2vvdbb4tctlcj5t125nt6htkgmy7asymth`\n- **Slot:** 296152084\n- **Blocktime:** 1729178678\n- **Status:** Success\n- **Fee:** 0.000005 SOL\n- **Accounts Involved:**\n - `grzspengu2kxom9mw8esodmqou52adhmnwmzpp2nusgh`\n - `humzdntbanbpyex53irwaykvxoulmeyn85mvaon81pxe`\n - `11111111111111111111111111111111`\n- **Instructions:**\n - Program ID `11111111111111111111111111111111`: Data - `3bxs3zs4umkwpmq3`\n- **Balances:**\n - Pre: `[25196.997457357 SOL, 1195.000005380 SOL, 0.000000001 SOL]`\n - Post: `[20683.997452357 SOL, 5708.000005380 SOL, 0.000000001 SOL]`\n\n### Transaction 8\n- **Signature:** `3d4ycvisryyobiewykid4v52i6xqcbqpbgqa8fn7gukbcjhqyyffmnyfmcvzocb5hcmkvy5fbtg51dz7tgvw4l3q`\n- **Slot:** 296152049\n- **Blocktime:** 1729178662\n- **Status:** Success\n- **Fee:** 0.000005 SOL\n- **Accounts Involved:**\n - `grzspengu2kxom9mw8esodmqou52adhmnwmzpp2nusgh`\n - `humzdntbanbpyex53irwaykvxoulmeyn85mvaon81pxe`\n - `11111111111111111111111111111111`\n- **Instructions:**\n - Program ID `11111111111111111111111111111111`: Data - `3bxs3zt4tnc5q9uz`\n- **Balances:**\n - Pre: `[26390.997462357 SOL, 1.000000538 SOL, 0.000000001 SOL]`\n - Post: `[25196.997457357 SOL, 1195.000005380 SOL, 0.000000001 SOL]`\n\n## Observations\n- **All transactions were successful with no errors reported.**\n- **The fees for transactions varied between 0.000005 SOL and 0.000085 SOL.**\n- **Significant account balance changes were observed, especially in larger transactions.**",
        "tokens": 10765
    }

    return result
