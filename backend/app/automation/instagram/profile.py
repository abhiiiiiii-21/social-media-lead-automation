import re
import json
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from playwright.async_api import Page
from loguru import logger


def _parse_count(val: Optional[str]) -> int:
    """Parses formatted number strings with commas, K, M, B multipliers to exact integer."""
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


# Unicode Emoji Regex Pattern covering Emoticons, Pictographs, Transport, Symbols, Flags
EMOJI_PATTERN = re.compile(
    r"[\U00010000-\U0010ffff\u2600-\u27ff\u2300-\u23ff\u2b50\u2b55\u200d\ufe0f]",
    flags=re.UNICODE,
)


def _extract_emojis(text: Optional[str]) -> List[str]:
    """Extracts all unique emojis present in text using standard Unicode regex."""
    if not text:
        return []
    found = EMOJI_PATTERN.findall(text)
    # Filter out zero-width joiners / variation selectors
    cleaned = [e for e in found if e not in ["\u200d", "\ufe0f"]]
    return list(dict.fromkeys(cleaned))


def _clean_full_name(raw_name: Optional[str], username: str) -> Optional[str]:
    """
    Cleans raw name and strictly ensures it represents a genuine human / business display name
    and NEVER duplicates the username.
    """
    if not raw_name:
        return None
    # Strip ( @username ) • Instagram photos and videos / on Threads
    match = re.search(r"^(.*?)(?:\s*\(@|\s*•|\s*on Threads|\s*on Instagram|\s*\|)", raw_name, re.IGNORECASE)
    cleaned = match.group(1).strip() if match else raw_name.strip()
    cleaned = cleaned.strip("\"'.,:;-")

    clean_user = username.lower().replace("@", "").strip()
    clean_val = cleaned.lower().replace("@", "").strip()

    if not clean_val or clean_val == clean_user or cleaned.startswith("@") or clean_val in ["instagram", "profile"]:
        return None
    return cleaned if len(cleaned) >= 2 else None


