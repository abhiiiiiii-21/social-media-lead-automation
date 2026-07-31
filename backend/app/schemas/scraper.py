from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class ScraperStartRequest(BaseModel):
    campaign_id: str
    account_name: str = Field(..., description="The registered session account name")
    search_mode: str = Field(..., description="KEYWORD, HASHTAG, LOCATION, or USERNAME")
    source_query: str = Field(..., description="The query to search for")
    max_profiles: int = Field(100, description="Max profiles to scrape")
    max_scrolls: int = Field(50, description="Max scrolls to perform")

class ScraperStatusResponse(BaseModel):
    campaign_id: str
    is_running: bool
    stats: Optional[Dict[str, Any]] = None
