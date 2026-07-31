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

    LOG_LEVEL: str = "INFO"
    PLAYWRIGHT_BROWSER: str = "chromium"

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=True, extra="ignore"
    )


settings = Settings()  # type: ignore
