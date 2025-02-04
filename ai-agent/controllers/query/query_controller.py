from fastapi import APIRouter, Depends, File, Form, UploadFile, Header, HTTPException
from pydantic import BaseModel, Field
from fastapi.responses import StreamingResponse
import json
from configs.settings import settings

from services.query.query_service import (
    query_generator_openai,
    generate_visualization
)

router = APIRouter(
    prefix="/query",
    tags=["Query"]
)


class QueryBody(BaseModel):
    input_user: str | None = Field(None, alias="inputUser")
    inputUser: str | None = None
    address: str

    def get_input(self) -> str:
        return self.input_user or self.inputUser or ""

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "inputUser": "What was the trending tokens today?",
                    "address": "9unenHYtwUowNkWdZmSYTwzGxxdzKVJh7npk6W6uqRF3"
                }
            ]
        }
    }


class VisualizationBody(BaseModel):
    jsonReturned: str
    question: str
    address: str


@router.post("/generate-query")
async def generate_query_route(
    body: QueryBody,
    x_api_key: str = Header(..., alias="x-api-key")
):
    # Debug logging
    print("Received request body:", body.model_dump(exclude_none=True))

    input_user = body.get_input()
    print(f"Processed input: {input_user}")

    try:
        result = query_generator_openai(
            input_user,
            body.address,
        )
        # result = {
        #     "result": {
        #         "response": "getTrendingTokens",
        #         "status": "success",
        #         "params": {
        #             "address": body.address,
        #             "filters": []
        #         }
        #     },
        #     "tokens": 100
        # }

        print(result)

        return result
    except Exception as e:
        print(f"Error in generate_query_route: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-visualization")
async def generate_visualization_route(
    body: VisualizationBody,
    x_api_key: str = Header(..., alias="x-api-key")
):
    # Debug logging
    print("Received request body:", body.model_dump(exclude_none=True))

    result = generate_visualization(
        body.jsonReturned,
        body.question,
        settings.openai_key_secret
    )
    # result = {
    #     "result": "## Trending Tokens Analysis\n- **Token 1**: SWQ (Trading Volume: 1.2M SOL)\n- **Token 2**: HLS (24h Change: +15.2%)",
    #     "tokens": 100
    # }

    return result
