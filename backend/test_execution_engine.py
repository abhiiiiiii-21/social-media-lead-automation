import asyncio
import uuid
from sqlalchemy import select
from app.database.session import AsyncSessionLocal
from app.models.campaign import Campaign
from app.models.lead import Lead
from app.models.queue import Queue
from app.models.template import MessageTemplate
from app.models.session import BrowserSession
from app.models.execution import CampaignExecution, ExecutionState
from app.schemas.execution import CampaignStatus
from app.automation.execution.execution_manager import execution_manager
from app.automation.memory.contact_memory import update_contact_status, get_or_create_contact_history
from app.schemas.contact_history import ConversationStatus

async def test_execution_engine():
    campaign_id = str(uuid.uuid4())
    instagram_account = "test_engine_account"
    
    async with AsyncSessionLocal() as db:
        # Create campaign
        campaign = Campaign(id=campaign_id, name="Engine Test Campaign", platform="instagram", status="ACTIVE")
        db.add(campaign)
        
        # Create valid session
        session = BrowserSession(account_name=instagram_account, session_file="test.json", status="ACTIVE")
        db.add(session)
        
        # Create template
        template = MessageTemplate(name="Test Temp", platform="instagram", category="test", template_body="hi")
        db.add(template)
        await db.commit()
        await db.refresh(template)
        
        # Create 3 leads and queue items
        for i in range(3):
            lead = Lead(campaign_id=campaign_id, platform="instagram", username=f"test_lead_{i}", source="test", qualification_status="test")
            db.add(lead)
            await db.commit()
            await db.refresh(lead)
            
            queue_item = Queue(campaign_id=campaign_id, lead_id=lead.id, template_id=template.id, status="PENDING")
            db.add(queue_item)
            
            # Make the first one already contacted
            if i == 0:
                history = await get_or_create_contact_history(db, lead.username, instagram_account, lead.id, campaign_id)
                await update_contact_status(db, history.id, ConversationStatus.MESSAGE_SENT, message_sent=True)
                
        await db.commit()
        
    print("Starting campaign execution...")
    # Start Execution
    async with AsyncSessionLocal() as db:
        await execution_manager.start_campaign(db, campaign_id, instagram_account)
        
    # Wait for the mock workers to finish (2 items * 2 seconds = 4s + buffer)
    print("Waiting for execution loop to complete (approx 5 seconds)...")
    await asyncio.sleep(5.0)
    
    async with AsyncSessionLocal() as db:
        stmt = select(CampaignExecution).where(CampaignExecution.campaign_id == campaign_id)
        execution = (await db.execute(stmt)).scalars().first()
        print(f"Final Campaign Status: {execution.status}")
        assert execution.status == CampaignStatus.COMPLETED.value
        
        stmt = select(ExecutionState).where(ExecutionState.campaign_id == campaign_id)
        state = (await db.execute(stmt)).scalars().first()
        print(f"Final State Metrics: Processed={state.processed_leads}, Skipped={state.skipped_leads}")
        assert state.processed_leads == 2 # 2 items processed successfully
        assert state.skipped_leads == 1   # 1 item skipped due to memory block
        
        print("Success! Engine is orchestration-ready.")

if __name__ == "__main__":
    asyncio.run(test_execution_engine())
