import time
import json
from dataclasses import dataclass, asdict
from typing import Dict, Any, Optional
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from app.models.log import ExecutionLog
from app.models.campaign import Campaign
from app.database.session import AsyncSessionLocal


@dataclass
class ScraperStats:
    profiles_discovered: int = 0
    profiles_processed: int = 0
    profiles_inserted: int = 0
    duplicates_skipped: int = 0
    errors: int = 0
    start_time: float = 0.0
    elapsed_time_sec: float = 0.0
    status: str = "INITIALIZING"
    stage: str = "Starting"
    current_username: Optional[str] = None
    current_url: Optional[str] = None
    target_count: int = 100


# In-memory store for active job progress metrics
_ACTIVE_JOBS: Dict[str, ScraperStats] = {}


class ProgressTracker:
    def __init__(self, session: Optional[AsyncSession], campaign_id: str, target_count: int = 100):
        self.session = session
        self.campaign_id = campaign_id
        
        if campaign_id not in _ACTIVE_JOBS:
            _ACTIVE_JOBS[campaign_id] = ScraperStats(
                start_time=time.time(), 
                status="RUNNING",
                stage="Starting",
                target_count=target_count
            )
        else:
            _ACTIVE_JOBS[campaign_id].status = "RUNNING"
            _ACTIVE_JOBS[campaign_id].target_count = target_count
            
        self.stats = _ACTIVE_JOBS[campaign_id]

    async def log_event(self, level: str, message: str) -> None:
        """Write to ExecutionLog in DB using an isolated session"""
        try:
            async with AsyncSessionLocal() as session:
                log_entry = ExecutionLog(
                    campaign_id=self.campaign_id,
                    level=level,
                    message=message
                )
                session.add(log_entry)
                await session.commit()
        except Exception as e:
            logger.debug(f"Failed to persist execution log: {e}")

    async def _update_db_campaign_status(self, db_status: str) -> None:
        """Update campaign status column in SQLite database using an isolated session."""
        try:
            async with AsyncSessionLocal() as session:
                stmt = update(Campaign).where(Campaign.id == self.campaign_id).values(status=db_status)
                await session.execute(stmt)
                await session.commit()
        except Exception as e:
            logger.debug(f"Failed to update campaign status in DB: {e}")

    def update_elapsed_time(self) -> None:
        if self.stats.start_time > 0:
            self.stats.elapsed_time_sec = round(time.time() - self.stats.start_time, 1)

    async def set_stage(self, stage: str, username: Optional[str] = None, url: Optional[str] = None) -> None:
        self.stats.stage = stage
        if username is not None:
            self.stats.current_username = username
        if url is not None:
            self.stats.current_url = url
        self.update_elapsed_time()

    async def add_discovered(self, count: int = 1) -> None:
        self.stats.profiles_discovered += count

    async def add_processed(self, count: int = 1) -> None:
        self.stats.profiles_processed += count
        self.update_elapsed_time()

    async def add_inserted(self, count: int = 1) -> None:
        self.stats.profiles_inserted += count

    async def add_duplicate(self, count: int = 1) -> None:
        self.stats.duplicates_skipped += count

    async def add_error(self, message: str) -> None:
        self.stats.errors += 1
        await self.log_event("ERROR", message)

    async def mark_running(self) -> None:
        self.stats.status = "RUNNING"
        self.update_elapsed_time()
        await self._update_db_campaign_status("running")

    async def mark_completed(self) -> None:
        self.stats.status = "COMPLETED"
        self.stats.stage = "Completed"
        self.update_elapsed_time()
        await self._update_db_campaign_status("completed")
        await self.log_event("INFO", f"Scraping completed. Final stats: {json.dumps(asdict(self.stats))}")

    async def mark_failed(self, reason: str) -> None:
        self.stats.status = "FAILED"
        self.stats.stage = "Failed"
        self.update_elapsed_time()
        await self._update_db_campaign_status("failed")
        await self.log_event("CRITICAL", f"Scraping failed: {reason}. Stats: {json.dumps(asdict(self.stats))}")

    async def mark_stopped(self) -> None:
        self.stats.status = "STOPPED"
        self.stats.stage = "Stopped"
        self.update_elapsed_time()
        await self._update_db_campaign_status("stopped")
        await self.log_event("WARNING", f"Scraping stopped. Stats: {json.dumps(asdict(self.stats))}")

    def get_stats(self) -> Dict[str, Any]:
        self.update_elapsed_time()
        return asdict(self.stats)


def get_job_stats(campaign_id: str) -> Optional[Dict[str, Any]]:
    if campaign_id in _ACTIVE_JOBS:
        stats = _ACTIVE_JOBS[campaign_id]
        if stats.start_time > 0 and stats.status == "RUNNING":
            stats.elapsed_time_sec = round(time.time() - stats.start_time, 1)
        return asdict(stats)
    return None
