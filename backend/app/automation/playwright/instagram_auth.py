import asyncio
from typing import Tuple

from playwright.async_api import Error as PlaywrightError

from app.automation.playwright.browser_manager import BrowserManager
from app.automation.playwright.constants import (
    INSTAGRAM_LOGIN_URL,
    LOGIN_TIMEOUT_MS,
    SESSION_STATUS_CHECKPOINT,
    SESSION_STATUS_VALID,
)
from app.automation.playwright.selectors import (
    LOGGED_IN_INDICATORS,
    LOGIN_ERROR_BANNER,
    LOGIN_PASSWORD_INPUT,
    LOGIN_SUBMIT_BUTTON,
    LOGIN_USERNAME_INPUT,
    SAVE_INFO_MODAL_BUTTON_NOT_NOW,
)
from app.automation.playwright.session_manager import SessionManager


async def perform_login(
    browser_manager: BrowserManager,
    session_manager: SessionManager,
    username: str,
    password: str,
) -> Tuple[bool, str]:
    """
    Attempts to login to Instagram.
    Returns (success_boolean, status_message)
    """
    try:
        context = await browser_manager.create_context()
        page = await browser_manager.get_page(context)

        # Navigate to login
        await page.goto(INSTAGRAM_LOGIN_URL, wait_until="networkidle")

        # Accept cookies if the popup appears (EU specific, but good to handle broadly if needed)
        # We'll skip for now unless specifically required, as Instagram USA usually doesn't block.

        # Wait for form
        await page.wait_for_selector(
            LOGIN_USERNAME_INPUT, state="visible", timeout=LOGIN_TIMEOUT_MS
        )

        # Fill credentials
        await page.fill(LOGIN_USERNAME_INPUT, username)
        await page.fill(LOGIN_PASSWORD_INPUT, password)

        # Submit
        await page.click(LOGIN_SUBMIT_BUTTON)

        # Wait for either a successful login indicator, or an error banner, or a checkpoint
        success = False
        message = "Unknown error"

        # We'll wait for the network to idle, or for a specific selector
        # Instead of a single wait, we can wait for multiple possible outcomes
        async def check_success() -> bool:
            for indicator in LOGGED_IN_INDICATORS:
                if await page.locator(indicator).count() > 0:
                    return True
            return False

        async def check_error() -> bool:
            return await page.locator(LOGIN_ERROR_BANNER).count() > 0

        # Loop check for up to timeout
        start_time = asyncio.get_event_loop().time()
        while (asyncio.get_event_loop().time() - start_time) * 1000 < LOGIN_TIMEOUT_MS:
            if await check_success():
                success = True
                message = SESSION_STATUS_VALID
                break

            if await check_error():
                success = False
                message = "Invalid credentials"
                break

            if "challenge" in page.url:
                success = False
                message = SESSION_STATUS_CHECKPOINT
                break

            await asyncio.sleep(1)

        if success:
            # Handle "Save Your Login Info?" modal
            if await page.locator(SAVE_INFO_MODAL_BUTTON_NOT_NOW).count() > 0:
                await page.click(SAVE_INFO_MODAL_BUTTON_NOT_NOW)

            # Save state
            session_path = session_manager.get_session_path(username)
            await context.storage_state(path=session_path)
            await session_manager.create_or_update_session(
                username, SESSION_STATUS_VALID
            )

        else:
            if message == "Unknown error":
                message = "Login timed out or stuck on unknown screen"

        return success, message

    except PlaywrightError as e:
        return False, f"Browser error: {str(e)}"
    except Exception as e:
        return False, f"Unexpected error: {str(e)}"
