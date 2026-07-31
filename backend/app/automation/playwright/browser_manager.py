import asyncio
from typing import Optional

from playwright.async_api import (
    Browser,
    BrowserContext,
    Page,
    Playwright,
    async_playwright,
)

from app.automation.playwright.constants import DEFAULT_USER_AGENT, DEFAULT_VIEWPORT
from app.core.config import settings


class BrowserManager:
    def __init__(self):
        self.playwright: Optional[Playwright] = None
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None

    async def __aenter__(self):
        await self.start()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

    async def start(self) -> None:
        if self.playwright is None:
            self.playwright = await async_playwright().start()

        if self.browser is None:
            # We can configure headless through settings or hardcode for now
            # Typically production is headless=True, dev can be False for debugging
            # To be safe and compliant with requirements, we'll run headless by default
            is_headless = getattr(settings, "PLAYWRIGHT_HEADLESS", True)
            browser_type = getattr(self.playwright, settings.PLAYWRIGHT_BROWSER)

            self.browser = await browser_type.launch(
                headless=is_headless,
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--disable-infobars",
                ],
            )

    async def create_context(
        self, storage_state_path: Optional[str] = None
    ) -> BrowserContext:
        if not self.browser:
            await self.start()

        context_kwargs = {
            "user_agent": DEFAULT_USER_AGENT,
            "viewport": DEFAULT_VIEWPORT,
            "permissions": ["geolocation"],
        }

        if storage_state_path and os.path.exists(storage_state_path):
            context_kwargs["storage_state"] = storage_state_path

        # Safely create context
        self.context = await self.browser.new_context(**context_kwargs)  # type: ignore
        return self.context

    async def get_page(self, context: Optional[BrowserContext] = None) -> Page:
        ctx = context or self.context
        if not ctx:
            ctx = await self.create_context()
        return await ctx.new_page()

    async def close(self) -> None:
        if self.context:
            await self.context.close()
            self.context = None

        if self.browser:
            await self.browser.close()
            self.browser = None

        if self.playwright:
            await self.playwright.stop()
            self.playwright = None
