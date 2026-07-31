from playwright.async_api import Page
from app.automation.common.randomization import wait_random, wait_action_spacing

async def human_type(page: Page, selector: str, text: str) -> None:
    """
    Types text into a selector with randomized delays between keystrokes to mimic human typing.
    """
    await page.click(selector)
    await wait_random(100, 300)
    for char in text:
        await page.keyboard.press(char)
        await wait_random(50, 200)
    await wait_action_spacing(300, 800)

async def human_click(page: Page, selector: str) -> None:
    """
    Simulates hovering before clicking, adding a slight randomized delay.
    """
    await page.hover(selector)
    await wait_random(200, 600)
    await page.click(selector)
    await wait_action_spacing()
