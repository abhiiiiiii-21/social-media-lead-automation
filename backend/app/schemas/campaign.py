from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict, Field


class CampaignBase(BaseModel):
    name: str = Field(..., max_length=255)
    platform: str = Field(..., max_length=50)
    status: str = Field(default="pending", max_length=50)
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = Field(default_factory=dict)


class CampaignCreate(CampaignBase):
    pass


class CampaignUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    platform: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None


class CampaignResponse(CampaignBase):
    id: str
    config: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

