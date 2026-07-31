import asyncio
from playwright.async_api import Page

from app.automation.instagram.dm import instagram_selectors as selectors
from app.automation.instagram.dm.worker_result import WorkerResult, WorkerResultStatus


async def detect_conversation_status(page: Page) -> WorkerResult:
    """
    Scans the open DM window to detect if it's safe to send a message.
    Checks for:
    - Pre-existing messages (Already Contacted)
    - Messaging restrictions
    """

    try:
        # Give DOM a moment to settle
        await asyncio.sleep(2.0)

        # 1. Check for Instagram Restrictions
        if await page.locator(selectors.CANNOT_MESSAGE_TEXT).count() > 0:
            return WorkerResult(WorkerResultStatus.FAILED_CANNOT_MESSAGE,
                                "Instagram says we cannot message this account.")

        if await page.locator(selectors.RESTRICTED_TEXT).count() > 0:
            return WorkerResult(WorkerResultStatus.FAILED_CANNOT_MESSAGE,
                                "Not everyone can message this account.")

        # 2. Check for existing messages
        # If there are message bubbles, it means a conversation exists.
        # We only want to send initial outreach in this phase.
        bubbles = page.locator(selectors.BUBBLE_MESSAGE_TEXT)
        if await bubbles.count() > 0:
            return WorkerResult(WorkerResultStatus.SKIPPED_ALREADY_CONTACTED,
                                "Existing messages found in DM thread.")

        # 3. Ensure input box actually exists
        if await page.locator(selectors.MESSAGE_INPUT).count() == 0:
            return WorkerResult(WorkerResultStatus.FAILED_CANNOT_MESSAGE,
                                "Message input box is missing.")

        return WorkerResult(WorkerResultStatus.SUCCESS)

    except Exception as e:
        return WorkerResult(WorkerResultStatus.FAILED_BROWSER_ERROR, str(e))
