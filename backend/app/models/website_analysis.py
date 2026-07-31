from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import BaseModel

if TYPE_CHECKING:
    from app.models.lead import Lead


class WebsiteAnalysis(BaseModel):
    __tablename__ = "website_analyses"

    website: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    ai_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    summary: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    strengths: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    weaknesses: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    recommendation: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    analyzed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    prompt_version: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    model_used: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Relationships
    leads: Mapped[List["Lead"]] = relationship(
        "Lead", back_populates="website_analysis"
    )
