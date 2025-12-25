from fastapi import FastAPI
from app.config import settings
from app.core.logging import setup_logging
from app.api.health import router as health_router
from app.api.agents import router as agent_router

setup_logging()

app = FastAPI(
    title=settings.APP_NAME,
    version="0.0.1",
    debug=True,
)

app.include_router(
    health_router,
    prefix=settings.API_V1_STR
)

app.include_router(
    agent_router,
    prefix=settings.API_V1_STR
)
