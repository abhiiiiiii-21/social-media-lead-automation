import os
from typing import Tuple

from playwright.async_api import Error as PlaywrightError

from app.automation.playwright.browser_manager import BrowserManager
from app.automation.playwright.constants import (
    INSTAGRAM_BASE_URL,
    NAVIGATION_TIMEOUT_MS,
    SESSION_STATUS_ERROR,
    SESSION_STATUS_EXPIRED,
    SESSION_STATUS_INVALID,
    SESSION_STATUS_VALID,
)
from app.automation.playwright.selectors import (
    LOGGED_IN_INDICATORS,
    LOGGED_OUT_INDICATORS,
)
from app.automation.playwright.session_manager import SessionManager


async def validate_session(
    browser_manager: BrowserManager, session_manager: SessionManager, account_name: str
) -> Tuple[bool, str]:
    """
    Validates if an existing session is still authenticated.
    Returns (is_valid, status_string)
    """
    session_path = session_manager.get_session_path(account_name)

    if not os.path.exists(session_path):
        await session_manager.mark_session_status(account_name, SESSION_STATUS_INVALID)
        return False, SESSION_STATUS_INVALID

    try:
        # Create context with storage state
        context = await browser_manager.create_context(storage_state_path=session_path)
        page = await browser_manager.get_page(context)

        # Navigate to homepage
        await page.goto(
            INSTAGRAM_BASE_URL, wait_until="networkidle", timeout=NAVIGATION_TIMEOUT_MS
        )

        is_valid = False
        status = SESSION_STATUS_EXPIRED

        # Check indicators
        for indicator in LOGGED_IN_INDICATORS:
            if await page.locator(indicator).count() > 0:
                is_valid = True
                status = SESSION_STATUS_VALID
                break

        if not is_valid:
            for indicator in LOGGED_OUT_INDICATORS:
                if await page.locator(indicator).count() > 0:
                    status = SESSION_STATUS_EXPIRED
                    break

        # Update db
        await session_manager.mark_session_status(account_name, status)

        return is_valid, status

    except PlaywrightError as e:
        await session_manager.mark_session_status(account_name, SESSION_STATUS_ERROR)
        return False, f"Browser error: {str(e)}"
    except Exception as e:
        await session_manager.mark_session_status(account_name, SESSION_STATUS_ERROR)
        return False, f"Unexpected error: {str(e)}"
