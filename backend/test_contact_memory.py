import asyncio
import uuid
import uuid
from app.database.session import AsyncSessionLocal
from app.models.campaign import Campaign
from app.models.lead import Lead
from app.models.queue import Queue
from app.models.template import MessageTemplate
from app.models.session import BrowserSession
from app.automation.memory.contact_memory import get_or_create_contact_history, update_contact_status
from app.automation.memory.pre_flight_checks import verify_pre_flight_checks
from app.schemas.contact_history import ConversationStatus

async def test_memory():
    async with AsyncSessionLocal() as db:
        # Create Dummy Data
        campaign_id = str(uuid.uuid4())
        lead_id = str(uuid.uuid4())
        queue_id = str(uuid.uuid4())
        sender_account = "test_sender"
        target_account = "test_target"

        template_id = str(uuid.uuid4())

        campaign = Campaign(id=campaign_id, name="Test Campaign", platform="instagram", status="ACTIVE")
        db.add(campaign)
        
        template = MessageTemplate(id=template_id, name="Test Temp", platform="instagram", category="test", template_body="hi")
        db.add(template)
        
        lead = Lead(id=lead_id, campaign_id=campaign_id, platform="instagram", username=target_account, source="test", qualification_status="test")
        db.add(lead)
        
        queue_item = Queue(id=queue_id, campaign_id=campaign_id, lead_id=lead_id, template_id=template_id, status="PENDING")
        db.add(queue_item)
        
        session = BrowserSession(account_name=sender_account, session_file="test.json", status="ACTIVE")
        db.add(session)
        
        await db.commit()

        print("Testing Initial Pre-Flight Check (Should be True)...")
        is_safe, reason = await verify_pre_flight_checks(
            db, queue_id, target_account, sender_account, campaign_id
        )
        print(f"Safe: {is_safe}, Reason: {reason}")
        assert is_safe == True

        print("Updating memory to 'Message Sent'...")
        history = await get_or_create_contact_history(db, target_account, sender_account, lead_id, campaign_id)
        await update_contact_status(db, history.id, ConversationStatus.MESSAGE_SENT, message_sent=True)

        print("Testing Second Pre-Flight Check (Should be False)...")
        is_safe, reason = await verify_pre_flight_checks(
            db, queue_id, target_account, sender_account, campaign_id
        )
        print(f"Safe: {is_safe}, Reason: {reason}")
        assert is_safe == False
        
        print("Success!")
        
if __name__ == "__main__":
    asyncio.run(test_memory())
