from fastapi import APIRouter, Depends
from middlewares.api_key_middleware import validate_api_key

from .query.query_controller import router as QueryRouter

EndPointsRouter = APIRouter()

EndPointsRouter.include_router(QueryRouter, dependencies=[
    # Depends(validate_api_key)
])
