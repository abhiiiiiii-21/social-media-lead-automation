import asyncio
from typing import AsyncGenerator
from playwright.async_api import Page
from app.automation.common.human_behavior import human_type
from app.automation.common.randomization import wait_random, wait_action_spacing


async def execute_keyword_search(page: Page, query: str, max_scrolls: int = 20) -> AsyncGenerator[str, None]:
    """
    Searches a keyword via Instagram's search endpoint and yields discovered usernames.
    """

    # Instagram's web search UI is at /explore/search/keyword/?q=...
    # But usually, directly going to search on mobile web or desktop brings up a modal.
    # An easier way on desktop is using the search input.
    
    # Let's go to explore page first
    await page.goto("https://www.instagram.com/explore/", wait_until="networkidle")
    
    # Wait for search input
    search_input = "input[aria-label='Search input']"
    if await page.locator(search_input).count() == 0:
        # Try to click the search icon on the sidebar first
        search_icon = "svg[aria-label='Search']"
        if await page.locator(search_icon).count() > 0:
            await page.click(search_icon)
            await page.wait_for_selector(search_input, state="visible", timeout=10000)
    
    if await page.locator(search_input).count() > 0:
        await human_type(page, "input[aria-label='Search input']", query)
        await wait_random(2000, 3000) # Wait for results to populate
        
        # We need to scroll the results list inside the search flyout.
        # This is quite specific, we look for hrefs that look like profiles.
        
        discovered = set()
        scrolls = 0
        
        while scrolls < max_scrolls:
            # Extract links
            links = await page.locator("a[href^='/']").all()
            new_discovered = False
            for link in links:
                href = await link.get_attribute("href")
                if href and href != "/" and not href.startswith("/explore") and not href.startswith("/p/"):
                    username = href.strip("/").split("/")[0]
                    if username not in discovered and len(username) > 2:
                        discovered.add(username)
                        new_discovered = True
                        yield username
                        
            # Scroll the search flyout container
            # Instagram's search flyout usually has overflow-y: auto
            # This is a bit brittle, we might need a general page scroll if it's not a flyout
            try:
                scroll_result = await page.evaluate('''() => {
                    const scrollers = Array.from(document.querySelectorAll('div')).filter(el => {
                        const style = window.getComputedStyle(el);
                        return style.overflowY === 'auto' || style.overflowY === 'scroll';
                    });
                    if(scrollers.length > 0) {
                        const s = scrollers[0];
                        const old = s.scrollTop;
                        s.scrollTop = s.scrollHeight;
                        return s.scrollTop > old;
                    }
                    return false;
                }''')
                
                if not scroll_result and not new_discovered:
                    break # Reached bottom of search or no new results
                    
                await wait_random(800, 1500)
            except Exception:
                break
                
            scrolls += 1
