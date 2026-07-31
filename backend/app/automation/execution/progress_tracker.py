from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.queue import Queue
from app.models.execution import ExecutionState


async def update_progress_metrics(db: AsyncSession, campaign_id: str) -> ExecutionState:
    """
    Calculates progress percentage, updates skipped/failed counts, and recalculates ETA.
    """
    # 1. Fetch current state
    stmt = select(ExecutionState).where(ExecutionState.campaign_id == campaign_id)
    result = await db.execute(stmt)
    state = result.scalars().first()

    if not state:
        state = ExecutionState(campaign_id=campaign_id)
        db.add(state)

    # 2. Calculate Queue Metrics
    # Fetch counts grouped by status
    stmt = select(
        Queue.status,
        func.count(
            Queue.id)).where(
        Queue.campaign_id == campaign_id).group_by(
                Queue.status)
    result = await db.execute(stmt)
    counts = dict(result.all())

    pending = counts.get("PENDING", 0)
    completed = counts.get("COMPLETED", 0)
    failed = counts.get("FAILED", 0)
    skipped = counts.get("SKIPPED", 0)
    running = counts.get("RUNNING", 0)

    total = pending + completed + failed + skipped + running
    processed = completed + failed + skipped

    # 3. Update state
    state.remaining_leads = pending + running
    state.processed_leads = completed
    state.failed_leads = failed
    state.skipped_leads = skipped

    if total > 0:
        state.progress = round((processed / total) * 100.0, 2)
    else:
        state.progress = 0.0

    # 4. ETA Calculation
    # Very basic ETA: if we know how many are processed and remaining, we'd need timestamps of processing.
    # We will refine ETA in a future phase when we have exact worker timings.
    # For now, it stays None or we can set a dummy.
    state.eta_seconds = None

    await db.commit()
    await db.refresh(state)
    return state
