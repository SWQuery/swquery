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


@router.post("/generate-query")
async def generate_query_route(
    body: QueryBody
):
    result = query_generator_openai(body.inputUser)

    return result
