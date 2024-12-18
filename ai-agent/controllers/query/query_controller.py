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
    result = {'result': {'response': 'getRecentTransactions', 'params': {
        'address': 'HuMZdNtbaNBPYex53irwAyKvxouLmEyN85MvAon81pXE', 'days': 70}, 'status': 'success'}, 'tokens': 69420}
    print("Result: ", result)

    return result
