from datetime import datetime
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.contact_history import ContactHistory
from app.schemas.contact_history import ConversationStatus


async def get_or_create_contact_history(
    db: AsyncSession,
    instagram_username: str,
    instagram_account: str,
    lead_id: Optional[str] = None,
    campaign_id: Optional[str] = None
) -> ContactHistory:
    """
    Retrieves the existing contact history for a given lead + sender account pair.
    If it doesn't exist, creates a new one with 'Never Contacted' status.
    """
    stmt = select(ContactHistory).where(
        ContactHistory.instagram_username == instagram_username,
        ContactHistory.instagram_account == instagram_account
    )
    result = await db.execute(stmt)
    history = result.scalars().first()

    if not history:
        history = ContactHistory(
            instagram_username=instagram_username,
            instagram_account=instagram_account,
            lead_id=lead_id,
            campaign_id=campaign_id,
            conversation_status=ConversationStatus.NEVER_CONTACTED.value,
            messages_sent=0
        )
        db.add(history)
        await db.commit()
        await db.refresh(history)

    return history


async def update_contact_status(
    db: AsyncSession,
    history_id: str,
    status: ConversationStatus,
    delivery_status: Optional[str] = None,
    failure_reason: Optional[str] = None,
    execution_id: Optional[str] = None,
    template_id: Optional[str] = None,
    message_sent: bool = False
) -> Optional[ContactHistory]:
    """
    Updates the contact history after an interaction attempt.
    """
    stmt = select(ContactHistory).where(ContactHistory.id == history_id)
    result = await db.execute(stmt)
    history = result.scalars().first()

    if not history:
        return None

    now = datetime.utcnow()

    # If this is the first successful message sent
    if message_sent and history.messages_sent == 0:
        history.first_contact_at = now

    if message_sent:
        history.messages_sent += 1
        history.last_contact_at = now

    history.conversation_status = status.value
    if delivery_status:
        history.last_delivery_status = delivery_status
    if failure_reason is not None:
        history.last_failure_reason = failure_reason
    if execution_id:
        history.last_execution_id = execution_id
    if template_id:
        history.template_id = template_id

    await db.commit()
    await db.refresh(history)
    return history
