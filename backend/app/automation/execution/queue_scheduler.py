from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.queue import Queue
from app.automation.execution.queue_loader import load_pending_queue_batch
from app.automation.memory.pre_flight_checks import verify_pre_flight_checks
from app.automation.execution.execution_events import log_execution_event


async def get_next_valid_queue_item(
    db: AsyncSession,
    campaign_id: str,
    instagram_account: str
) -> Optional[Queue]:
    """
    Loads a batch of queue items and iterates through them, running pre-flight checks.
    Automatically marks invalid items as SKIPPED or FAILED.
    Returns the first valid, safe-to-execute Queue item, or None if the queue is empty.
    """

    batch_size = 50
    items = await load_pending_queue_batch(db, campaign_id, batch_size)

    if not items:
        return None

    for item in items:
        is_safe, reason = await verify_pre_flight_checks(
            db=db,
            queue_id=item.id,
            instagram_username=item.lead.username,
            instagram_account=instagram_account,
            campaign_id=campaign_id
        )

        if is_safe:
            return item

        # If not safe, mark as skipped and log it
        await log_execution_event(db, campaign_id, "WARNING", f"Skipping lead {item.lead.username}: {reason}")
        item.status = "SKIPPED"
        await db.commit()

    # If all items in this batch were skipped, recurse to get the next batch
    return await get_next_valid_queue_item(db, campaign_id, instagram_account)
