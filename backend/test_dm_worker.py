import asyncio
import logging
from playwright.async_api import async_playwright
from app.automation.instagram.dm.instagram_navigation import navigate_to_profile, open_message_window
from app.automation.instagram.dm.conversation_detector import detect_conversation_status

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_smoke_test(username_to_test: str):
    """
    Runs a smoke test of the Playwright DM Worker modules against a test account.
    WARNING: You must already be logged into Instagram in your default browser context, 
    or you must provide a valid storage state JSON.
    """
    logger.info(f"Starting smoke test for target: {username_to_test}")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()
        
        # 1. Navigation
        logger.info("1. Navigating to profile...")
        nav_result = await navigate_to_profile(page, username_to_test)
        logger.info(f"Nav result: {nav_result.status} - {nav_result.message}")
        if nav_result.status != "SUCCESS":
            return
            
        await asyncio.sleep(2)
            
        # 2. Open Message Window
        logger.info("2. Opening message window...")
        msg_result = await open_message_window(page)
        logger.info(f"Msg result: {msg_result.status} - {msg_result.message}")
        if msg_result.status != "SUCCESS":
            return
            
        await asyncio.sleep(2)
            
        # 3. Detect Conversation Status
        logger.info("3. Detecting conversation status...")
        detect_result = await detect_conversation_status(page)
        logger.info(f"Detect result: {detect_result.status} - {detect_result.message}")
        
        # We stop here for the smoke test to avoid actually sending a test message to someone.
        logger.info("Smoke test completed successfully up to sending phase.")
        
        await browser.close()

if __name__ == "__main__":
    # Replace with a real test account username
    asyncio.run(run_smoke_test("instagram"))
