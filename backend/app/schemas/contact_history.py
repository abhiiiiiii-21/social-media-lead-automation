from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ConversationStatus(str, Enum):
    NEVER_CONTACTED = "Never Contacted"
    MESSAGE_SENT = "Message Sent"
    FOLLOW_UP_SENT = "Follow Up Sent"
    REPLIED = "Replied"
    SKIPPED = "Skipped"
    FAILED = "Failed"
    BLOCKED = "Blocked"
    RESTRICTED = "Restricted"
    CANNOT_MESSAGE = "Cannot Message"
    PRIVATE_ACCOUNT = "Private Account"


class ContactHistoryBase(BaseModel):
    instagram_username: str
    instagram_account: str
    campaign_id: Optional[str] = None
    template_id: Optional[str] = None
    conversation_status: ConversationStatus = ConversationStatus.NEVER_CONTACTED
    messages_sent: int = 0
    last_delivery_status: Optional[str] = None
    last_failure_reason: Optional[str] = None
    last_execution_id: Optional[str] = None


class ContactHistoryCreate(ContactHistoryBase):
    lead_id: Optional[str] = None


class ContactHistoryUpdate(BaseModel):
    conversation_status: Optional[ConversationStatus] = None
    messages_sent: Optional[int] = None
    campaign_id: Optional[str] = None
    template_id: Optional[str] = None
    first_contact_at: Optional[datetime] = None
    last_contact_at: Optional[datetime] = None
    last_delivery_status: Optional[str] = None
    last_failure_reason: Optional[str] = None
    last_execution_id: Optional[str] = None


class ContactHistoryResponse(ContactHistoryBase):
    id: str
    lead_id: Optional[str] = None
    first_contact_at: Optional[datetime] = None
    last_contact_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
