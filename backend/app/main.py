from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.core.logging import setup_logging
from app.api.health import router as health_router
from app.api.agents import router as agent_router
from app.api.bench import router as bench_router
from app.db.init_db import init_db

setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.ENV == "development" or settings.DEBUG:
        await init_db()
    yield


app = FastAPI(title=settings.APP_NAME, version="0.0.1", debug=settings.DEBUG, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(agent_router, prefix=settings.API_V1_STR)
app.include_router(bench_router, prefix=settings.API_V1_STR)
