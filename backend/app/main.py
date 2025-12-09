from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import refine
import logging
import uvicorn

# Add logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="PromptForge API",
    description="Agentic Multi-Model Prompt Curator",
    version="0.1.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(refine.router, prefix="/api/v1")


@app.on_event("startup")
async def startup_event():
    """Log startup info."""
    api_key_preview = settings.openrouter_api_key[:10] + "..." if settings.openrouter_api_key else "NOT SET"
    logger.info(f"OpenRouter API Key: {api_key_preview}")
    logger.info(f"Environment: {settings.environment}")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "environment": settings.environment,
        "version": "0.1.0",
        "api_key_configured": bool(settings.openrouter_api_key)
    }


if __name__ == "__main__":

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=True if settings.environment == "development" else False
    )