import asyncio
from typing import AsyncGenerator
from playwright.async_api import Page
from app.automation.common.randomization import wait_random


async def execute_username_search(page: Page, query: str, max_scrolls: int = 1) -> AsyncGenerator[str, None]:
    """
    Given a comma-separated list of usernames, it yields them one by one.
    This doesn't do a real 'search' but it allows processing a direct list of targets.
    """
    usernames = [u.strip() for u in query.split(",") if u.strip()]
    for username in usernames:
        # Strip potential @
        username = username.lstrip("@")
        yield username
        # Adding a small sleep to avoid tight loops if this generator is consumed fast
        await wait_random(100, 300)
