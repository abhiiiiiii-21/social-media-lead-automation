from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import BaseModel

if TYPE_CHECKING:
    from app.models.lead import Lead
    from app.models.log import ExecutionLog
    from app.models.queue import Queue
    from app.models.contact_history import ContactHistory


class Campaign(BaseModel):
    __tablename__ = "campaigns"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    platform: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    @property
    def config(self) -> dict:
        if self.description:
            try:
                import json
                data = json.loads(self.description)
                if isinstance(data, dict):
                    return data
            except Exception:
                pass
        return {}

    # Relationships
    leads: Mapped[List["Lead"]] = relationship(
        "Lead", back_populates="campaign", cascade="all, delete-orphan"
    )
    queue_items: Mapped[List["Queue"]] = relationship(
        "Queue", back_populates="campaign", cascade="all, delete-orphan"
    )
    execution_logs: Mapped[List["ExecutionLog"]] = relationship(
        "ExecutionLog", back_populates="campaign", cascade="all, delete-orphan"
    )
    contact_histories: Mapped[List["ContactHistory"]] = relationship(
        "ContactHistory", back_populates="campaign", cascade="all, delete-orphan"
    )
