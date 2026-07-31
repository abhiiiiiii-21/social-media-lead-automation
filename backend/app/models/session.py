from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import BaseModel


class BrowserSession(BaseModel):
    __tablename__ = "browser_sessions"

    account_name: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    session_file: Mapped[str] = mapped_column(String(1024), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    last_used: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
