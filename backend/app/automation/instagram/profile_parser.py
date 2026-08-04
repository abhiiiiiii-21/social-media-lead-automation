import re
import json
import asyncio
import urllib.parse
from typing import Dict, Any, Optional, List, Callable, Awaitable
from playwright.async_api import Page
from loguru import logger

# Selectors
BIO_META_SELECTOR = "meta[property='og:description']"
FULL_NAME_META_SELECTOR = "meta[property='og:title']"
PROFILE_IMG_META_SELECTOR = "meta[property='og:image']"
VERIFIED_BADGE_SELECTOR = "svg[aria-label='Verified'], svg[aria-label*='verified' i]"


def _parse_number(val: Optional[str]) -> int:
    """Converts K, M, B strings or formatted integers with commas to integer."""
    if not val:
        return 0
    cleaned = str(val).upper().replace(",", "").strip()
    multiplier = 1
    if "K" in cleaned:
        multiplier = 1000
        cleaned = cleaned.replace("K", "")
    elif "M" in cleaned:
        multiplier = 1000000
        cleaned = cleaned.replace("M", "")
    elif "B" in cleaned:
        multiplier = 1000000000
        cleaned = cleaned.replace("B", "")

    try:
        return int(float(cleaned) * multiplier)
    except (ValueError, TypeError):
        return 0


def _clean_instagram_redirect_url(url: Optional[str]) -> Optional[str]:
    """Decodes Instagram redirect wrap (l.instagram.com/?u=https%3A%2F%2F...)."""
    if not url:
        return None
    if "l.instagram.com" in url:
        match = re.search(r"[?&]u=([^&]+)", url)
        if match:
            try:
                return urllib.parse.unquote(match.group(1))
            except Exception:
                pass
    return url


def _classify_url_type(url: str) -> str:
    """Classifies external link domain into standard types."""
    u_lower = url.lower()
    if "linktr.ee" in u_lower:
        return "linktree"
    elif "beacons.ai" in u_lower:
        return "beacons"
    elif "bento.me" in u_lower:
        return "bento"
    elif "youtube.com" in u_lower or "youtu.be" in u_lower:
        return "youtube"
    elif "twitter.com" in u_lower or "x.com" in u_lower:
        return "twitter"
    elif "cal.com" in u_lower or "calendly.com" in u_lower:
        return "calendar"
    elif "wa.me" in u_lower or "whatsapp.com" in u_lower:
        return "whatsapp"
    elif "linkedin.com" in u_lower:
        return "linkedin"
    elif "tiktok.com" in u_lower:
        return "tiktok"
    return "website"


def _extract_email_from_text(text: Optional[str]) -> Optional[str]:
    """Extracts email ONLY if present in string."""
    if not text:
        return None
    match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    if match:
        found = match.group(0).strip(".,;:()")
        if "." in found.split("@")[-1] and len(found.split("@")[-1]) >= 2:
            return found
    return None


def _extract_phone_from_text(text: Optional[str]) -> Optional[str]:
    """Extracts phone number ONLY if present in string."""
    if not text:
        return None
    phone_pattern = r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}"
    matches = re.findall(phone_pattern, text)
    for m in matches:
        digits_only = re.sub(r"\D", "", m)
        if 7 <= len(digits_only) <= 15:
            return m.strip(".,;:()")
    return None


def _extract_whatsapp_from_text(text: Optional[str]) -> Optional[str]:
    """Extracts WhatsApp number or wa.me link if mentioned in text."""
    if not text:
        return None
    wa_match = re.search(r"(?:wa\.me\/|whatsapp:\s*|\+)(\d{8,15})", text, re.IGNORECASE)
    if wa_match:
        return wa_match.group(1).strip()
    return None


async def _retry_section(name: str, fn: Callable[[], Awaitable[Any]], retries: int = 1) -> Any:
    """Executes a scraping section with retry logic to avoid failing the entire process."""
    for attempt in range(retries + 1):
        try:
            return await fn()
        except Exception as e:
            if attempt < retries:
                logger.warning(f"Section '{name}' failed (attempt {attempt+1}/{retries+1}): {e}. Retrying...")
                await asyncio.sleep(0.5)
            else:
                logger.warning(f"Section '{name}' failed after {retries+1} attempts: {e}. Continuing with partial data.")
                return None


