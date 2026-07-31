from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class SettingsBase(BaseModel):
    groq_model: str = Field(..., max_length=100)
    temperature: float = Field(..., ge=0.0, le=2.0)
    max_tokens: int = Field(..., gt=0)
    retry_limit: int = Field(..., ge=0)
    delay_between_requests: int = Field(..., ge=0)


class SettingsUpdate(BaseModel):
    groq_model: Optional[str] = Field(None, max_length=100)
    temperature: Optional[float] = Field(None, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(None, gt=0)
    retry_limit: Optional[int] = Field(None, ge=0)
    delay_between_requests: Optional[int] = Field(None, ge=0)


class SettingsResponse(SettingsBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
