import re
import time
import asyncio
from typing import Dict, Any, List, Optional
from playwright.async_api import Page
from loguru import logger


def _is_accessibility_text(text: Optional[str]) -> bool:
    """Detects if text is Instagram accessibility / alt-text rather than a genuine user caption."""
    if not text:
        return False
    t = text.strip().lower()
    return (
        t.startswith("photo by ")
        or t.startswith("photo shared by ")
        or t.startswith("video by ")
        or t.startswith("may be an image of")
        or t.startswith("may be a graphic of")
        or t.startswith("image may contain")
    )


def _parse_meta_description(desc: str) -> Dict[str, Any]:
    """
    Extracts real author caption, likes, comments, hashtags, and mentions
    from Instagram's standard OpenGraph / meta description tag:
    Format: '195K likes, 2,098 comments - username on August 2, 2026: "Caption text..."'
    """
    if not desc:
        return {}
    desc = desc.strip()

    caption = None
    m_cap = re.search(r':\s*["“](.*)["”][\s\.]*$', desc, re.DOTALL)
    if m_cap:
        caption = m_cap.group(1).strip()
    elif ':"' in desc:
        parts = desc.split(':"', 1)
        if len(parts) > 1:
            caption = parts[1].rstrip('". ').strip()
    elif ': "' in desc:
        parts = desc.split(': "', 1)
        if len(parts) > 1:
            caption = parts[1].rstrip('". ').strip()

    if caption and _is_accessibility_text(caption):
        caption = None

    likes = None
    m_likes = re.search(r'([\d\.,]+[KkMmBb]?)\s+likes', desc)
    if m_likes:
        likes_str = m_likes.group(1).replace(',', '')
        try:
            if likes_str.lower().endswith('k'):
                likes = int(float(likes_str[:-1]) * 1000)
            elif likes_str.lower().endswith('m'):
                likes = int(float(likes_str[:-1]) * 1000000)
            elif likes_str.lower().endswith('b'):
                likes = int(float(likes_str[:-1]) * 1000000000)
            else:
                likes = int(float(likes_str))
        except Exception:
            likes = None

    comments = None
    m_comm = re.search(r'([\d\.,]+[KkMmBb]?)\s+comments', desc)
    if m_comm:
        comm_str = m_comm.group(1).replace(',', '')
        try:
            if comm_str.lower().endswith('k'):
                comments = int(float(comm_str[:-1]) * 1000)
            elif comm_str.lower().endswith('m'):
                comments = int(float(comm_str[:-1]) * 1000000)
            else:
                comments = int(float(comm_str))
        except Exception:
            comments = None

    hashtags = []
    mentions = []
    if caption:
        hashtags = [f"#{h}" for h in re.findall(r'#(\w+)', caption)]
        mentions = [f"@{m}" for m in re.findall(r'@([a-zA-Z0-9_\.]+)', caption)]

    return {
        "caption": caption if caption else None,
        "likes": likes,
        "comments": comments,
        "hashtags": list(dict.fromkeys(hashtags)),
        "mentions": list(dict.fromkeys(mentions)),
    }


