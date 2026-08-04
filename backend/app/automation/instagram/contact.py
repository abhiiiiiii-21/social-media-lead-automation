import re
from typing import Dict, Any, Optional, List
from playwright.async_api import Page
from loguru import logger


def _extract_email_from_text(text: Optional[str]) -> Optional[str]:
    """Extracts email strictly if a valid email is found in text."""
    if not text:
        return None
    match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    if match:
        candidate = match.group(0).strip(".,;:()")
        domain_part = candidate.split("@")[-1]
        if "." in domain_part and len(domain_part.split(".")[-1]) >= 2:
            return candidate
    return None


def _extract_phone_from_text(text: Optional[str]) -> Optional[str]:
    """Extracts international or local phone numbers from text."""
    if not text:
        return None
    phone_pattern = r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}"
    matches = re.findall(phone_pattern, text)
    for m in matches:
        digits = re.sub(r"\D", "", m)
        if 7 <= len(digits) <= 15:
            return m.strip(".,;:()")
    return None


def _extract_whatsapp_from_text_or_url(text_or_url: Optional[str]) -> Optional[str]:
    """Extracts WhatsApp number from wa.me link or bio text."""
    if not text_or_url:
        return None
    wa_match = re.search(r"(?:wa\.me\/|api\.whatsapp\.com\/send\?phone=|\bwhatsapp:\s*|\+)(\d{8,15})", text_or_url, re.IGNORECASE)
    if wa_match:
        return wa_match.group(1).strip()
    return None


async def scrape_contact(
    page: Page,
    bio: Optional[str] = None,
    category: Optional[str] = None,
    external_links: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    Extracts all available direct contact pathways, buttons, emails,
    phone numbers, WhatsApp handles, booking links, and addresses.
    """
    data: Dict[str, Any] = {
        "email": None,
        "phone": None,
        "whatsApp": None,
        "website": None,
        "address": None,
        "bookingLink": None,
        "businessCategory": category or None,
        "contactButtons": [],
    }

    # 1. Extract Mailto, Tel, and Buttons from Header DOM
    try:
        contact_dom = await page.evaluate(
            """() => {
                const res = {
                    mailto: null,
                    tel: null,
                    address: null,
                    buttons: [],
                };

                const header = document.querySelector('header') || document.querySelector('main header') || document.querySelector('section');
                if (!header) return res;

                // Mailto
                const mailAnchor = header.querySelector('a[href^="mailto:"]');
                if (mailAnchor) {
                    res.mailto = mailAnchor.getAttribute('href').replace('mailto:', '').split('?')[0].trim();
                }

                // Tel
                const telAnchor = header.querySelector('a[href^="tel:"]');
                if (telAnchor) {
                    res.tel = telAnchor.getAttribute('href').replace('tel:', '').split('?')[0].trim();
                }

                // Address in header
                const addrAnchor = header.querySelector('a[href*="maps.google.com"], a[href*="/explore/locations/"]');
                if (addrAnchor && addrAnchor.innerText) {
                    res.address = addrAnchor.innerText.trim();
                }

                // Action Buttons
                const allButtons = Array.from(header.querySelectorAll('button, div[role="button"], a[role="button"]'));
                const knownLabels = ['email', 'call', 'contact', 'message', 'whatsapp', 'directions', 'book', 'book now', 'view shop', 'order', 'reserve'];
                for (const b of allButtons) {
                    const txt = (b.innerText || '').trim();
                    if (txt && txt.length < 30 && !/follow|following|requested|edit profile/i.test(txt)) {
                        if (knownLabels.some(lbl => txt.toLowerCase().includes(lbl))) {
                            if (!res.buttons.includes(txt)) {
                                res.buttons.push(txt);
                            }
                        }
                    }
                }

                return res;
            }"""
        )

        if contact_dom:
            if contact_dom.get("mailto"):
                data["email"] = contact_dom["mailto"]
            if contact_dom.get("tel"):
                data["phone"] = contact_dom["tel"]
            if contact_dom.get("address"):
                data["address"] = contact_dom["address"]
            if contact_dom.get("buttons"):
                data["contactButtons"] = contact_dom["buttons"]
    except Exception as e:
        logger.debug(f"Contact DOM note: {e}")

    # 2. Extract from Bio Text
    if bio:
        if not data["email"]:
            data["email"] = _extract_email_from_text(bio)
        if not data["phone"]:
            data["phone"] = _extract_phone_from_text(bio)
        if not data["whatsApp"]:
            data["whatsApp"] = _extract_whatsapp_from_text_or_url(bio)

    # 3. Check External Links for WhatsApp, Booking links, and Website
    if external_links:
        for link_obj in external_links:
            url = link_obj.get("url", "")
            u_lower = url.lower()

            if not data["website"] and link_obj.get("type") in ["website", "portfolio", "store"]:
                data["website"] = url

            if not data["whatsApp"]:
                wa = _extract_whatsapp_from_text_or_url(url)
                if wa:
                    data["whatsApp"] = wa

            if not data["bookingLink"]:
                if any(b in u_lower for b in ["calendly.com", "cal.com", "tidycal.com", "acuityscheduling.com", "book"]):
                    data["bookingLink"] = url

    return data
