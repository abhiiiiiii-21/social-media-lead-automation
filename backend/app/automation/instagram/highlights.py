import re
from typing import Dict, Any, List
from playwright.async_api import Page
from loguru import logger


async def scrape_highlights(page: Page) -> List[Dict[str, Any]]:
    """
    Extracts complete story highlights metadata:
    - title
    - coverImage / coverImageUrl / thumbnail
    - storyCount
    - highlightUrl
    - downloadedCover / localCoverPath
    """
    highlights: List[Dict[str, Any]] = []

    try:
        raw_highlights = await page.evaluate(
            """() => {
                const results = [];
                const anchors = Array.from(document.querySelectorAll('main div[role="region"] a[href*="/stories/highlights/"], header ~ div a[href*="/stories/highlights/"], a[href*="/stories/highlights/"], div[role="region"] a[role="link"]'));
                
                const seenIds = new Set();
                for (const a of anchors) {
                    const href = a.getAttribute('href') || '';
                    const match = href.match(/\\/stories\\/highlights\\/([^\\/\\?]+)/);
                    const id = match ? match[1] : `hl_${results.length + 1}`;
                    if (seenIds.has(id)) continue;
                    seenIds.add(id);

                    const titleEl = a.querySelector('span, div[dir="auto"], div');
                    const title = titleEl ? titleEl.innerText.trim() : `Highlight ${results.length + 1}`;

                    const img = a.querySelector('img');
                    let coverUrl = null;
                    if (img) {
                        const srcset = img.getAttribute('srcset');
                        if (srcset) {
                            const entries = srcset.split(',').map(s => s.trim().split(' '));
                            if (entries.length > 0) {
                                coverUrl = entries[entries.length - 1][0];
                            }
                        }
                        if (!coverUrl && img.src && !img.src.startsWith('data:')) {
                            coverUrl = img.src;
                        }
                    }

                    const highlightUrl = href.startsWith('http') ? href : `https://www.instagram.com${href}`;

                    results.push({
                        id: id,
                        title: title || `Highlight ${results.length + 1}`,
                        coverImage: coverUrl,
                        coverImageUrl: coverUrl,
                        thumbnail: coverUrl,
                        storyCount: null,
                        highlightUrl: highlightUrl,
                        downloadedCover: null,
                        localCoverPath: null
                    });
                }
                return results;
            }"""
        )

        if raw_highlights and isinstance(raw_highlights, list):
            highlights = raw_highlights
    except Exception as e:
        logger.warning(f"Highlights scraping note: {e}")

    return highlights