async def parse_profile(page: Page, username: str) -> Dict[str, Any]:
    """
    Performs comprehensive Playwright DOM, JSON-LD, OpenGraph, Highlights,
    and Post Grid extraction on an Instagram profile page.
    """
    data: Dict[str, Any] = {
        "username": username,
        "full_name": None,
        "bio": None,
        "followers": 0,
        "following": 0,
        "posts": 0,
        "website": None,
        "profile_image": None,
        "verified": False,
        "business_account": False,
        "category": None,
        "external_email": None,
        "external_phone": None,
        "whatsapp": None,
        "address": None,
        "contact_buttons": [],
        "external_links": [],
        "highlights": [],
        "latest_posts": [],
        "is_private": False,
    }

    # 1. Section: JSON-LD & Meta Tags
    async def extract_meta_and_json_ld():
        # JSON-LD extraction
        try:
            json_ld_scripts = await page.locator('script[type="application/ld+json"]').all_inner_texts()
            for script_content in json_ld_scripts:
                try:
                    parsed_json = json.loads(script_content)
                    if isinstance(parsed_json, dict):
                        if parsed_json.get("name"):
                            data["full_name"] = parsed_json.get("name")
                        if parsed_json.get("description"):
                            data["bio"] = parsed_json.get("description")
                        if parsed_json.get("image"):
                            data["profile_image"] = parsed_json.get("image")

                        interaction_stats = parsed_json.get("interactionStatistic", [])
                        if isinstance(interaction_stats, dict):
                            interaction_stats = [interaction_stats]
                        for stat in interaction_stats:
                            interaction_type = str(stat.get("interactionType", ""))
                            count = stat.get("userInteractionCount")
                            if "FollowAction" in interaction_type and count is not None:
                                data["followers"] = _parse_number(str(count))
                            elif "WriteAction" in interaction_type and count is not None:
                                data["posts"] = _parse_number(str(count))
                except Exception:
                    continue
        except Exception:
            pass

        # Meta tags
        try:
            og_title = await page.get_attribute(FULL_NAME_META_SELECTOR, "content")
            if og_title and not data["full_name"]:
                title_match = re.search(r"^(.*?)(?=\s\(@|\s•|\s-)", og_title)
                if title_match:
                    extracted_name = title_match.group(1).strip()
                    if extracted_name.lower() != username.lower():
                        data["full_name"] = extracted_name

            og_description = await page.get_attribute(BIO_META_SELECTOR, "content")
            if og_description:
                match_followers = re.search(r"([\d\.,MKB]+)\s+Followers", og_description, re.IGNORECASE)
                match_following = re.search(r"([\d\.,MKB]+)\s+Following", og_description, re.IGNORECASE)
                match_posts = re.search(r"([\d\.,MKB]+)\s+Posts", og_description, re.IGNORECASE)

                if match_followers and data["followers"] == 0:
                    data["followers"] = _parse_number(match_followers.group(1))
                if match_following and data["following"] == 0:
                    data["following"] = _parse_number(match_following.group(1))
                if match_posts and data["posts"] == 0:
                    data["posts"] = _parse_number(match_posts.group(1))

            og_image = await page.get_attribute(PROFILE_IMG_META_SELECTOR, "content")
            if og_image and not data["profile_image"]:
                data["profile_image"] = og_image
        except Exception:
            pass

    await _retry_section("meta_and_json_ld", extract_meta_and_json_ld)

    # 2. Section: Header DOM Extraction (Exact stats, Category, Bio with linebreaks, Verified, Buttons)
    async def extract_header_dom():
        header_data = await page.evaluate(
            """() => {
                const res = {
                    fullName: null,
                    bio: null,
                    category: null,
                    followersExact: null,
                    followingExact: null,
                    postsExact: null,
                    isVerified: false,
                    isBusiness: false,
                    isPrivate: false,
                    profileImage: null,
                    contactButtons: [],
                    externalLinks: []
                };

                const bodyText = document.body ? document.body.innerText : '';
                if (bodyText.includes('This Account is Private') || bodyText.includes('This account is private')) {
                    res.isPrivate = true;
                }

                const header = document.querySelector('header') || document.querySelector('main header') || document.querySelector('section');
                if (!header) return res;

                // Verified Badge
                const verifiedSvg = header.querySelector("svg[aria-label='Verified'], svg[aria-label*='verified' i]");
                if (verifiedSvg) {
                    res.isVerified = true;
                }

                // Profile Image
                const avatarImg = header.querySelector('img[alt*="profile picture" i], img[src*="cdninstagram.com"], img');
                if (avatarImg && avatarImg.src && !avatarImg.src.startsWith('data:')) {
                    res.profileImage = avatarImg.src;
                }

                // Stats (Posts, Followers, Following)
                const statElements = Array.from(header.querySelectorAll('ul li, div[role="region"] li, header section ul li'));
                for (const el of statElements) {
                    const text = el.innerText || '';
                    const titleSpan = el.querySelector('span[title]');
                    const exactValue = titleSpan ? titleSpan.getAttribute('title') : null;

                    if (/followers/i.test(text)) {
                        res.followersExact = exactValue || text.replace(/followers/i, '').trim();
                    } else if (/following/i.test(text)) {
                        res.followingExact = exactValue || text.replace(/following/i, '').trim();
                    } else if (/posts|post/i.test(text)) {
                        res.postsExact = exactValue || text.replace(/posts|post/i, '').trim();
                    }
                }

                // Full Name
                const h1 = header.querySelector('h1, h2');
                if (h1 && h1.innerText && h1.innerText.trim()) {
                    res.fullName = h1.innerText.trim();
                }

                // Business Category
                const categoryCandidates = Array.from(header.querySelectorAll('div, span, p')).filter(el => {
                    const txt = el.innerText ? el.innerText.trim() : '';
                    if (!txt || txt.length > 45 || txt.includes('\\n')) return false;
                    return !el.querySelector('div, p') &&
                           !/followers|following|posts|follow|following|message|contact|options/i.test(txt);
                });
                for (const cand of categoryCandidates) {
                    const txt = cand.innerText.trim();
                    if (/Creator|Agent|Artist|Musician|Author|Coach|Entrepreneur|Designer|Agency|Service|Company|Store|Brand|Personal blog|Public figure|Real Estate|Doctor|Lawyer|Consultant/i.test(txt)) {
                        res.category = txt;
                        res.isBusiness = true;
                        break;
                    }
                }

                // Bio
                const bioContainer = header.querySelector('section > div:last-child > div > span, header div[dir="auto"]');
                if (bioContainer && bioContainer.innerText) {
                    res.bio = bioContainer.innerText.trim();
                } else {
                    const allSpans = Array.from(header.querySelectorAll('span')).filter(s => s.innerText && s.innerText.includes('\\n'));
                    if (allSpans.length > 0) {
                        res.bio = allSpans[0].innerText.trim();
                    }
                }

                // Contact Buttons
                const actionButtons = Array.from(header.querySelectorAll('button, div[role="button"], a[role="button"]'));
                for (const btn of actionButtons) {
                    const btnText = (btn.innerText || '').trim();
                    if (btnText && btnText.length < 30 && !/follow|following|requested|edit profile/i.test(btnText)) {
                        if (/email|call|contact|message|whatsapp|directions|book|view shop|order/i.test(btnText)) {
                            res.contactButtons.push(btnText);
                        }
                    }
                }

                // Links
                const linkAnchors = Array.from(header.querySelectorAll('a[href*="l.instagram.com"], a[target="_blank"], a[role="link"]'));
                const foundHrefs = new Set();
                for (const a of linkAnchors) {
                    const href = a.getAttribute('href');
                    if (href && !href.includes('/direct/') && !href.includes('/accounts/') && !href.includes('/explore/')) {
                        const linkText = (a.innerText || '').trim();
                        if (!foundHrefs.has(href)) {
                            foundHrefs.add(href);
                            res.externalLinks.push({
                                rawHref: href,
                                title: linkText || null
                            });
                        }
                    }
                }

                return res;
            }"""
        )

        if header_data:
            if header_data.get("fullName") and not data["full_name"]:
                data["full_name"] = header_data["fullName"]
            if header_data.get("bio") and not data["bio"]:
                data["bio"] = header_data["bio"]
            if header_data.get("category"):
                data["category"] = header_data["category"]
                data["business_account"] = True
            if header_data.get("profileImage") and not data["profile_image"]:
                data["profile_image"] = header_data["profileImage"]
            if header_data.get("isVerified"):
                data["verified"] = True
            if header_data.get("isPrivate"):
                data["is_private"] = True
            if header_data.get("contactButtons"):
                data["contact_buttons"] = header_data["contactButtons"]

            # Exact counts
            if header_data.get("followersExact"):
                val = _parse_number(header_data["followersExact"])
                if val > 0:
                    data["followers"] = val
            if header_data.get("followingExact"):
                val = _parse_number(header_data["followingExact"])
                if val > 0:
                    data["following"] = val
            if header_data.get("postsExact"):
                val = _parse_number(header_data["postsExact"])
                if val > 0:
                    data["posts"] = val

            # Process links
            links_list = []
            for item in header_data.get("externalLinks", []):
                cleaned_url = _clean_instagram_redirect_url(item.get("rawHref"))
                if cleaned_url and cleaned_url.startswith("http"):
                    link_type = _classify_url_type(cleaned_url)
                    links_list.append({
                        "url": cleaned_url,
                        "title": item.get("title") or cleaned_url.replace("https://", "").replace("http://", "").split("/")[0],
                        "type": link_type
                    })
            if links_list:
                data["external_links"] = links_list
                data["website"] = links_list[0]["url"]

    await _retry_section("header_dom", extract_header_dom)

    # 3. Section: Multi-Link Modal Handling (Instagram 'and 2 other links' popup)
    async def extract_multi_links_modal():
        try:
            # Check if there is a multi-link button in header (e.g. '...and 1 other', '2 links')
            multi_link_btn = page.locator('header button:has-text("other"), header button:has-text("links"), header div[role="button"]:has-text("other")')
            if await multi_link_btn.count() > 0:
                await multi_link_btn.first.click(timeout=2000)
                await page.wait_for_timeout(600)
                
                # Extract links from modal dialog
                modal_links = await page.evaluate(
                    """() => {
                        const links = [];
                        const modal = document.querySelector('div[role="dialog"]');
                        if (!modal) return links;
                        const anchors = Array.from(modal.querySelectorAll('a[href]'));
                        for (const a of anchors) {
                            const href = a.getAttribute('href');
                            const title = a.innerText.trim();
                            if (href && !href.startsWith('/') && !href.includes('instagram.com')) {
                                links.push({ rawHref: href, title: title || null });
                            }
                        }
                        return links;
                    }"""
                )
                for item in modal_links:
                    cleaned = _clean_instagram_redirect_url(item.get("rawHref"))
                    if cleaned and cleaned.startswith("http") and not any(l["url"] == cleaned for l in data["external_links"]):
                        data["external_links"].append({
                            "url": cleaned,
                            "title": item.get("title") or cleaned.replace("https://", "").replace("http://", "").split("/")[0],
                            "type": _classify_url_type(cleaned)
                        })
                
                # Close modal if open
                close_btn = page.locator('div[role="dialog"] svg[aria-label="Close"], div[role="dialog"] button:has-text("Close")')
                if await close_btn.count() > 0:
                    await close_btn.first.click(timeout=1000)
        except Exception:
            pass

    await _retry_section("multi_links", extract_multi_links_modal)

    # 4. Section: Direct Contact & WhatsApp Info
    async def extract_contacts():
        # Check mailto & tel anchors
        try:
            mailto_links = await page.locator('header a[href^="mailto:"]').all()
            for ml in mailto_links:
                href = await ml.get_attribute("href")
                if href:
                    clean = href.replace("mailto:", "").split("?")[0].strip()
                    if clean:
                        data["external_email"] = clean
                        break

            tel_links = await page.locator('header a[href^="tel:"]').all()
            for tl in tel_links:
                href = await tl.get_attribute("href")
                if href:
                    clean = href.replace("tel:", "").split("?")[0].strip()
                    if clean:
                        data["external_phone"] = clean
                        break
        except Exception:
            pass

        # Check bio & external links for email / phone / whatsapp
        if not data["external_email"] and data["bio"]:
            data["external_email"] = _extract_email_from_text(data["bio"])
        if not data["external_phone"] and data["bio"]:
            data["external_phone"] = _extract_phone_from_text(data["bio"])
        if not data["whatsapp"]:
            if data["bio"]:
                data["whatsapp"] = _extract_whatsapp_from_text(data["bio"])
            for link_obj in data["external_links"]:
                u = link_obj.get("url", "")
                if "wa.me/" in u or "api.whatsapp.com/send" in u:
                    wa_clean = re.sub(r"\D", "", u.split("/")[-1])
                    if wa_clean:
                        data["whatsapp"] = wa_clean
                        break

    await _retry_section("contacts", extract_contacts)

    # 5. Section: Highlights Extraction
    async def extract_highlights():
        highlights_data = await page.evaluate(
            """() => {
                const results = [];
                // Look for highlights container (story trays under bio)
                const highlightAnchors = Array.from(document.querySelectorAll('main div[role="region"] a[href*="/stories/highlights/"], header ~ div a[href*="/stories/highlights/"], a[href*="/stories/highlights/"]'));
                
                const seenIds = new Set();
                for (const a of highlightAnchors) {
                    const href = a.getAttribute('href') || '';
                    const match = href.match(/\\/stories\\/highlights\\/([^\\/]+)/);
                    const id = match ? match[1] : `hl_${results.length + 1}`;
                    if (seenIds.has(id)) continue;
                    seenIds.add(id);

                    const titleEl = a.querySelector('span, div[dir="auto"], div');
                    const title = titleEl ? titleEl.innerText.trim() : `Highlight ${results.length + 1}`;

                    const img = a.querySelector('img');
                    const coverImageUrl = img ? img.getAttribute('src') : null;

                    results.push({
                        id: id,
                        title: title || `Highlight ${results.length + 1}`,
                        coverImageUrl: coverImageUrl || null,
                        storyCount: null
                    });
                }
                return results;
            }"""
        )
        if highlights_data and isinstance(highlights_data, list):
            data["highlights"] = highlights_data

    await _retry_section("highlights", extract_highlights)

    # 6. Section: Post Grid Extraction (Latest 12 Posts with Lazy Scroll & Pinned Detection)
    async def extract_posts_grid():
        if data["is_private"]:
            return

        # Perform lazy scroll to trigger post loading
        for _ in range(3):
            await page.mouse.wheel(0, 800)
            await page.wait_for_timeout(400)

        posts_data = await page.evaluate(
            """() => {
                const posts = [];
                const postAnchors = Array.from(document.querySelectorAll('main article a[href*="/p/"], main article a[href*="/reel/"], main a[href*="/p/"], main a[href*="/reel/"]'));
                
                const seenShortcodes = new Set();
                for (const a of postAnchors) {
                    const href = a.getAttribute('href') || '';
                    const postUrl = href.startsWith('http') ? href : `https://www.instagram.com${href}`;
                    const shortcodeMatch = href.match(/\\/(?:p|reel)\\/([^\\/]+)/);
                    const shortcode = shortcodeMatch ? shortcodeMatch[1] : `post_${posts.length + 1}`;
                    
                    if (seenShortcodes.has(shortcode)) continue;
                    seenShortcodes.add(shortcode);

                    const img = a.querySelector('img');
                    const imageUrl = img ? (img.getAttribute('src') || '') : '';
                    const altText = img ? (img.getAttribute('alt') || '') : '';

                    // Post types
                    const isReel = href.includes('/reel/') || Boolean(a.querySelector('svg[aria-label*="Clip" i], svg[aria-label*="Reel" i], span[aria-label*="Reel" i]'));
                    const isCarousel = Boolean(a.querySelector('svg[aria-label*="Carousel" i], svg[aria-label*="Sidecar" i], svg[aria-label*="Multiple" i]'));
                    const isVideo = isReel || Boolean(a.querySelector('svg[aria-label*="Video" i]'));
                    const isImage = !isReel && !isVideo;

                    // Pinned Detection
                    const pinSvg = a.querySelector('svg[aria-label*="Pin" i], svg[aria-label*="Pinned" i], span[title*="Pin" i], div[aria-label*="Pinned" i]');
                    const isPinned = Boolean(pinSvg);

                    // Overlay likes / comments
                    let likes = null;
                    let comments = null;
                    const overlayLis = a.querySelectorAll('ul li');
                    if (overlayLis.length >= 1) {
                        const lText = overlayLis[0].innerText || '';
                        const lNum = parseInt(lText.replace(/\\D/g, ''), 10);
                        if (!isNaN(lNum)) likes = lNum;
                    }
                    if (overlayLis.length >= 2) {
                        const cText = overlayLis[1].innerText || '';
                        const cNum = parseInt(cText.replace(/\\D/g, ''), 10);
                        if (!isNaN(cNum)) comments = cNum;
                    }

                    // Extract Hashtags & Mentions from alt text / caption
                    const hashtags = (altText.match(/#[a-zA-Z0-9_]+/g) || []).map(h => h.trim());
                    const mentions = (altText.match(/@[a-zA-Z0-9_.]+/g) || []).map(m => m.trim());

                    if (imageUrl && !imageUrl.startsWith('data:')) {
                        posts.push({
                            id: shortcode,
                            postUrl: postUrl,
                            imageUrl: imageUrl,
                            thumbnailUrl: imageUrl,
                            videoUrl: isReel ? postUrl : null,
                            caption: altText || null,
                            likes: likes,
                            comments: comments,
                            uploadDate: null,
                            location: null,
                            hashtags: hashtags,
                            mentions: mentions,
                            isReel: isReel,
                            isCarousel: isCarousel,
                            isImage: isImage,
                            isVideo: isVideo,
                            isPinned: isPinned,
                            localImagePath: null
                        });
                    }

                    if (posts.length >= 12) break;
                }
                return posts;
            }"""
        )

        if posts_data and isinstance(posts_data, list):
            data["latest_posts"] = posts_data

    await _retry_section("posts_grid", extract_posts_grid)

    return data
