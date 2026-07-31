from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import ForeignKey, Index, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import BaseModel

if TYPE_CHECKING:
    from app.models.campaign import Campaign
    from app.models.queue import Queue
    from app.models.website_analysis import WebsiteAnalysis
    from app.models.contact_history import ContactHistory


class Lead(BaseModel):
    __tablename__ = "leads"
    __table_args__ = (
        UniqueConstraint("campaign_id", "username", name="uq_lead_campaign_username"),
        Index("ix_leads_campaign_id_username", "campaign_id", "username"),
    )

    campaign_id: Mapped[str] = mapped_column(
        ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True
    )
    platform: Mapped[str] = mapped_column(String(50), nullable=False)
    username: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    business_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    followers: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    following: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    website: Mapped[Optional[str]] = mapped_column(
        ForeignKey("website_analyses.website", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    country: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    profile_url: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    profile_image: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    source: Mapped[str] = mapped_column(String(50), nullable=False)
    qualification_status: Mapped[str] = mapped_column(String(50), nullable=False)

    # Relationships
    campaign: Mapped["Campaign"] = relationship("Campaign", back_populates="leads")
    website_analysis: Mapped[Optional["WebsiteAnalysis"]] = relationship(
        "WebsiteAnalysis", back_populates="leads"
    )
    queue_items: Mapped[List["Queue"]] = relationship(
        "Queue", back_populates="lead", cascade="all, delete-orphan"
    )
    contact_histories: Mapped[List["ContactHistory"]] = relationship(
        "ContactHistory", back_populates="lead", cascade="all, delete-orphan"
    )
