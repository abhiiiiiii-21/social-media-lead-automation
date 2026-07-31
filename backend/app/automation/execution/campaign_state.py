from typing import Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.execution import ExecutionState


async def get_execution_state(db: AsyncSession, campaign_id: str) -> ExecutionState:
    """
    Retrieves or creates the ExecutionState for a campaign.
    """
    stmt = select(ExecutionState).where(ExecutionState.campaign_id == campaign_id)
    result = await db.execute(stmt)
    state = result.scalars().first()

    if not state:
        state = ExecutionState(campaign_id=campaign_id)
        db.add(state)
        await db.commit()
        await db.refresh(state)

    return state


async def update_execution_state(
    db: AsyncSession,
    campaign_id: str,
    current_lead_id: Optional[str] = None,
    current_worker_id: Optional[str] = None,
    current_session: Optional[str] = None,
    record_checkpoint: bool = False
) -> ExecutionState:
    """
    Updates the active state trackers.
    """
    state = await get_execution_state(db, campaign_id)

    if current_lead_id is not None:
        state.current_lead_id = current_lead_id
    if current_worker_id is not None:
        state.current_worker_id = current_worker_id
    if current_session is not None:
        state.current_session = current_session

    if record_checkpoint:
        state.last_checkpoint = datetime.utcnow()

    await db.commit()
    await db.refresh(state)
    return state
