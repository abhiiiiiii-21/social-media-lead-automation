from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import BaseModel

if TYPE_CHECKING:
    from app.models.campaign import Campaign


class ExecutionLog(BaseModel):
    __tablename__ = "execution_logs"

    campaign_id: Mapped[str] = mapped_column(
        ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True
    )
    level: Mapped[str] = mapped_column(String(50), nullable=False)
    message: Mapped[str] = mapped_column(String, nullable=False)

    # Relationships
    campaign: Mapped["Campaign"] = relationship(
        "Campaign", back_populates="execution_logs"
    )
