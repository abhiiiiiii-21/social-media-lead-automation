from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.settings import Settings
from app.schemas.settings import SettingsUpdate


class SettingsService:
    @staticmethod
    async def get_settings(db: AsyncSession) -> Settings:
        result = await db.execute(select(Settings).limit(1))
        settings = result.scalar_one_or_none()

        if not settings:
            # Initialize default settings
            settings = Settings(
                groq_model="llama3-70b-8192",
                temperature=0.7,
                max_tokens=1000,
                retry_limit=3,
                delay_between_requests=5,
            )
            db.add(settings)
            await db.commit()
            await db.refresh(settings)

        return settings

    @staticmethod
    async def update_settings(
        db: AsyncSession, settings_in: SettingsUpdate
    ) -> Settings:
        settings = await SettingsService.get_settings(db)

        update_data = settings_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(settings, field, value)

        await db.commit()
        await db.refresh(settings)
        return settings