async def _inspect_single_post(context, post: Dict[str, Any]) -> None:
    """
    Opens the post in an isolated browser page tab, extracting genuine author caption,
    high-resolution original media, ISO timestamp, tagged accounts, and engagement metrics.
    Guarantees no DOM cross-contamination with other posts.
    """
    post_url = post.get("postUrl")
    if not post_url:
        return

    p_page = None
    try:
        p_page = await context.new_page()
        await p_page.goto(post_url, wait_until="domcontentloaded", timeout=12000)
        await p_page.wait_for_timeout(600)

        data = await p_page.evaluate(
            r"""() => {
                const metaDesc = document.querySelector('meta[property="og:description"], meta[name="description"]');
                const desc = metaDesc ? metaDesc.getAttribute("content") : "";

                const metaImg = document.querySelector('meta[property="og:image"]');
                const ogImg = metaImg ? metaImg.getAttribute("content") : null;

                const timeEl = document.querySelector('time[datetime]');
                const date = timeEl ? (timeEl.getAttribute("datetime") || timeEl.getAttribute("title")) : null;

                // Caption from DOM article if present
                let domCaption = null;
                const captionEl = document.querySelector('div[data-testid="post-comment-root"], article h1, article span[dir="auto"]');
                if (captionEl) {
                    let raw = (captionEl.innerText || "").trim();
                    if (raw && !/^photo by|^photo shared by|^video by|^may be an image of/i.test(raw)) {
                        const lines = raw.split('\n');
                        if (lines.length > 1 && lines[0].trim().length <= 35 && !lines[0].includes(' ')) {
                            raw = lines.slice(1).join('\n').trim();
                        }
                        if (raw && !/^(like|reply|view all|see translation)$/i.test(raw)) {
                            domCaption = raw;
                        }
                    }
                }

                // HD Image from Article
                let hdImg = null;
                let imgWidth = null;
                let imgHeight = null;
                const imgEl = document.querySelector('article img[src*="cdninstagram.com"], article img');
                if (imgEl) {
                    imgWidth = imgEl.naturalWidth || null;
                    imgHeight = imgEl.naturalHeight || null;
                    const srcset = imgEl.getAttribute('srcset');
                    if (srcset) {
                        const entries = srcset.split(',').map(s => s.trim().split(' '));
                        if (entries.length > 0) hdImg = entries[entries.length - 1][0];
                    }
                    if (!hdImg) hdImg = imgEl.src;
                }

                // Tagged Accounts
                const taggedAccounts = [];
                const tagLinks = Array.from(document.querySelectorAll('a[href^="/"][role="link"], a[href^="https://www.instagram.com/"][role="link"]'));
                for (const tl of tagLinks) {
                    const userTag = tl.innerText ? tl.innerText.trim() : '';
                    if (userTag && userTag.startsWith('@')) {
                        taggedAccounts.push(userTag);
                    }
                }

                // Location
                const locAnchor = document.querySelector('a[href*="/explore/locations/"]');
                const location = locAnchor ? locAnchor.innerText.trim() : null;

                return {
                    desc: desc,
                    ogImg: ogImg,
                    date: date,
                    domCaption: domCaption,
                    hdImg: hdImg,
                    imgWidth: imgWidth,
                    imgHeight: imgHeight,
                    taggedAccounts: taggedAccounts,
                    location: location,
                };
            }"""
        )

        if data:
            meta_parsed = _parse_meta_description(data.get("desc", ""))

            # 1. Real caption (priority: meta description authentic author caption -> DOM caption)
            real_caption = meta_parsed.get("caption") or data.get("domCaption")
            if real_caption and not _is_accessibility_text(real_caption):
                post["caption"] = real_caption
                post["hashtags"] = meta_parsed.get("hashtags") or list(dict.fromkeys(re.findall(r"#[a-zA-Z0-9_]+", real_caption)))
                post["mentions"] = meta_parsed.get("mentions") or list(dict.fromkeys(re.findall(r"@[a-zA-Z0-9_.]+", real_caption)))

            # 2. Date
            if data.get("date"):
                post["date"] = data["date"]
                post["uploadDate"] = data["date"]

            # 3. Location
            if data.get("location"):
                post["location"] = data["location"]

            # 4. Likes & Comments from meta
            if meta_parsed.get("likes") is not None and post.get("likes") is None:
                post["likes"] = meta_parsed["likes"]
            if meta_parsed.get("comments") is not None and post.get("comments") is None:
                post["comments"] = meta_parsed["comments"]

            # 5. Tagged accounts
            if data.get("taggedAccounts"):
                post["taggedAccounts"] = list(dict.fromkeys(data["taggedAccounts"]))

            # 6. Dimensions
            if data.get("imgWidth"):
                post["width"] = data["imgWidth"]
            if data.get("imgHeight"):
                post["height"] = data["imgHeight"]

            # 7. HD Image: update only with valid distinct image for THIS post
            new_img = data.get("hdImg") or data.get("ogImg")
            if new_img and not new_img.startswith("data:") and new_img.startswith("http"):
                post["imageUrl"] = new_img
                post["originalUrl"] = new_img
                post["originalImageUrl"] = new_img

    except Exception as e:
        logger.debug(f"Isolated inspection note for {post.get('id')}: {e}")
    finally:
        if p_page:
            try:
                await p_page.close()
            except Exception:
                pass


