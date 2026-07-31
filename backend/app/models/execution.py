from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, Integer, String, DateTime, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import BaseModel

if TYPE_CHECKING:
    from app.models.campaign import Campaign


class CampaignExecution(BaseModel):
    __tablename__ = "campaign_executions"

    campaign_id: Mapped[str] = mapped_column(
        ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="Created")
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    error: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # Relationships
    campaign: Mapped["Campaign"] = relationship("Campaign")


class ExecutionState(BaseModel):
    __tablename__ = "execution_states"

    campaign_id: Mapped[str] = mapped_column(
        ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True, unique=True
    )
    current_lead_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    current_worker_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    current_session: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    progress: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    eta_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    remaining_leads: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    processed_leads: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    failed_leads: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    skipped_leads: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    retries: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    last_checkpoint: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class ExecutionWorker(BaseModel):
    __tablename__ = "execution_workers"

    campaign_id: Mapped[str] = mapped_column(
        ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True
    )
    worker_name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="Idle")
    current_queue_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    last_ping: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
