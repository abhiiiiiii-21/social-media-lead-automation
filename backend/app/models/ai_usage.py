from typing import Optional

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import BaseModel


class AIUsage(BaseModel):
    __tablename__ = "ai_usage"

    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    api_key_name: Mapped[str] = mapped_column(String(100), nullable=False)
    prompt_version: Mapped[str] = mapped_column(String(50), nullable=False)
    lead_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("leads.id", ondelete="SET NULL"), nullable=True, index=True
    )
    website: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True, index=True
    )
    tokens: Mapped[int] = mapped_column(Integer, nullable=False)
