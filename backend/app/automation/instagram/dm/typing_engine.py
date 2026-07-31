import random
from playwright.async_api import Page
from app.automation.common.human_behavior import human_click
from app.automation.common.randomization import wait_random


async def type_message_human_like(page: Page, selector: str, text: str) -> None:
    """
    Types text into a selector with human-like behavior:
    - Random mouse hover (via human_click)
    - Character-by-character typing
    - Random typing speed
    - Occasional longer pauses
    """
    await human_click(page, selector)
    await wait_random(100, 400)

    for char in text:
        # We use insert_text for characters to handle emojis and complex unicode safely
        # keyboard.press has trouble with complex emojis, but
        # page.keyboard.insert_text works well
        await page.keyboard.insert_text(char)

        # Base typing speed
        await wait_random(30, 150)

        # Occasional longer pause (5% chance of a 0.5s - 1.5s pause to mimic
        # hesitation/reading)
        if random.random() < 0.05:
            await wait_random(500, 1500)

    await wait_random(300, 800)
