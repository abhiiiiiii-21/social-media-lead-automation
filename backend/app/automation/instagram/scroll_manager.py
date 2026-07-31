import asyncio

from playwright.async_api import Page
from app.automation.common.randomization import wait_random, wait_scroll

async def smooth_scroll(page: Page, scroll_delay_ms: int = 1500, max_scrolls: int = 50) -> bool:
    """
    Scrolls down the page natively, returning True if more content loaded,
    or False if we reached the bottom / no new content.
    """
    try:
        # Get current scroll height
        previous_height = await page.evaluate("document.body.scrollHeight")
        
        # Scroll down
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        
        # Wait for potential new content
        await wait_random(scroll_delay_ms, scroll_delay_ms + 1000)
        
        # Check new height
        new_height = await page.evaluate("document.body.scrollHeight")
        
        if new_height == previous_height:
            # Sometime Instagram has a slight delay or requires a tiny scroll up then down to trigger
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight - 100)")
            await wait_random(400, 800)
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await wait_random(scroll_delay_ms, scroll_delay_ms + 1000)
            new_height = await page.evaluate("document.body.scrollHeight")
            
        return new_height > previous_height
    except Exception as e:
        print(f"Scroll error: {e}")
        return False
