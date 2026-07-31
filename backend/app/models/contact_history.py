from typing import TYPE_CHECKING, Optional
from datetime import datetime

from sqlalchemy import ForeignKey, Integer, String, DateTime, Index, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database.base import BaseModel

if TYPE_CHECKING:
    from app.models.lead import Lead
    from app.models.campaign import Campaign
    from app.models.template import MessageTemplate


class ContactHistory(BaseModel):
    __tablename__ = "contact_history"
    __table_args__ = (
        UniqueConstraint("instagram_username", "instagram_account", name="uq_contact_history_user_account"),
        Index("ix_contact_history_username", "instagram_username"),
        Index("ix_contact_history_account", "instagram_account"),
    )

    lead_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("leads.id", ondelete="SET NULL"), nullable=True, index=True
    )
    instagram_username: Mapped[str] = mapped_column(String(255), nullable=False)
    instagram_account: Mapped[str] = mapped_column(String(255), nullable=False)
    
    campaign_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True, index=True
    )
    template_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("message_templates.id", ondelete="SET NULL"), nullable=True, index=True
    )
    
    conversation_status: Mapped[str] = mapped_column(String(50), default="Never Contacted", nullable=False)
    messages_sent: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    first_contact_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_contact_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    last_delivery_status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    last_failure_reason: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    last_execution_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Relationships
    lead: Mapped[Optional["Lead"]] = relationship("Lead", back_populates="contact_histories")
    campaign: Mapped[Optional["Campaign"]] = relationship("Campaign", back_populates="contact_histories")
    template: Mapped[Optional["MessageTemplate"]] = relationship("MessageTemplate", back_populates="contact_histories")
