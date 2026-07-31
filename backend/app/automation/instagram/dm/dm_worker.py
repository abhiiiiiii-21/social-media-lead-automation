import logging
from playwright.async_api import Page
from app.models.queue import Queue
from app.automation.instagram.dm.worker_result import WorkerResult, WorkerResultStatus
from app.automation.instagram.dm.instagram_navigation import navigate_to_profile, open_message_window
from app.automation.instagram.dm.conversation_detector import detect_conversation_status
from app.automation.instagram.dm.template_engine import render_message_template
from app.automation.instagram.dm.message_sender import send_instagram_message

logger = logging.getLogger(__name__)


async def run_dm_worker(page: Page, queue_item: Queue) -> WorkerResult:
    """
    Orchestrates the entire DM sending process for a single Queue item.
    Assumes the page is already authenticated with a valid Instagram session.
    """
    lead = queue_item.lead
    template_body = queue_item.template.template_body

    logger.info(f"Worker Started for lead: {lead.username}")

    try:
        # 1. Navigate to Profile
        nav_result = await navigate_to_profile(page, lead.username)
        if nav_result.status != WorkerResultStatus.SUCCESS:
            logger.warning(
                f"Failed to load profile for {
                    lead.username}: {
                    nav_result.message}")
            return nav_result

        logger.info(f"Profile Opened for lead: {lead.username}")

        # 2. Open Message Window
        msg_result = await open_message_window(page)
        if msg_result.status != WorkerResultStatus.SUCCESS:
            logger.warning(
                f"Failed to open DM window for {
                    lead.username}: {
                    msg_result.message}")
            return msg_result

        logger.info(f"Conversation Opened for lead: {lead.username}")

        # 3. Detect Conversation Status
        detect_result = await detect_conversation_status(page)
        if detect_result.status != WorkerResultStatus.SUCCESS:
            logger.warning(
                f"Conversation not safe to proceed for {
                    lead.username}: {
                    detect_result.message}")
            return detect_result

        # 4. Load & Render Template
        rendered_message = render_message_template(template_body, lead)

        # 5. Type & Send Message
        logger.info(f"Typing Started for lead: {lead.username}")
        send_result = await send_instagram_message(page, rendered_message)

        if send_result.status == WorkerResultStatus.SUCCESS:
            logger.info(
                f"Worker Completed: Verification Passed for lead {
                    lead.username}")
        else:
            logger.error(f"Worker Failed: Verification Failed for lead {lead.username}")

        return send_result

    except Exception as e:
        logger.error(
            f"Worker Failed with unexpected error for {
                lead.username}: {
                str(e)}")
        return WorkerResult(WorkerResultStatus.FAILED_BROWSER_ERROR, str(e))
