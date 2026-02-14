from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.core.logging import setup_logging
from app.api.health import router as health_router
from app.api.agents import router as agent_router
from app.db.init_db import init_db

setup_logging()

app = FastAPI(
    title=settings.APP_NAME,
    version="0.0.1",
    debug=True,
)


@app.on_event("startup")
async def ensure_db_ready():
    if settings.ENV == "development" or settings.DEBUG:
        await init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    health_router,
    prefix=settings.API_V1_STR
)

app.include_router(
    agent_router,
    prefix=settings.API_V1_STR
)
