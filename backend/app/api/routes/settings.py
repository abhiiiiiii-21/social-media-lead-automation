from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.schemas.settings import SettingsResponse, SettingsUpdate
from app.services.settings import SettingsService

router = APIRouter()


@router.get("/", response_model=SettingsResponse)
async def get_settings(db: AsyncSession = Depends(get_db)):
    return await SettingsService.get_settings(db)


@router.patch("/", response_model=SettingsResponse)
async def update_settings(
    settings_in: SettingsUpdate, db: AsyncSession = Depends(get_db)
):
    return await SettingsService.update_settings(db, settings_in)
