from sqlalchemy import select

from app.database.session import AsyncSessionLocal
from app.models.execution import CampaignExecution
from app.schemas.execution import CampaignStatus
from app.automation.execution.queue_scheduler import get_next_valid_queue_item
from app.automation.execution.worker_dispatcher import dispatch_to_worker
from app.automation.execution.status_manager import transition_campaign_status
from app.automation.execution.campaign_state import update_execution_state
from app.automation.execution.progress_tracker import update_progress_metrics
from app.automation.execution.execution_events import log_execution_event
from app.automation.playwright.browser_manager import BrowserManager
from app.automation.playwright.session_manager import SessionManager


async def run_campaign(campaign_id: str, instagram_account: str):
    """
    The main execution loop for a campaign.
    Designed to run as a background task.
    """
    async with AsyncSessionLocal() as db:
        await transition_campaign_status(db, campaign_id, CampaignStatus.RUNNING)
        await log_execution_event(db, campaign_id, "INFO", "Campaign execution loop started")

        session_manager = SessionManager(db)
        session_file = session_manager.get_session_path(instagram_account)

        async with BrowserManager() as browser_manager:
            # We explicitly create a single context for this entire campaign loop run
            try:
                context = await browser_manager.create_context(storage_state_path=session_file)
            except Exception as e:
                await log_execution_event(db, campaign_id, "ERROR", f"Failed to load session for {instagram_account}: {e}")
                await transition_campaign_status(db, campaign_id, CampaignStatus.FAILED, error="Session expired or invalid")
                return

            while True:
                # 1. Check if campaign is still RUNNING
                stmt = select(CampaignExecution).where(
                    CampaignExecution.campaign_id == campaign_id)
                result = await db.execute(stmt)
                execution = result.scalars().first()

                if not execution or execution.status != CampaignStatus.RUNNING.value:
                    await log_execution_event(db, campaign_id, "INFO", f"Campaign loop exiting. Status changed to {execution.status if execution else 'Unknown'}")
                    break

                # 2. Update Progress
                await update_progress_metrics(db, campaign_id)

                # 3. Get next valid queue item
                queue_item = await get_next_valid_queue_item(db, campaign_id, instagram_account)

                if not queue_item:
                    # No more pending valid items. Are there running items?
                    # For now, just mark completed.
                    await transition_campaign_status(db, campaign_id, CampaignStatus.COMPLETED)
                    await update_progress_metrics(db, campaign_id)
                    await log_execution_event(db, campaign_id, "SUCCESS", "Campaign completed all pending items.")
                    break

                # 4. Update State to reflect active lead
                await update_execution_state(
                    db=db,
                    campaign_id=campaign_id,
                    current_lead_id=queue_item.lead_id,
                    current_session=instagram_account
                )

                # 5. Dispatch to worker
                success = await dispatch_to_worker(db, queue_item, campaign_id, instagram_account, context)

                if success:
                    # Update checkpoint
                    await update_execution_state(db, campaign_id, record_checkpoint=True)

                # Loop will continue to next item
