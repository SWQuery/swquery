from fastapi import APIRouter, Depends, File, Form, UploadFile
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
import json

from services.query.query_service import (
    query_generator_openai
)

router = APIRouter(
    prefix="/query",
    tags=["Query"]
)


class QueryBody(BaseModel):
    inputUser: str
    address: str


@router.post("/generate-query")
async def generate_query_route(
    body: QueryBody
):
    print("Body: ", body)
    # result = query_generator_openai(body.inputUser, body.address)
    result = {'result': {'response': 'getSignaturesForAddress', 'params': {
        'address': 'GtJHNhKQnnJZQTHq2Vh49HpR4yKKJmUonVYbLeS1RPs8'}, 'status': 'success'}, 'tokens': 991}
    print("Result: ", result)

    return result
