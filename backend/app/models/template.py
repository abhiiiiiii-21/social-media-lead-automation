from typing import TYPE_CHECKING, List

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import BaseModel

if TYPE_CHECKING:
    from app.models.queue import Queue


class MessageTemplate(BaseModel):
    __tablename__ = "message_templates"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    platform: Mapped[str] = mapped_column(String(50), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    template_body: Mapped[str] = mapped_column(String, nullable=False)

    # Relationships
    queue_items: Mapped[List["Queue"]] = relationship(
        "Queue", back_populates="template", cascade="all, delete-orphan"
    )
