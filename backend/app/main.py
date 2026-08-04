from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.api.router import api_router, root_router
from app.core.config import settings
from app.core.exceptions import setup_exception_handlers
from app.core.logging import setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Application startup event
    setup_logging()
    logger.info(
        f"Starting {settings.APP_NAME} v{settings.APP_VERSION} in {settings.APP_ENV} mode"  # noqa: E501
    )
    yield
    # Application shutdown event
    logger.info("Shutting down application...")


app = FastAPI(
    title=settings.APP_NAME,
    description="Social Media Lead Automation API Backend",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    openapi_url="/openapi.json",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

setup_exception_handlers(app)


@app.get("/", tags=["Root"])
async def root():
    return {
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "message": "Welcome to the API",
    }


import os
from fastapi.staticfiles import StaticFiles

storage_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "storage")
media_dir = os.path.join(storage_dir, "media")
os.makedirs(media_dir, exist_ok=True)

app.mount("/storage", StaticFiles(directory=storage_dir), name="storage")
app.mount("/media", StaticFiles(directory=media_dir), name="media")

app.include_router(root_router)
app.include_router(api_router, prefix="/api")
app.include_router(api_router, prefix="/api/v1")
