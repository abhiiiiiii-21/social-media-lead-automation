import asyncio
import urllib.parse
from typing import AsyncGenerator
from playwright.async_api import Page

from app.automation.instagram.scroll_manager import smooth_scroll
from app.automation.common.randomization import wait_random


async def execute_hashtag_search(page: Page, hashtag: str, max_scrolls: int = 50) -> AsyncGenerator[str, None]:
    """
    Searches a hashtag page and yields usernames found in the posts.
    """
    hashtag_clean = hashtag.replace("#", "").strip()
    url = f"https://www.instagram.com/explore/tags/{urllib.parse.quote(hashtag_clean)}/"
    
    await page.goto(url, wait_until="networkidle")
    await wait_random(2000, 4000)
    
    discovered_posts = set()
    discovered_users = set()
    scrolls = 0
    
    while scrolls < max_scrolls:
        # Extract post links
        post_links = await page.locator("a[href^='/p/']").all()
        new_posts = []
        for link in post_links:
            href = await link.get_attribute("href")
            if href and href not in discovered_posts:
                discovered_posts.add(href)
                new_posts.append(href)
                
        # For each new post, hover over it to see if Instagram preloads the author,
        # or we might have to visit the post. Visiting every post is slow.
        # Instagram's web feed doesn't always expose the username on the explore grid.
        # We will navigate to the post directly, extract the username, and go back or open in a new tab.
        # But wait, yielding usernames from a generator means we can just yield the post URLs 
        # or we can extract the username. Opening every post is slow but reliable.
        
        for post_href in new_posts:
            # We don't want to navigate away from the grid if we can avoid it.
            # We'll use a script to fetch the post page HTML quickly, or just navigate.
            # For simplicity, we navigate. A better way in production might be GraphQL interception.
            
            post_url = f"https://www.instagram.com{post_href}"
            try:
                # We can't navigate the main page without losing scroll state.
                # So we just yield the post URL, and the orchestrator can handle it?
                # No, the orchestrator expects usernames.
                # We will open a new page context in the same browser? No, we don't have the context here easily unless passed.
                # Let's assume this module must yield usernames. We can intercept GraphQL or open a new tab.
                # For now, we will yield a special format or fetch it.
                # Since we don't have the context passed, let's just do a quick fetch via evaluate
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
                print(f"Error fetching post author: {e}")
                
        has_more = await smooth_scroll(page, scroll_delay_ms=2000)
        if not has_more and not new_posts:
            break
            
        scrolls += 1
