from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.queue import Queue


async def load_pending_queue_batch(
        db: AsyncSession,
        campaign_id: str,
        batch_size: int = 50) -> List[Queue]:
    """
    Loads a batch of PENDING queue items for a specific campaign.
    Uses selectinload to eagerly fetch the lead data.
    """
    stmt = select(Queue).options(
        selectinload(Queue.lead)
    ).where(
        Queue.campaign_id == campaign_id,
        Queue.status == "PENDING"
    ).order_by(Queue.created_at.asc()).limit(batch_size)

    result = await db.execute(stmt)
    return list(result.scalars().all())
