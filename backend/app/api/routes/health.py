from fastapi import APIRouter

from app.core.config import settings
from app.schemas.health import HealthResponse, VersionResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(status="ok", database="connected")


@router.get("/version", response_model=VersionResponse)
async def get_version():
    return VersionResponse(
        name=settings.APP_NAME,
        version=settings.APP_VERSION,
        environment=settings.APP_ENV,
    )
