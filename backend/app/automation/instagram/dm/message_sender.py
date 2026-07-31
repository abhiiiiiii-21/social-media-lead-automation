import asyncio
from playwright.async_api import Page

from app.automation.instagram.dm import instagram_selectors as selectors
from app.automation.instagram.dm.typing_engine import type_message_human_like
from app.automation.instagram.dm.message_verifier import verify_message_delivered
from app.automation.common.human_behavior import human_click
from app.automation.instagram.dm.worker_result import WorkerResult, WorkerResultStatus


async def send_instagram_message(page: Page, message_text: str) -> WorkerResult:
    """
    Coordinates the process of typing the message, clicking send, and verifying delivery.
    """
    try:
        # 1. Type the message
        await type_message_human_like(page, selectors.MESSAGE_INPUT, message_text)

        # 2. Locate and click Send
        # The Send button only appears AFTER typing begins
        send_btn = page.locator(selectors.SEND_BUTTON).first
        if await send_btn.count() == 0:
            return WorkerResult(WorkerResultStatus.FAILED_BROWSER_ERROR,
                                "Send button did not appear after typing.")

        await human_click(page, selectors.SEND_BUTTON)

        # 3. Verify Delivery
        # We will attempt verification up to 3 times to account for slow networks
        is_delivered = False
        for attempt in range(3):
            is_delivered = await verify_message_delivered(page, message_text)
            if is_delivered:
                break
            await asyncio.sleep(2.0)

        if not is_delivered:
            return WorkerResult(WorkerResultStatus.FAILED_UNKNOWN,
                                "Message sent but verification failed. Bubble not found.")

        return WorkerResult(WorkerResultStatus.SUCCESS)

    except Exception as e:
        return WorkerResult(WorkerResultStatus.FAILED_BROWSER_ERROR, str(e))