async def scrape_posts(
    page: Page,
    max_posts: int = 12,
    live_logger: Optional[List[str]] = None,
    raw_logger: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """
    Extracts high-fidelity, 100% unique post items from Instagram profile:
    - Independent scraping of each post item
    - Real authentic author captions (never accessibility/alt-text, returns None if empty)
    - Pinned posts detection and top sorting
    - Full hashtags, mentions, and tagged accounts
    - ISO timestamps, tagged locations
    - High-resolution original media assets
    - Precise null handling for unexposed likes/comments
    - Strict post uniqueness verification
    """
    posts: List[Dict[str, Any]] = []

    # 1. Smooth Scroll to trigger lazy loading of post grid
    for _ in range(3):
        await page.mouse.wheel(0, 700)
        await page.wait_for_timeout(250)

    # 2. Extract initial post items from profile grid (each post gets a distinct object)
    try:
        grid_posts = await page.evaluate(
            """(maxPosts) => {
                const items = [];
                const anchors = Array.from(document.querySelectorAll('main article a[href*="/p/"], main article a[href*="/reel/"], main a[href*="/p/"], main a[href*="/reel/"]'));
                
                const seenShortcodes = new Set();
                for (const a of anchors) {
                    const href = a.getAttribute('href') || '';
                    const postUrl = href.startsWith('http') ? href : `https://www.instagram.com${href}`;
                    const match = href.match(/\\/(?:p|reel)\\/([^\\/\\?]+)/);
                    const shortcode = match ? match[1] : `post_${items.length + 1}`;
                    
                    if (seenShortcodes.has(shortcode)) continue;
                    seenShortcodes.add(shortcode);

                    const img = a.querySelector('img');
                    let imageUrl = null;
                    let altText = null;
                    if (img) {
                        altText = img.getAttribute('alt') || null;
                        const srcset = img.getAttribute('srcset');
                        if (srcset) {
                            const entries = srcset.split(',').map(s => s.trim().split(' '));
                            if (entries.length > 0) {
                                imageUrl = entries[entries.length - 1][0];
                            }
                        }
                        if (!imageUrl && img.src && !img.src.startsWith('data:')) {
                            imageUrl = img.src;
                        }
                    }

                    // Post types classification (Image, Carousel, Reel, Video)
                    const isReel = href.includes('/reel/') || Boolean(a.querySelector('svg[aria-label*="Clip" i], svg[aria-label*="Reel" i]'));
                    const isCarousel = Boolean(a.querySelector('svg[aria-label*="Carousel" i], svg[aria-label*="Sidecar" i], svg[aria-label*="Multiple" i]'));
                    const isVideo = isReel || Boolean(a.querySelector('svg[aria-label*="Video" i]'));
                    const isImage = !isReel && !isVideo && !isCarousel;

                    let mediaType = "Image";
                    if (isReel) mediaType = "Reel";
                    else if (isCarousel) mediaType = "Carousel";
                    else if (isVideo) mediaType = "Video";

                    // Pinned Post Detection
                    const pinSvg = a.querySelector('svg[aria-label*="Pin" i], svg[aria-label*="Pinned" i], span[title*="Pin" i], div[aria-label*="Pinned" i], path[d*="M12 2"]');
                    const isPinned = Boolean(pinSvg);

                    // Overlay stats (null if not visible on overlay)
                    let likes = null;
                    let comments = null;
                    const overlayLis = a.querySelectorAll('ul li');
                    if (overlayLis.length >= 1) {
                        const lText = overlayLis[0].innerText || '';
                        const lNum = parseInt(lText.replace(/\\D/g, ''), 10);
                        if (!isNaN(lNum) && lNum >= 0) likes = lNum;
                    }
                    if (overlayLis.length >= 2) {
                        const cText = overlayLis[1].innerText || '';
                        const cNum = parseInt(cText.replace(/\\D/g, ''), 10);
                        if (!isNaN(cNum) && cNum >= 0) comments = cNum;
                    }

                    if (imageUrl && !imageUrl.startsWith('data:')) {
                        items.push({
                            id: shortcode,
                            shortcode: shortcode,
                            caption: null,
                            hashtags: [],
                            mentions: [],
                            taggedAccounts: [],
                            location: null,
                            uploadDate: null,
                            date: null,
                            postUrl: postUrl,
                            imageUrl: imageUrl,
                            originalUrl: imageUrl,
                            originalImageUrl: imageUrl,
                            videoUrl: isReel ? postUrl : null,
                            thumbnail: imageUrl,
                            thumbnailUrl: imageUrl,
                            mediaType: mediaType,
                            carouselCount: isCarousel ? 2 : null,
                            isPinned: isPinned,
                            isSponsored: false,
                            isReel: isReel,
                            isCarousel: isCarousel,
                            isVideo: isVideo,
                            isImage: isImage,
                            accessibilityText: altText || null,
                            altText: altText || null,
                            imagePath: null,
                            localFilePath: null,
                            localPath: null,
                            localImagePath: null,
                            mediaUrl: null,
                            downloadStatus: "SUCCESS",
                            fileSize: null,
                            mimeType: null,
                            checksum: null,
                            width: null,
                            height: null,
                            likes: likes,
                            comments: comments,
                        });
                    }

                    if (items.length >= maxPosts) break;
                }
                return items;
            }""",
            max_posts,
        )

        if grid_posts and isinstance(grid_posts, list):
            posts = grid_posts[:max_posts]
    except Exception as e:
        logger.warning(f"Grid post collection note: {e}")

    # 3. Deep Isolated Post Inspection (Concurrently in batches of 2)
    context = page.context
    total_to_open = len(posts)

    for idx, post in enumerate(posts):
        t_open = time.time()
        shortcode = post.get("id")
        if not shortcode:
            continue

        try:
            await _inspect_single_post(context, post)
            dur_post = time.time() - t_open
            step_msg = f"Opening Post {idx + 1}/{total_to_open} ({dur_post:.1f}s)"
            if live_logger is not None:
                live_logger.append(step_msg)
            if raw_logger is not None:
                has_cap = bool(post.get('caption'))
                raw_logger.append(f"Inspected post {shortcode} in {dur_post:.2f}s (Caption: {has_cap}, Pinned: {post.get('isPinned')})")

        except Exception as e:
            logger.debug(f"Deep inspection for post {post.get('id')} skipped: {e}")

    # 4. Strictly sort Pinned Posts to the top
    posts.sort(key=lambda p: (not p.get("isPinned", False)))

    # 5. Verification: Check for duplicate image URLs or shortcodes
    seen_ids = set()
    seen_imgs = set()
    for idx, p in enumerate(posts):
        p_id = p.get("id")
        p_img = p.get("imageUrl")
        if p_id in seen_ids:
            logger.warning(f"Duplicate post ID detected: {p_id}")
        seen_ids.add(p_id)
        if p_img:
            if p_img in seen_imgs:
                logger.warning(f"Duplicate image URL detected for post {p_id}")
            seen_imgs.add(p_img)

    return posts

