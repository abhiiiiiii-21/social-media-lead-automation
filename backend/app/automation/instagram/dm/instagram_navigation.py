from playwright.async_api import Page, TimeoutError

from app.automation.instagram.dm import instagram_selectors as selectors
from app.automation.instagram.dm.worker_result import WorkerResult, WorkerResultStatus


async def navigate_to_profile(page: Page, username: str) -> WorkerResult:
    """
    Navigates directly to the Instagram profile URL.
    Returns SUCCESS or FAILED_USER_NOT_FOUND.
    """
    url = f"https://www.instagram.com/{username}/"

    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=30000)

        # Wait for either the profile to load (Message button) or user not found
        try:
            await page.wait_for_selector(
                f"{selectors.MESSAGE_BUTTON}, {selectors.USER_NOT_FOUND_TEXT}",
                timeout=15000
            )
        except TimeoutError:
            return WorkerResult(WorkerResultStatus.FAILED_TIMEOUT,
                                "Timeout waiting for profile to load.")

        # Check if user not found
        if await page.locator(selectors.USER_NOT_FOUND_TEXT).count() > 0:
            return WorkerResult(WorkerResultStatus.FAILED_USER_NOT_FOUND,
                                "User not found or deleted.")

        return WorkerResult(WorkerResultStatus.SUCCESS)

    except Exception as e:
        return WorkerResult(WorkerResultStatus.FAILED_BROWSER_ERROR, str(e))


async def open_message_window(page: Page) -> WorkerResult:
    """
    Clicks the 'Message' button on the profile.
    Checks if the account is private and cannot be messaged.
    """
    try:
        # Before clicking, check if private account text is visible
        if await page.locator(selectors.PRIVATE_ACCOUNT_TEXT).count() > 0:
            # Note: Even private accounts might have a message button if we follow them,
            # but if they don't have a message button, we definitely can't message them.
            if await page.locator(selectors.MESSAGE_BUTTON).count() == 0:
                return WorkerResult(WorkerResultStatus.FAILED_PRIVATE_ACCOUNT,
                                    "Account is private and no Message button exists.")

        message_btn = page.locator(selectors.MESSAGE_BUTTON).first
        if await message_btn.count() == 0:
            return WorkerResult(WorkerResultStatus.FAILED_CANNOT_MESSAGE,
                                "No Message button found on profile.")

        await message_btn.click()

        # Wait for the message input box to appear
        try:
            await page.wait_for_selector(selectors.MESSAGE_INPUT, timeout=15000)
        except TimeoutError:
            # Check if there is a warning instead
            if await page.locator(selectors.CANNOT_MESSAGE_TEXT).count() > 0:
                return WorkerResult(WorkerResultStatus.FAILED_CANNOT_MESSAGE,
                                    "Instagram says we cannot message this account.")
            if await page.locator(selectors.RESTRICTED_TEXT).count() > 0:
                return WorkerResult(WorkerResultStatus.FAILED_CANNOT_MESSAGE,
                                    "Not everyone can message this account.")

            return WorkerResult(WorkerResultStatus.FAILED_TIMEOUT,
                                "Timeout waiting for DM input box.")

        return WorkerResult(WorkerResultStatus.SUCCESS)

    except Exception as e:
        return WorkerResult(WorkerResultStatus.FAILED_BROWSER_ERROR, str(e))