async def scrape_profile(page: Page, username: str) -> Dict[str, Any]:
    """
    Extracts comprehensive profile metadata: Username, Full Name, Verified Status,
    Profile Picture, Exact Stats, Category, Account Types, Bio, Emojis, Bio Mentions,
    Bio Hashtags, and Bio Location.
    Category detection is strictly isolated to Instagram's official category tag or returns None.
    Full Name extraction ensures it never repeats the username.
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    profile_url = f"https://www.instagram.com/{username}/"

    data: Dict[str, Any] = {
        "username": username,
        "fullName": None,
        "bio": None,
        "emojis": [],
        "bioMentions": [],
        "bioHashtags": [],
        "bioLocation": None,
        "category": None,
        "businessType": None,
        "accountType": "Personal",
        "profilePictureUrl": None,
        "followers": 0,
        "following": 0,
        "postsCount": 0,
        "isVerified": False,
        "isPrivate": False,
        "isBusiness": False,
        "isCreator": False,
        "isProfessional": False,
        "profileUrl": profile_url,
        "inspectedAt": now_iso,
    }

    # 1. Check Page Title for Full Name
    try:
        page_title = await page.title()
        if page_title:
            extracted_title_name = _clean_full_name(page_title, username)
            if extracted_title_name:
                data["fullName"] = extracted_title_name
    except Exception:
        pass

    try:
        # 2. JSON-LD Schema
        json_ld_scripts = await page.locator('script[type="application/ld+json"]').all_inner_texts()
        for script in json_ld_scripts:
            try:
                parsed = json.loads(script)
                if isinstance(parsed, dict):
                    if parsed.get("name") and not data["fullName"]:
                        c_name = _clean_full_name(str(parsed.get("name")), username)
                        if c_name:
                            data["fullName"] = c_name
                    if parsed.get("description") and not data["bio"]:
                        data["bio"] = str(parsed.get("description")).strip()
                    if parsed.get("image") and not data["profilePictureUrl"]:
                        data["profilePictureUrl"] = str(parsed.get("image"))

                    stats = parsed.get("interactionStatistic", [])
                    if isinstance(stats, dict):
                        stats = [stats]
                    for st in stats:
                        itype = str(st.get("interactionType", ""))
                        cnt = st.get("userInteractionCount")
                        if "FollowAction" in itype and cnt is not None:
                            data["followers"] = int(cnt)
                        elif "WriteAction" in itype and cnt is not None:
                            data["postsCount"] = int(cnt)
            except Exception:
                pass
    except Exception as e:
        logger.debug(f"JSON-LD extraction note: {e}")

    try:
        # 3. Extract Category & Data from Embedded Script Tags (POLARIS, _sharedData, etc.)
        script_texts = await page.evaluate(
            """() => {
                const scripts = Array.from(document.querySelectorAll('script:not([src])'));
                for (const s of scripts) {
                    const txt = s.innerText || '';
                    if (txt.includes('category_name') || txt.includes('business_category_name') || txt.includes('overall_category_name')) {
                        return txt;
                    }
                }
                return null;
            }"""
        )
        if script_texts:
            cat_match = re.search(r'"(?:category_name|business_category_name|overall_category_name)"\s*:\s*"([^"]+)"', script_texts)
            if cat_match and cat_match.group(1).strip() and cat_match.group(1).lower() != "none":
                data["category"] = cat_match.group(1).strip()
    except Exception as e:
        logger.debug(f"Script category extraction note: {e}")

    try:
        # 4. Meta OpenGraph tags
        meta_desc = await page.get_attribute("meta[name='description']", "content") or await page.get_attribute("meta[property='og:description']", "content")
        if meta_desc:
            match_fol = re.search(r"([\d.,]+[KMBkmb]?)\s*Followers", meta_desc)
            match_fing = re.search(r"([\d.,]+[KMBkmb]?)\s*Following", meta_desc)
            match_post = re.search(r"([\d.,]+[KMBkmb]?)\s*Posts", meta_desc)

            if match_fol and data["followers"] == 0:
                data["followers"] = _parse_count(match_fol.group(1))
            if match_fing and data["following"] == 0:
                data["following"] = _parse_count(match_fing.group(1))
            if match_post and data["postsCount"] == 0:
                data["postsCount"] = _parse_count(match_post.group(1))

        og_img = await page.get_attribute("meta[property='og:image']", "content")
        if og_img and not data["profilePictureUrl"]:
            data["profilePictureUrl"] = og_img
    except Exception as e:
        logger.debug(f"OG extraction note: {e}")

    try:
        # 5. Strict DOM Header Extraction
        header_dom = await page.evaluate(
            """(targetUsername) => {
                const res = {
                    fullName: null,
                    bio: null,
                    category: null,
                    followersExact: null,
                    followingExact: null,
                    postsExact: null,
                    isVerified: false,
                    isPrivate: false,
                    profileImage: null,
                };

                const bodyText = document.body ? document.body.innerText : '';
                if (bodyText.includes('This Account is Private') || bodyText.includes('This account is private')) {
                    res.isPrivate = true;
                }

                const header = document.querySelector('header') || document.querySelector('main header');
                if (!header) return res;

                // Verified Badge
                const verifiedSvg = header.querySelector("svg[aria-label='Verified'], svg[aria-label*='verified' i], span[title='Verified']");
                if (verifiedSvg) {
                    res.isVerified = true;
                }

                // Profile Image (Highest Resolution srcset or src)
                const avatarImg = header.querySelector('img[alt*="profile picture" i], img[src*="cdninstagram.com"], img');
                if (avatarImg) {
                    const srcset = avatarImg.getAttribute('srcset');
                    if (srcset) {
                        const entries = srcset.split(',').map(s => s.trim().split(' '));
                        if (entries.length > 0) {
                            res.profileImage = entries[entries.length - 1][0];
                        }
                    }
                    if (!res.profileImage && avatarImg.src && !avatarImg.src.startsWith('data:')) {
                        res.profileImage = avatarImg.src;
                    }
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

                // Full Name (Strictly from header display name span in bio area, NOT username)
                const nameSpans = Array.from(header.querySelectorAll(
                    'span[class*="_aacw"], span[class*="_aad7"], header section > div:last-child > div:first-child span, header section h1'
                ));
                for (const s of nameSpans) {
                    const txt = s.innerText ? s.innerText.trim() : '';
                    if (txt && !txt.includes('\\n') && txt.length >= 2 && txt.length <= 60) {
                        if (!/followers|following|posts|follow|message|threads|contact/i.test(txt)) {
                            const cleanTxt = txt.replace('@', '').toLowerCase();
                            const cleanUser = targetUsername.replace('@', '').toLowerCase();
                            if (cleanTxt !== cleanUser) {
                                res.fullName = txt;
                                break;
                            }
                        }
                    }
                }

                // STRICT OFFICIAL CATEGORY DETECTION:
                const categoryElement = header.querySelector(
                    'div._ap3a._aaco._aacu._aacx._aad6._aade, div._aacl._aaco._aacu._aacx._aad6._aade, header section div[class*="_aaco"]'
                );

                if (categoryElement) {
                    if (!categoryElement.closest('a') && !categoryElement.closest('button') && !categoryElement.closest('ul') && !categoryElement.closest('nav')) {
                        const txt = categoryElement.innerText ? categoryElement.innerText.trim() : '';
                        if (txt && txt.length >= 3 && txt.length <= 50 && !txt.includes('\\n')) {
                            if (!/followers|following|posts|follow|message|threads|contact|options/i.test(txt)) {
                                res.category = txt;
                            }
                        }
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

                return res;
            }""",
            username,
        )

        if header_dom:
            if header_dom.get("fullName") and not data["fullName"]:
                cleaned_dom_name = _clean_full_name(header_dom["fullName"], username)
                if cleaned_dom_name:
                    data["fullName"] = cleaned_dom_name
            if header_dom.get("bio") and not data["bio"]:
                data["bio"] = header_dom["bio"]
            if header_dom.get("category") and not data["category"]:
                data["category"] = header_dom["category"]
            if header_dom.get("profileImage") and not data["profilePictureUrl"]:
                data["profilePictureUrl"] = header_dom["profileImage"]
            if header_dom.get("isVerified"):
                data["isVerified"] = True
            if header_dom.get("isPrivate"):
                data["isPrivate"] = True

            if header_dom.get("followersExact"):
                f_val = _parse_count(header_dom["followersExact"])
                if f_val > 0:
                    data["followers"] = f_val
            if header_dom.get("followingExact"):
                fing_val = _parse_count(header_dom["followingExact"])
                if fing_val > 0:
                    data["following"] = fing_val
            if header_dom.get("postsExact"):
                p_val = _parse_count(header_dom["postsExact"])
                if p_val > 0:
                    data["postsCount"] = p_val
    except Exception as e:
        logger.warning(f"DOM extraction note: {e}")

    # Final Full Name cleanup
    data["fullName"] = _clean_full_name(data.get("fullName"), username)

    # Process Bio for Emojis, Mentions, Hashtags, and Location
    bio_text = data.get("bio") or ""
    if bio_text:
        data["emojis"] = _extract_emojis(bio_text)
        data["bioMentions"] = re.findall(r"@[a-zA-Z0-9_.]+", bio_text)
        data["bioHashtags"] = re.findall(r"#[a-zA-Z0-9_]+", bio_text)

        # Location in bio (e.g. 📍 Dubai, Based in NYC)
        loc_match = re.search(r"(?:📍|based in|located in)\s*([A-Za-z\s,]+)", bio_text, re.IGNORECASE)
        if loc_match:
            data["bioLocation"] = loc_match.group(1).strip()

    # Determine Account Type & Creator/Business Flags
    if data.get("category"):
        cat_lower = data["category"].lower()
        if any(c in cat_lower for c in ["creator", "artist", "musician", "author", "photographer", "public figure"]):
            data["isCreator"] = True
            data["accountType"] = "Creator"
            data["businessType"] = "Creator Account"
        else:
            data["isBusiness"] = True
            data["accountType"] = "Business"
            data["businessType"] = "Professional Business"
        data["isProfessional"] = True
    elif data.get("isVerified"):
        data["isProfessional"] = True

    return data
