from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.execution import CampaignExecution
from app.schemas.execution import CampaignStatus
from app.automation.execution.execution_events import log_execution_event


async def transition_campaign_status(
    db: AsyncSession,
    campaign_id: str,
    new_status: CampaignStatus,
    error: str = None
) -> CampaignExecution:
    """
    Safely transitions a campaign to a new status.
    Ensures invalid transitions are prevented (e.g., cannot transition a Cancelled campaign to Running).
    """
    stmt = select(CampaignExecution).where(CampaignExecution.campaign_id == campaign_id)
    result = await db.execute(stmt)
    execution = result.scalars().first()

    now = datetime.utcnow()

    if not execution:
        # Create execution record if it doesn't exist
        execution = CampaignExecution(
            campaign_id=campaign_id,
            status=new_status.value
        )
        if new_status == CampaignStatus.RUNNING:
            execution.started_at = now
        db.add(execution)
        await log_execution_event(db, campaign_id, "INFO", f"Campaign Execution created with status {new_status.value}")
    else:
        # Define allowed transitions
        # From -> To
        allowed = True

        if execution.status == CampaignStatus.COMPLETED.value:
            allowed = False
        elif execution.status == CampaignStatus.CANCELLED.value:
            allowed = False

        # If we are failing, we always allow it
        if new_status == CampaignStatus.FAILED:
            allowed = True

        if not allowed:
            await log_execution_event(db, campaign_id, "WARNING", f"Attempted to transition from {execution.status} to {new_status.value}. Denied.")
            return execution

        # Update timestamps based on transition
        if execution.status != CampaignStatus.RUNNING.value and new_status == CampaignStatus.RUNNING:
            if not execution.started_at:
                execution.started_at = now

        if new_status in [
                CampaignStatus.COMPLETED,
                CampaignStatus.CANCELLED,
                CampaignStatus.FAILED]:
            execution.finished_at = now

        if error:
            execution.error = error

        await log_execution_event(db, campaign_id, "INFO", f"Campaign transitioned from {execution.status} to {new_status.value}")
        execution.status = new_status.value

    await db.commit()
    await db.refresh(execution)
    return execution
