from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from typing import TYPE_CHECKING, Dict, Any, Optional

from app.database.base import BaseModel

if TYPE_CHECKING:
    from app.models.campaign import Campaign


class AIDiscovery(BaseModel):
    __tablename__ = "ai_discovery"

    # Optional linkage to a campaign, since discovery can happen before a campaign is created.
    campaign_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True, index=True
    )
    
    original_prompt: Mapped[str] = mapped_column(Text, nullable=False)
    normalized_prompt: Mapped[str] = mapped_column(Text, nullable=False, default="")
    parsed_filters: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    
    groq_model: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    prompt_version: Mapped[str] = mapped_column(String(50), default="v1", nullable=False)
    
    api_key_used: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    api_key_index: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    prompt_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completion_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    processing_time_ms: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    cached: Mapped[bool] = mapped_column(default=False, nullable=False)
    retry_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationship
    campaign: Mapped[Optional["Campaign"]] = relationship("Campaign")
