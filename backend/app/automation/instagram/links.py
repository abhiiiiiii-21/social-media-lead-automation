import re
import urllib.parse
from typing import Dict, Any, List, Optional
from playwright.async_api import Page
from loguru import logger


def _clean_url(raw_url: Optional[str]) -> Optional[str]:
    """Unwraps Instagram link redirection (l.instagram.com/?u=...)."""
    if not raw_url:
        return None
    if "l.instagram.com" in raw_url:
        match = re.search(r"[?&]u=([^&]+)", raw_url)
        if match:
            try:
                return urllib.parse.unquote(match.group(1))
            except Exception:
                pass
    return raw_url


def _classify_type(url: str) -> str:
    """Classifies domain into standard recognizable types."""
    u = url.lower()
    if "youtube.com" in u or "youtu.be" in u:
        return "youtube"
    elif "linktr.ee" in u:
        return "linktree"
    elif "beacons.ai" in u:
        return "beacons"
    elif "bento.me" in u:
        return "bento"
    elif "twitter.com" in u or "x.com" in u:
        return "twitter"
    elif "tiktok.com" in u:
        return "tiktok"
    elif "linkedin.com" in u:
        return "linkedin"
    elif "cal.com" in u or "calendly.com" in u:
        return "calendar"
    elif "wa.me" in u or "whatsapp.com" in u:
        return "whatsapp"
    elif any(s in u for s in ["shopify.com", "etsy.com", "store", "shop"]):
        return "store"
    elif any(p in u for p in ["portfolio", "behance.net", "dribbble.com", "github.com"]):
        return "portfolio"
    return "website"


async def scrape_links(page: Page) -> List[Dict[str, Any]]:
    """
    Extracts all external links from bio, header, and multi-link popups.
    """
    links: List[Dict[str, Any]] = []
    seen_urls = set()

    # 1. Header direct links
    try:
        raw_header_links = await page.evaluate(
            """() => {
                const results = [];
                const header = document.querySelector('header') || document.querySelector('main header') || document.querySelector('section');
                if (!header) return results;

                const anchors = Array.from(header.querySelectorAll('a[href*="l.instagram.com"], a[target="_blank"], a[role="link"]'));
                for (const a of anchors) {
                    const href = a.getAttribute('href');
                    if (href && !href.includes('/direct/') && !href.includes('/accounts/') && !href.includes('/explore/')) {
                        results.push({
                            rawHref: href,
                            title: (a.innerText || '').trim() || null
                        });
                    }
                }
                return results;
            }"""
        )

        for item in raw_header_links:
            clean = _clean_url(item.get("rawHref"))
            if clean and clean.startswith("http") and clean not in seen_urls:
                seen_urls.add(clean)
                title = item.get("title") or clean.replace("https://", "").replace("http://", "").split("/")[0]
                links.append({
                    "title": title,
                    "url": clean,
                    "type": _classify_type(clean),
                })
    except Exception as e:
        logger.debug(f"Direct link extraction note: {e}")

    # 2. Multi-Link Modal (e.g. '...and 2 other links')
    try:
        multi_link_btn = page.locator('header button:has-text("other"), header button:has-text("links"), header div[role="button"]:has-text("other")')
        if await multi_link_btn.count() > 0:
            await multi_link_btn.first.click(timeout=1500)
            await page.wait_for_timeout(500)

            modal_links = await page.evaluate(
                """() => {
                    const list = [];
                    const modal = document.querySelector('div[role="dialog"]');
                    if (!modal) return list;
                    const anchors = Array.from(modal.querySelectorAll('a[href]'));
                    for (const a of anchors) {
                        const href = a.getAttribute('href');
                        const title = (a.innerText || '').trim();
                        if (href && !href.startsWith('/') && !href.includes('instagram.com')) {
                            list.push({ rawHref: href, title: title || null });
                        }
                    }
                    return list;
                }"""
            )

            for item in modal_links:
                clean = _clean_url(item.get("rawHref"))
                if clean and clean.startswith("http") and clean not in seen_urls:
                    seen_urls.add(clean)
                    title = item.get("title") or clean.replace("https://", "").replace("http://", "").split("/")[0]
                    links.append({
                        "title": title,
                        "url": clean,
                        "type": _classify_type(clean),
                    })

            # Close dialog
            close_btn = page.locator('div[role="dialog"] svg[aria-label="Close"], div[role="dialog"] button:has-text("Close")')
            if await close_btn.count() > 0:
                await close_btn.first.click(timeout=1000)
    except Exception as e:
        logger.debug(f"Multi-link modal note: {e}")

    return links
