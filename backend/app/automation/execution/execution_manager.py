import asyncio
from sqlalchemy.ext.asyncio import AsyncSession

from app.automation.execution.campaign_executor import run_campaign
from app.automation.execution.status_manager import transition_campaign_status
from app.automation.execution.execution_recovery import recover_campaign_execution
from app.schemas.execution import CampaignStatus


class ExecutionManager:
    """
    Centralized controller for campaign execution API calls.
    """

    def __init__(self):
        # Keeps track of active asyncio Tasks if we needed in-memory cancellation
        # In a real distributed system, we'd use Redis or Celery.
        # For Phase 10A, simple async tasks are sufficient.
        self.active_tasks = {}

    async def start_campaign(
            self,
            db: AsyncSession,
            campaign_id: str,
            instagram_account: str):
        # Set status to READY then let loop set to RUNNING
        await transition_campaign_status(db, campaign_id, CampaignStatus.READY)
        task = asyncio.create_task(run_campaign(campaign_id, instagram_account))
        self.active_tasks[campaign_id] = task
        return True

    async def pause_campaign(self, db: AsyncSession, campaign_id: str):
        await transition_campaign_status(db, campaign_id, CampaignStatus.PAUSED)
        return True

    async def resume_campaign(
            self,
            db: AsyncSession,
            campaign_id: str,
            instagram_account: str):
        await recover_campaign_execution(db, campaign_id)
        task = asyncio.create_task(run_campaign(campaign_id, instagram_account))
        self.active_tasks[campaign_id] = task
        return True

    async def stop_campaign(self, db: AsyncSession, campaign_id: str):
        await transition_campaign_status(db, campaign_id, CampaignStatus.CANCELLED)
        if campaign_id in self.active_tasks:
            self.active_tasks[campaign_id].cancel()
            del self.active_tasks[campaign_id]
        return True


execution_manager = ExecutionManager()
