from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):

    openrouter_api_key: str

    environment: str = "development"
    api_version: str = "v1"
    log_level: str = "INFO"
    
    # Database
    database_url: str = "sqlite:///./promptforge.db"
    chroma_persist_directory: str = "./chroma_db"
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    
    # CORS
    frontend_url: str = "http://localhost:3000"
    
    # App metadata (for OpenRouter headers)
    app_url: str = "http://localhost:8000"
    app_name: str = "PromptForge"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()