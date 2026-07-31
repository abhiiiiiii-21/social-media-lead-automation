from typing import List, Optional
from pydantic import BaseModel, Field, model_validator
from app.core.config import VALID_LANGUAGES, VALID_BUSINESS_CATEGORIES


class DiscoveryRequest(BaseModel):
    prompt: str = Field(...,
                        description="The natural language prompt describing the ideal customer.")


class DiscoveryFilters(BaseModel):
    keywords: List[str] = Field(default_factory=list,
                                description="Keywords to search for in bio or username.")
    locations: List[str] = Field(
        default_factory=list,
        description="Locations to search for.")
    business_account_only: bool = Field(
        default=True, description="Whether to only search for business accounts.")
    minimum_followers: Optional[int] = Field(
        default=None, ge=0, description="Minimum number of followers.")
    maximum_followers: Optional[int] = Field(
        default=None, ge=0, description="Maximum number of followers.")
    minimum_posts: Optional[int] = Field(
        default=None, ge=0, description="Minimum number of posts.")
    maximum_posts: Optional[int] = Field(
        default=None, ge=0, description="Maximum number of posts.")
    website_required: bool = Field(
        default=False,
        description="Whether the profile must have a website link.")
    verified_only: bool = Field(
        default=False,
        description="Whether to only search for verified accounts.")
    recently_active: bool = Field(
        default=False,
        description="Whether the account must have recent activity.")
    language: Optional[str] = Field(default=None,
                                    description="Preferred language of the account.")
    business_category: Optional[str] = Field(
        default=None, description="Specific business category (e.g., Real Estate, Dentist).")
    skip_duplicates: bool = Field(
        default=True,
        description="Whether to skip already processed profiles.")

    @model_validator(mode='after')
    def check_logical_consistency(self) -> 'DiscoveryFilters':
        if self.minimum_followers is not None and self.maximum_followers is not None:
            if self.minimum_followers > self.maximum_followers:
                raise ValueError(
                    "minimum_followers cannot be greater than maximum_followers")

        if self.minimum_posts is not None and self.maximum_posts is not None:
            if self.minimum_posts > self.maximum_posts:
                raise ValueError("minimum_posts cannot be greater than maximum_posts")

        if self.language:
            if self.language.title() not in VALID_LANGUAGES:
                raise ValueError(f"Unknown language: {self.language}")

        if self.business_category:
            if self.business_category.title() not in VALID_BUSINESS_CATEGORIES:
                raise ValueError(f"Unknown business category: {self.business_category}")

        return self


class DiscoveryResponse(BaseModel):
    campaign_name: str
    filters: DiscoveryFilters
    estimated_leads: int
    estimated_search_size: int
    estimated_requests: int
    estimated_runtime_minutes: float
