from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import BaseModel

if TYPE_CHECKING:
    from app.models.campaign import Campaign
    from app.models.lead import Lead
    from app.models.template import MessageTemplate


class Queue(BaseModel):
    __tablename__ = "queues"
    __table_args__ = (
        Index("ix_queues_status_scheduled_time", "status", "scheduled_time"),
    )

    campaign_id: Mapped[str] = mapped_column(
        ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True
    )
    lead_id: Mapped[str] = mapped_column(
        ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True
    )
    template_id: Mapped[str] = mapped_column(
        ForeignKey("message_templates.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    retries: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    scheduled_time: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    sent_time: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    campaign: Mapped["Campaign"] = relationship(
        "Campaign", back_populates="queue_items"
    )
    lead: Mapped["Lead"] = relationship("Lead", back_populates="queue_items")
    template: Mapped["MessageTemplate"] = relationship(
        "MessageTemplate", back_populates="queue_items"
    )
