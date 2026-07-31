import asyncio

from typing import AsyncGenerator
from playwright.async_api import Page

from app.automation.instagram.scroll_manager import smooth_scroll
from app.automation.common.randomization import wait_random


async def execute_location_search(page: Page, location_id: str, max_scrolls: int = 50) -> AsyncGenerator[str, None]:
    """
    Searches a location page by its ID and yields usernames found in the posts.
    E.g. location_id = "212988663/new-york-new-york"
    """
    url = f"https://www.instagram.com/explore/locations/{location_id}/"
    
    await page.goto(url, wait_until="networkidle")
    await wait_random(2000, 4000)
    
    discovered_posts = set()
    discovered_users = set()
    scrolls = 0
    
    while scrolls < max_scrolls:
        post_links = await page.locator("a[href^='/p/']").all()
        new_posts = []
        for link in post_links:
            href = await link.get_attribute("href")
            if href and href not in discovered_posts:
                discovered_posts.add(href)
                new_posts.append(href)
                
        for post_href in new_posts:
            post_url = f"https://www.instagram.com{post_href}"
            try:
                username = await page.evaluate(f'''async () => {{
                    try {{
                        const res = await fetch("{post_url}");
                        const text = await res.text();
                        const match = text.match(/"username":"([^"]+)"/);
                        return match ? match[1] : null;
                    }} catch (e) {{ return null; }}
                }}''')
                
                if username and username not in discovered_users:
                    discovered_users.add(username)
                    yield username
                    
            except Exception as e:
                print(f"Error fetching location post author: {e}")
                
        has_more = await smooth_scroll(page, scroll_delay_ms=2000)
        if not has_more and not new_posts:
            break
            
        scrolls += 1
