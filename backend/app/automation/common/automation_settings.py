from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.models.settings import Settings

class AutomationConfig:
    def __init__(self, settings_row: Optional[Settings] = None):
        if settings_row:
            self.min_delay_ms = settings_row.automation_min_delay_ms
            self.max_delay_ms = settings_row.automation_max_delay_ms
            self.nav_timeout_ms = settings_row.automation_nav_timeout_ms
            self.max_profiles_per_run = settings_row.automation_max_profiles_per_run
            self.max_runtime_sec = settings_row.automation_max_runtime_sec
            self.pause_duration_sec = settings_row.automation_pause_duration_sec
        else:
            self.min_delay_ms = 2000
            self.max_delay_ms = 5000
            self.nav_timeout_ms = 30000
            self.max_profiles_per_run = 100
            self.max_runtime_sec = 3600
            self.pause_duration_sec = 300

async def get_automation_config(session: AsyncSession) -> AutomationConfig:
    """
    Fetches the current automation configuration from the database.
    """
    result = await session.execute(select(Settings).limit(1))
    settings_row = result.scalars().first()
    return AutomationConfig(settings_row)
