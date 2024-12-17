from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security.api_key import APIKeyHeader

from configs import settings

settings = settings.get_settings()

api_key_header = APIKeyHeader(name=settings.api_ai_key_name, auto_error=False)

async def validate_api_key(api_key: str = Security(api_key_header)):
    # if api_key != settings.api_ai_key_secret:
    #     raise HTTPException(status_code=403, detail="Forbidden")

    return api_key