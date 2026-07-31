from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.execution import ExecutionState
from app.models.queue import Queue
from app.schemas.execution import CampaignStatus
from app.automation.execution.execution_events import log_execution_event
from app.automation.execution.status_manager import transition_campaign_status


async def recover_campaign_execution(db: AsyncSession, campaign_id: str) -> None:
    """
    Recovers a campaign that might have crashed or been paused.
    Ensures that any RUNNING queue items are pushed back to PENDING so they can be retried.
    """
    await log_execution_event(db, campaign_id, "INFO", "Initiating recovery protocol for campaign")

    # Re-queue any items that were left in 'RUNNING' state
    stmt = select(Queue).where(
        Queue.campaign_id == campaign_id,
        Queue.status == "RUNNING"
    )
    result = await db.execute(stmt)
    running_items = result.scalars().all()

    requeue_count = 0
    for item in running_items:
        item.status = "PENDING"
        item.retries += 1
        requeue_count += 1

    if requeue_count > 0:
        await db.commit()
        await log_execution_event(db, campaign_id, "WARNING", f"Re-queued {requeue_count} items that were stuck in RUNNING state")

    # Set status to RECOVERING temporarily, then READY
    await transition_campaign_status(db, campaign_id, CampaignStatus.RECOVERING)

    # Clean up ExecutionState running variables
    stmt = select(ExecutionState).where(ExecutionState.campaign_id == campaign_id)
    result = await db.execute(stmt)
    state = result.scalars().first()

    if state:
        state.current_lead_id = None
        state.current_worker_id = None
        await db.commit()

    await transition_campaign_status(db, campaign_id, CampaignStatus.READY)
    await log_execution_event(db, campaign_id, "SUCCESS", "Recovery protocol complete. Campaign is READY.")
