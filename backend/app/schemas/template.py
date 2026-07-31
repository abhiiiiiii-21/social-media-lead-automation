from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class MessageTemplateBase(BaseModel):
    name: str = Field(..., max_length=255)
    platform: str = Field(..., max_length=50)
    category: str = Field(..., max_length=100)
    template_body: str


class MessageTemplateCreate(MessageTemplateBase):
    pass


class MessageTemplateUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    platform: Optional[str] = Field(None, max_length=50)
    category: Optional[str] = Field(None, max_length=100)
    template_body: Optional[str] = None


class MessageTemplateResponse(MessageTemplateBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
