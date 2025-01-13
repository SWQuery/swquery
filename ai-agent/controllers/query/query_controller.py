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
    openai_key: str


class VisualizationBody(BaseModel):
    jsonReturned: str
    question: str
    openai_key: str


@router.post("/generate-query")
async def generate_query_route(
    body: QueryBody
):
    result = query_generator_openai(body.inputUser, body.address, body.openai_key)
    
    print("Result: ", result)

    return result


@router.post("/generate-visualization")
async def generate_visualization_route(
    body: VisualizationBody
):
    result = generate_visualization(body.jsonReturned, body.question, body.openai_key)

    return result
