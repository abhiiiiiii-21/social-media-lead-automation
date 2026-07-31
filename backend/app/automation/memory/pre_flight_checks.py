import logging
from typing import Tuple, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.campaign import Campaign
from app.models.queue import Queue
from app.models.session import BrowserSession
from app.automation.memory.contact_memory import get_or_create_contact_history
from app.schemas.contact_history import ConversationStatus

logger = logging.getLogger(__name__)


async def verify_pre_flight_checks(
    db: AsyncSession,
    queue_id: str,
    instagram_username: str,
    instagram_account: str,
    campaign_id: str,
) -> Tuple[bool, Optional[str]]:
    """
    Executes the Safety Rule pre-flight checks before allowing a DM to be sent.

    Checks:
    1. Memory Check: Has the user been contacted?
    2. Campaign Check: Is the campaign ACTIVE?
    3. Session Check: Is the sender session valid?
    4. Queue State Check: Has the queue item already been processed?

    Returns:
        (True, None) if safe to proceed.
        (False, failure_reason_string) if any check fails.
    """

    # 1. Queue State Check
    stmt = select(Queue).where(Queue.id == queue_id)
    result = await db.execute(stmt)
    queue_item = result.scalars().first()

    if not queue_item:
        return False, "Queue item not found"

    if queue_item.status in ["COMPLETED", "FAILED", "SKIPPED"]:
        return False, f"Queue item already processed with status: {queue_item.status}"

    # 2. Campaign Check
    stmt = select(Campaign).where(Campaign.id == campaign_id)
    result = await db.execute(stmt)
    campaign = result.scalars().first()

    if not campaign:
        return False, "Campaign not found"

    if campaign.status.upper() != "ACTIVE":
        return False, f"Campaign is not ACTIVE (current status: {campaign.status})"

    # 3. Session Check
    stmt = select(BrowserSession).where(
        BrowserSession.account_name == instagram_account,
        BrowserSession.status == "ACTIVE"
    )
    result = await db.execute(stmt)
    session = result.scalars().first()

    if not session:
        return False, f"No valid authenticated session found for sender {instagram_account}"

    # 4. Memory Check
    history = await get_or_create_contact_history(
        db=db,
        instagram_username=instagram_username,
        instagram_account=instagram_account,
        lead_id=queue_item.lead_id,
        campaign_id=campaign_id
    )

    safe_statuses = [
        ConversationStatus.NEVER_CONTACTED.value,
        # Allow retry if previous attempt strictly failed without delivery
        ConversationStatus.FAILED.value
    ]

    if history.conversation_status not in safe_statuses:
        return False, f"Lead already contacted by {instagram_account} (Status: {
            history.conversation_status})"

    # 5. Rate Limit Check (Future logic can be expanded here based on AIUsage or separate table)
    # For now, we stub this safely.
    # In a full implementation, we'd query outgoing messages within the last 24h/1h.

    return True, None
