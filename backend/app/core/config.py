from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Social Media Lead Automation"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"

    DATABASE_URL: str

    GROQ_API_KEY_1: Optional[str] = None
    GROQ_API_KEY_2: Optional[str] = None
    GROQ_API_KEY_3: Optional[str] = None
    DEFAULT_MODEL: str = "mixtral-8x7b-32768"
    
    # AI Discovery Configurations
    AI_PROMPT_VERSION: str = "v1"
    AI_CACHE_TTL_DAYS: int = 30
    AI_RATE_LIMIT_COOLDOWN_SEC: int = 60
    AI_MAX_RETRIES: int = 3
    AI_DEFAULT_TIMEOUT: float = 30.0
    
    # AI Discovery Estimation Constants
    ESTIMATION_LEADS_PER_KEYWORD: int = 150
    ESTIMATION_LEADS_PER_LOCATION: int = 100
    ESTIMATION_MINUTES_PER_LEAD: float = 0.5
    ESTIMATION_REQUESTS_PER_LEAD: int = 3

    LOG_LEVEL: str = "INFO"
    PLAYWRIGHT_BROWSER: str = "chromium"

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=True, extra="ignore"
    )


settings = Settings()  # type: ignore

# Global Validation Constants
VALID_LANGUAGES = [
    "English", "Spanish", "French", "German", "Italian", "Portuguese", 
    "Dutch", "Russian", "Chinese", "Japanese", "Korean", "Arabic", "Hindi"
]

VALID_BUSINESS_CATEGORIES = [
    "Real Estate", "Healthcare", "Dentist", "Technology", "Software", 
    "Marketing", "Agency", "E-commerce", "Retail", "Food & Beverage",
    "Restaurant", "Fitness", "Gym", "Education", "Consulting", "Finance",
    "Legal", "Automotive", "Construction", "Home Services", "Beauty",
    "Spa", "Salon", "Travel", "Hospitality", "Entertainment", "Other"
]
