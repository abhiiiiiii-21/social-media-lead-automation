import time
import json
from dataclasses import dataclass, asdict
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.log import ExecutionLog


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

# Global in-memory store for real-time tracking (since we don't have Redis yet)
# Key: campaign_id, Value: ScraperStats
_ACTIVE_JOBS: Dict[str, ScraperStats] = {}


class ProgressTracker:
    def __init__(self, session: AsyncSession, campaign_id: str):
        self.session = session
        self.campaign_id = campaign_id
        
        if campaign_id not in _ACTIVE_JOBS:
            _ACTIVE_JOBS[campaign_id] = ScraperStats(start_time=time.time(), status="RUNNING")
            
        self.stats = _ACTIVE_JOBS[campaign_id]

    async def log_event(self, level: str, message: str) -> None:
        """Write to ExecutionLog in DB"""
        log_entry = ExecutionLog(
            campaign_id=self.campaign_id,
            level=level,
            message=message
        )
        self.session.add(log_entry)
        await self.session.commit()

    def update_elapsed_time(self) -> None:
        self.stats.elapsed_time_sec = time.time() - self.stats.start_time

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

    async def mark_completed(self) -> None:
        self.stats.status = "COMPLETED"
        self.update_elapsed_time()
        await self.log_event("INFO", f"Scraping completed. Stats: {json.dumps(asdict(self.stats))}")

    async def mark_failed(self, reason: str) -> None:
        self.stats.status = "FAILED"
        self.update_elapsed_time()
        await self.log_event("CRITICAL", f"Scraping failed: {reason}. Stats: {json.dumps(asdict(self.stats))}")

    async def mark_stopped(self) -> None:
        self.stats.status = "STOPPED"
        self.update_elapsed_time()
        await self.log_event("WARNING", f"Scraping manually stopped. Stats: {json.dumps(asdict(self.stats))}")

    def get_stats(self) -> Dict[str, Any]:
        self.update_elapsed_time()
        return asdict(self.stats)

def get_job_stats(campaign_id: str) -> Optional[Dict[str, Any]]:
    if campaign_id in _ACTIVE_JOBS:
        stats = _ACTIVE_JOBS[campaign_id]
        stats.elapsed_time_sec = time.time() - stats.start_time
        return asdict(stats)
    return None
