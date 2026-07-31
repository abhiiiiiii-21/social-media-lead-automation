import asyncio
from typing import Callable, Any
from playwright.async_api import Page, BrowserContext, Error as PlaywrightError

async def with_retry(func: Callable, max_retries: int = 3, base_delay: int = 2000) -> Any:
    """
    Executes a function with exponential backoff on PlaywrightError or general exceptions.
    """
    for attempt in range(max_retries):
        try:
            return await func()
        except PlaywrightError as e:
            if attempt == max_retries - 1:
                raise e
            await asyncio.sleep((base_delay * (2 ** attempt)) / 1000.0)
        except Exception as e:
            if attempt == max_retries - 1:
                raise e
            await asyncio.sleep((base_delay * (2 ** attempt)) / 1000.0)


async def check_browser_health(page: Page, context: BrowserContext) -> dict:
    """
    Checks if the current browser context and page are still alive and valid.
    """
    health = {
        "page_alive": False,
        "context_alive": False,
        "session_valid": False,
    }
    
    if not page.is_closed():
        health["page_alive"] = True
        
    if context.pages:
        health["context_alive"] = True
        
    # Light check to see if we're still logged into Instagram (if we are on IG)
    if health["page_alive"] and "instagram.com" in page.url:
        try:
            # Quick check for the home icon or avatar
            icon_count = await page.locator("svg[aria-label='Home']").count()
            health["session_valid"] = icon_count > 0
        except Exception:
            health["session_valid"] = False
            
    return health
