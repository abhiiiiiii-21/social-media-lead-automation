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
    
    # Automation Safety Layer Settings
    automation_min_delay_ms: Mapped[int] = mapped_column(Integer, default=2000, server_default="2000", nullable=False)
    automation_max_delay_ms: Mapped[int] = mapped_column(Integer, default=5000, server_default="5000", nullable=False)
    automation_nav_timeout_ms: Mapped[int] = mapped_column(Integer, default=30000, server_default="30000", nullable=False)
    automation_max_profiles_per_run: Mapped[int] = mapped_column(Integer, default=100, server_default="100", nullable=False)
    automation_max_runtime_sec: Mapped[int] = mapped_column(Integer, default=3600, server_default="3600", nullable=False)
    automation_pause_duration_sec: Mapped[int] = mapped_column(Integer, default=300, server_default="300", nullable=False)
