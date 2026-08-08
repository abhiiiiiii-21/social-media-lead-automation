import json
from datetime import datetime
from typing import Any, Dict, Optional, List
from pydantic import BaseModel, ConfigDict, Field, model_validator


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


class LeadResponse(BaseModel):
    id: str
    campaign_id: str
    platform: str
    username: str
    full_name: Optional[str] = None
    business_name: Optional[str] = None
    bio: Optional[str] = None
    followers: int = 0
    following: int = 0
    website: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    category: Optional[str] = None
    profile_url: Optional[str] = None
    profile_image: Optional[str] = None
    source: str
    qualification_status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CampaignResponse(CampaignBase):
    id: str
    lead_count: int = 0
    scraper_type: Optional[str] = None
    config: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def parse_config_and_type(cls, data: Any) -> Any:
        if hasattr(data, "__dict__"):
            d = dict(data.__dict__)
        elif isinstance(data, dict):
            d = dict(data)
        else:
            return data

        config = d.get("config") or {}
        desc = d.get("description")
        if (not config or len(config) == 0) and desc:
            try:
                parsed = json.loads(desc)
                if isinstance(parsed, dict):
                    config = parsed
                    d["config"] = config
            except Exception:
                pass

        if "scraper_type" not in d or not d["scraper_type"]:
            d["scraper_type"] = config.get("scraperType") or config.get("search_mode") or "Comment Scraper"

        return d
