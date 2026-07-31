from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.queue import Queue
from app.automation.execution.execution_events import log_execution_event
from app.automation.memory.contact_memory import update_contact_status, get_or_create_contact_history
from app.schemas.contact_history import ConversationStatus
from playwright.async_api import BrowserContext
from app.automation.instagram.dm.dm_worker import run_dm_worker
from app.automation.instagram.dm.worker_result import WorkerResultStatus


async def dispatch_to_worker(
    db: AsyncSession,
    queue_item: Queue,
    campaign_id: str,
    instagram_account: str,
    context: BrowserContext
) -> bool:
    """
    Dispatches a valid queue item to the real Playwright DM worker.
    """
    await log_execution_event(db, campaign_id, "INFO", f"Dispatching queue item {queue_item.id} (Lead: {queue_item.lead.username}) to worker")

    # Update Queue Status to RUNNING
    queue_item.status = "RUNNING"
    queue_item.sent_time = datetime.utcnow()
    await db.commit()

    try:
        page = await context.new_page()
        
        # Execute the full worker pipeline
        result = await run_dm_worker(page, queue_item)
        
        await page.close()
        
        if result.status == WorkerResultStatus.SUCCESS:
            queue_item.status = "COMPLETED"
            await db.commit()
            
            history = await get_or_create_contact_history(db, queue_item.lead.username, instagram_account, queue_item.lead_id, campaign_id)
            await update_contact_status(
                db=db,
                history_id=history.id,
                status=ConversationStatus.MESSAGE_SENT,
                delivery_status="Delivered",
                template_id=queue_item.template_id,
                message_sent=True
            )
            await log_execution_event(db, campaign_id, "SUCCESS", f"Successfully processed lead {queue_item.lead.username}")
            return True
            
        elif result.status == WorkerResultStatus.SKIPPED_ALREADY_CONTACTED:
            queue_item.status = "SKIPPED"
            await db.commit()
            await log_execution_event(db, campaign_id, "WARNING", f"Lead {queue_item.lead.username} skipped: Already Contacted")
            return True
            
        else:
            # Handle failures
            queue_item.status = "FAILED"
            await db.commit()
            
            history = await get_or_create_contact_history(db, queue_item.lead.username, instagram_account, queue_item.lead_id, campaign_id)
            await update_contact_status(
                db=db,
                history_id=history.id,
                status=ConversationStatus.FAILED,
                failure_reason=f"{result.status}: {result.message}",
                message_sent=False
            )
            await log_execution_event(db, campaign_id, "ERROR", f"Worker failed for lead {queue_item.lead.username}: {result.message}")
            return False

    except Exception as e:
        queue_item.status = "FAILED"
        await db.commit()
        await log_execution_event(db, campaign_id, "ERROR", f"Dispatcher exception for lead {queue_item.lead.username}: {str(e)}")
        return False
