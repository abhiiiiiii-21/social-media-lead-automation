import asyncio
from playwright.async_api import Page
from app.automation.instagram.dm import instagram_selectors as selectors


async def verify_message_delivered(page: Page, expected_text: str) -> bool:
    """
    Verifies that the message was actually sent by checking the DOM for the newly created message bubble.
    Never assumes success.
    """
    try:
        # Wait for the send action to process and DOM to update
        await asyncio.sleep(2.0)

        # Locate all message bubbles in the thread
        bubbles = page.locator(selectors.BUBBLE_MESSAGE_TEXT)
        count = await bubbles.count()

        if count == 0:
            return False

        # Get the text of the very last message bubble
        last_bubble = bubbles.nth(count - 1)

        # Sometimes Instagram puts a tiny span inside or formats it.
        # Using inner_text() usually extracts the clean text.
        actual_text = await last_bubble.inner_text()

        # Compare (ignoring trailing whitespace just in case)
        if actual_text.strip() == expected_text.strip():
            return True

        # If it doesn't match perfectly, check if the expected text is AT LEAST inside the last bubble
        # (in case Instagram appends a timestamp or seen receipt in the same div structure)
        if expected_text.strip() in actual_text:
            return True

        return False

    except Exception:
        return False
