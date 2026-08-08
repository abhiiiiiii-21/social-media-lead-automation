import re
import asyncio
import urllib.parse
from typing import AsyncGenerator, List, Optional, Set, Callable, Awaitable
from playwright.async_api import Page
from loguru import logger

from app.automation.common.randomization import wait_random, wait_action_spacing


RESERVED_PATHS = {
    "", "p", "reel", "reels", "explore", "stories", "direct", "accounts", 
    "legal", "help", "about", "privacy", "terms", "directory", "web", "api"
}


def _clean_post_url(url: str) -> Optional[str]:
    """Validates and cleans an Instagram post/reel URL."""
    if not url or not isinstance(url, str):
        return None
    url = url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        url = f"https://www.instagram.com/{url.lstrip('/')}"
    parsed = urllib.parse.urlparse(url)
    if "instagram.com" not in parsed.netloc:
        return None
    
    # Standardize path
    path = parsed.path.rstrip("/")
    if not (path.startswith("/p/") or path.startswith("/reel/")):
        # Check if query or hash has the code
        return None
    return f"https://www.instagram.com{path}/"


async def execute_comment_search(
    page: Page,
    post_urls: List[str],
    keyword_filter: Optional[str] = None,
    max_profiles: int = 100,
    include_replies: bool = True,
    max_scrolls_per_post: int = 50,
    live_logger: Optional[Callable[[str, str], Awaitable[None]]] = None,
) -> AsyncGenerator[str, None]:
    """
    Navigates to each Instagram post/reel URL, extracts commenter usernames from comments and replies,
    filters by keyword if provided, skips duplicates, and yields unique commenter usernames.
    """
    discovered_users: Set[str] = set()
    cleaned_urls: List[str] = []
    
    for raw_url in post_urls:
        c_url = _clean_post_url(raw_url)
        if c_url and c_url not in cleaned_urls:
            cleaned_urls.append(c_url)
        elif raw_url:
            if live_logger:
                await live_logger("WARNING", f"Skipping invalid Instagram post URL: {raw_url}")
            logger.warning(f"Invalid Instagram post URL skipped: {raw_url}")

    if not cleaned_urls:
        if live_logger:
            await live_logger("ERROR", "No valid Instagram post URLs provided.")
        logger.error("No valid post URLs provided for comment search.")
        return

    keyword_regex = None
    if keyword_filter and keyword_filter.strip():
        k_clean = keyword_filter.strip()
        keyword_regex = re.compile(re.escape(k_clean), re.IGNORECASE)
        if live_logger:
            await live_logger("INFO", f"Applying comment keyword filter: '{k_clean}'")

    for post_index, post_url in enumerate(cleaned_urls):
        if len(discovered_users) >= max_profiles:
            break

        if live_logger:
            await live_logger("INFO", f"[{post_index + 1}/{len(cleaned_urls)}] Loading post: {post_url}")
        logger.info(f"Opening Instagram post for comment scraping: {post_url}")

        try:
            response = await page.goto(post_url, wait_until="domcontentloaded", timeout=30000)
            await wait_random(1500, 2500)
        except Exception as e:
            if live_logger:
                await live_logger("ERROR", f"Failed to load post URL {post_url}: {str(e)}")
            logger.error(f"Navigation error for {post_url}: {e}")
            continue

        # Check for unavailable / private / deleted post
        page_text = ""
        try:
            page_text = await page.evaluate("() => document.body ? document.body.innerText : ''")
        except Exception:
            pass

        if "Sorry, this page isn't available" in page_text or "The link you followed may be broken" in page_text:
            if live_logger:
                await live_logger("WARNING", f"Post unavailable or deleted: {post_url}")
            logger.warning(f"Post unavailable: {post_url}")
            continue

        if "This account is private" in page_text:
            if live_logger:
                await live_logger("WARNING", f"Post belongs to a private account: {post_url}")
            logger.warning(f"Private account post: {post_url}")
            continue

        # Look for comment containers and extract comments
        scrolls = 0
        consecutive_no_new = 0

        while scrolls < max_scrolls_per_post and len(discovered_users) < max_profiles:
            scrolls += 1

            # 1. Expand "View more comments" or "+" buttons if present
            try:
                load_more_buttons = await page.locator(
                    'svg[aria-label="Load more comments"], button:has-text("Load more comments"), button:has-text("View more comments"), span:has-text("View more comments")'
                ).all()
                for btn in load_more_buttons[:2]:
                    try:
                        if await btn.is_visible():
                            await btn.click(timeout=1500)
                            await wait_action_spacing()
                    except Exception:
                        pass
            except Exception:
                pass

            # 2. Expand replies if include_replies is True
            if include_replies:
                try:
                    reply_buttons = await page.locator(
                        'button:has-text("View replies"), span:has-text("View replies"), button:has-text("View all replies"), span:has-text("View all replies")'
                    ).all()
                    for r_btn in reply_buttons[:3]:
                        try:
                            if await r_btn.is_visible():
                                await r_btn.click(timeout=1000)
                                await wait_random(300, 600)
                        except Exception:
                            pass
                except Exception:
                    pass

            # 3. Extract comments and commenter usernames from the DOM
            extracted_batch = await page.evaluate(r"""() => {
                const results = [];
                // Instagram comment elements on desktop web typically exist within ul list or article div
                // Find all comment list items or comment root elements
                const commentNodes = document.querySelectorAll(
                    'ul > div > li, ul > li[role="menuitem"], div[role="button"][tabindex="0"], div[data-testid="post-comment-root"]'
                );

                if (commentNodes.length > 0) {
                    for (const node of commentNodes) {
                        const authorLink = node.querySelector('a[role="link"][href^="/"], h3 a[href^="/"], a[href^="/"]');
                        if (!authorLink) continue;
                        
                        const href = authorLink.getAttribute('href') || '';
                        const username = href.replace(/^\/+|\/+$/g, '').split('/')[0].split('?')[0];
                        
                        // Extract comment body text
                        let commentText = '';
                        const textSpan = node.querySelector('span[dir="auto"], div[dir="auto"], span._ap3a');
                        if (textSpan) {
                            commentText = textSpan.innerText || textSpan.textContent || '';
                        }
                        
                        if (username && username.length > 1) {
                            results.push({ username: username.toLowerCase(), text: commentText });
                        }
                    }
                } else {
                    // Fallback: search all profile links inside main/article
                    const article = document.querySelector('article') || document.querySelector('main') || document.body;
                    const links = article ? Array.from(article.querySelectorAll('a[role="link"][href^="/"], a[href^="/"]')) : [];
                    
                    for (const link of links) {
                        const href = link.getAttribute('href') || '';
                        const username = href.replace(/^\/+|\/+$/g, '').split('/')[0].split('?')[0];
                        if (username && username.length > 1) {
                            // Find closest text sibling or parent
                            const parent = link.closest('li') || link.closest('div') || link.parentElement;
                            const text = parent ? (parent.innerText || '') : '';
                            results.push({ username: username.toLowerCase(), text: text });
                        }
                    }
                }
                return results;
            }""")

            new_in_this_scroll = 0
            if extracted_batch and isinstance(extracted_batch, list):
                for item in extracted_batch:
                    if not isinstance(item, dict):
                        continue
                    u = (item.get("username") or "").strip().lower()
                    comment_text = item.get("text") or ""

                    if not u or u in RESERVED_PATHS or u in discovered_users:
                        continue

                    # Filter out usernames with spaces or invalid chars
                    if not re.match(r"^[a-zA-Z0-9._]{1,30}$", u):
                        continue

                    # Check keyword filter if configured
                    if keyword_regex and not keyword_regex.search(comment_text):
                        continue

                    discovered_users.add(u)
                    new_in_this_scroll += 1
                    yield u

                    if len(discovered_users) >= max_profiles:
                        break

            if new_in_this_scroll == 0:
                consecutive_no_new += 1
            else:
                consecutive_no_new = 0

            # 4. Scroll the comments container
            try:
                scrolled = await page.evaluate(r"""() => {
                    // Try scrolling specific comments list container
                    const listContainers = Array.from(document.querySelectorAll('div, ul')).filter(el => {
                        const style = window.getComputedStyle(el);
                        return (style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight;
                    });
                    
                    if (listContainers.length > 0) {
                        const c = listContainers[listContainers.length - 1];
                        const oldTop = c.scrollTop;
                        c.scrollTop = c.scrollTop + 800;
                        return c.scrollTop > oldTop || (c.scrollHeight - c.scrollTop <= c.clientHeight + 100);
                    }
                    
                    // Fallback to window scroll
                    const oldY = window.scrollY;
                    window.scrollBy(0, 800);
                    return window.scrollY > oldY;
                }""")
                await wait_random(1000, 1800)
            except Exception:
                break

            if consecutive_no_new >= 4:
                # No new comments discovered after 4 consecutive scrolls
                if live_logger:
                    await live_logger("INFO", f"Reached end of visible comments on {post_url}")
                break

    if live_logger:
        await live_logger(
            "INFO", 
            f"Comment scraping finished. Total unique commenter profiles collected: {len(discovered_users)}"
        )
    logger.info(f"Comment scraping complete. Total discovered: {len(discovered_users)}")
