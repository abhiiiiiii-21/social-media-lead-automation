from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List


class ScraperStartRequest(BaseModel):
    campaign_id: str
    account_name: str = Field(default="default", description="The registered session account name")
    search_mode: str = Field(default="COMMENT", description="KEYWORD, HASHTAG, LOCATION, USERNAME, or COMMENT")
    source_query: Optional[str] = Field(default="", description="The query string or post URL")
    post_urls: Optional[List[str]] = Field(default_factory=list, description="List of post URLs for comment scraping")
    keyword_filter: Optional[str] = Field(default=None, description="Keyword filter for comments")
    max_profiles: int = Field(100, description="Max profiles to scrape")
    max_scrolls: int = Field(50, description="Max scrolls to perform")
    include_replies: bool = Field(default=True, description="Whether to include comment replies")
    skip_duplicates: bool = Field(default=True, description="Whether to skip duplicate profiles")
    profile_enrichment: bool = Field(default=True, description="Whether to enrich discovered profiles")
    min_followers: Optional[int] = Field(default=None, description="Minimum followers filter")
    max_followers: Optional[int] = Field(default=None, description="Maximum followers filter")
    min_posts: Optional[int] = Field(default=None, description="Minimum posts filter")
    max_posts: Optional[int] = Field(default=None, description="Maximum posts filter")
    language: Optional[str] = Field(default=None, description="Language filter")
    country: Optional[str] = Field(default=None, description="Country filter")
    business_category: Optional[str] = Field(default=None, description="Business category filter")
    is_business_required: Optional[bool] = Field(default=False, description="Require business account")
    is_verified_required: Optional[bool] = Field(default=False, description="Require verified badge")
    is_email_required: Optional[bool] = Field(default=False, description="Require email found")
    is_phone_required: Optional[bool] = Field(default=False, description="Require phone found")
    is_website_required: Optional[bool] = Field(default=False, description="Require website found")


class ScraperStatusResponse(BaseModel):
    campaign_id: str
    is_running: bool
    status: str = "PENDING"
    stage: str = "Starting"
    current_username: Optional[str] = None
    current_url: Optional[str] = None
    stats: Optional[Dict[str, Any]] = None
