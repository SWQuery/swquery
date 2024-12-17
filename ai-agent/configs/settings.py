import os
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    api_ai_key_name: str = "api-ai-key"
    api_ai_key_secret: str
    openai_key_secret: str

    model_config = (
        SettingsConfigDict(env_file=".env") if ".env" in os.listdir(".") else None
    )


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()
