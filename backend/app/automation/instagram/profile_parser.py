import re
from typing import Dict, Any, Optional
from playwright.async_api import Page

# Selectors
BIO_SELECTOR = "meta[property='og:description']"
FULL_NAME_SELECTOR = "meta[property='og:title']"
EXTERNAL_URL_SELECTOR = "a[target='_blank'][rel='nofollow']"
PROFILE_IMG_SELECTOR = "meta[property='og:image']"
VERIFIED_BADGE_SELECTOR = "svg[aria-label='Verified']"

async def parse_profile(page: Page, username: str) -> Dict[str, Any]:
    """
    Extracts profile metadata from an Instagram profile page.
    Assumes the page is currently loaded on https://www.instagram.com/{username}/
    """
    data: Dict[str, Any] = {
        "username": username,
        "full_name": None,
        "bio": None,
        "followers": 0,
        "following": 0,
        "website": None,
        "profile_image": None,
        "verified": False,
        "business_account": False,  # Hard to detect strictly from frontend without clicking "contact"
        "business_name": None,
        "external_email": None,
        "external_phone": None,
        "category": None
    }

    try:
        # Extract basic meta tags
        og_title = await page.get_attribute(FULL_NAME_SELECTOR, "content")
        if og_title:
            # Title format usually: "Full Name (@username) • Instagram photos and videos"
            title_match = re.search(r"^(.*?)(?=\s\()", og_title)
            if title_match:
                data["full_name"] = title_match.group(1).strip()
            
            # Follower / Following extraction from title metadata
            # Or from description metadata: "1.2M Followers, 500 Following, 100 Posts - See Instagram photos and videos from Full Name (@username)"
            
        og_description = await page.get_attribute(BIO_SELECTOR, "content")
        if og_description:
            # Description format: "X Followers, Y Following, Z Posts - See Instagram photos and videos from Name (@username)"
            match_followers = re.search(r"([\d\.,MKB]+)\s+Followers", og_description, re.IGNORECASE)
            match_following = re.search(r"([\d\.,MKB]+)\s+Following", og_description, re.IGNORECASE)
            
            if match_followers:
                data["followers"] = _parse_number(match_followers.group(1))
            if match_following:
                data["following"] = _parse_number(match_following.group(1))
                
        # Bio is usually the text content of the profile header. We can grab the general meta description but it doesn't contain the actual bio text.
        # Let's try to extract actual bio by looking for h1/span elements, but relying on broad text extraction.
        # A safer approach for bio is looking for the specific layout.
        bio_elements = await page.locator("h1:below(header) + div > span").all_inner_texts()
        if bio_elements:
            bio_text = "\n".join([t for t in bio_elements if t.strip()])
            data["bio"] = bio_text
            
            # Simple regex to find emails in bio
            email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", bio_text)
            if email_match:
                data["external_email"] = email_match.group(0)
                
            # Simple regex to find phone numbers in bio
            phone_match = re.search(r"\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}", bio_text)
            if phone_match:
                data["external_phone"] = phone_match.group(0)

        # Website Link
        link_count = await page.locator(EXTERNAL_URL_SELECTOR).count()
        if link_count > 0:
            link = await page.locator(EXTERNAL_URL_SELECTOR).first.get_attribute("href")
            # Instagram often wraps links in l.instagram.com
            if link and "l.instagram.com" in link:
                url_match = re.search(r"u=(.*?)&", link)
                if url_match:
                    import urllib.parse
                    data["website"] = urllib.parse.unquote(url_match.group(1))
            else:
                data["website"] = link

        # Profile Image
        og_image = await page.get_attribute(PROFILE_IMG_SELECTOR, "content")
        if og_image:
            data["profile_image"] = og_image

        # Verified status
        verified_count = await page.locator(VERIFIED_BADGE_SELECTOR).count()
        if verified_count > 0:
            data["verified"] = True

    except Exception as e:
        print(f"Error parsing profile {username}: {e}")

    return data


def _parse_number(val: str) -> int:
    """Converts K, M, B strings to integer."""
    val = val.upper().replace(",", "").strip()
    multiplier = 1
    if "K" in val:
        multiplier = 1000
        val = val.replace("K", "")
    elif "M" in val:
        multiplier = 1000000
        val = val.replace("M", "")
    elif "B" in val:
        multiplier = 1000000000
        val = val.replace("B", "")
        
    try:
        return int(float(val) * multiplier)
    except ValueError:
        return 0
