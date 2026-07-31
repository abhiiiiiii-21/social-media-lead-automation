from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import BaseModel


class Settings(BaseModel):
    __tablename__ = "settings"

    groq_model: Mapped[str] = mapped_column(String(100), nullable=False)
    temperature: Mapped[float] = mapped_column(Float, nullable=False)
    max_tokens: Mapped[int] = mapped_column(Integer, nullable=False)
    retry_limit: Mapped[int] = mapped_column(Integer, nullable=False)
    delay_between_requests: Mapped[int] = mapped_column(Integer, nullable=False)
