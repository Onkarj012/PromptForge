
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "PromptForge"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    ENV: str = "development"
    DATABASE_URL: str
    OPENROUTER_API_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()
