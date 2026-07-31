from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.campaign import Campaign
from app.models.lead import Lead
from app.models.queue import Queue
from app.schemas.dashboard import DashboardOverviewResponse


class DashboardService:
    @staticmethod
    async def get_overview(db: AsyncSession) -> DashboardOverviewResponse:
        total_campaigns = await db.scalar(select(func.count(Campaign.id))) or 0
        active_campaigns = (
            await db.scalar(
                select(func.count(Campaign.id)).where(Campaign.status == "running")
            )
            or 0
        )
        completed_campaigns = (
            await db.scalar(
                select(func.count(Campaign.id)).where(Campaign.status == "completed")
            )
            or 0
        )
        total_leads = await db.scalar(select(func.count(Lead.id))) or 0
        queue_size = await db.scalar(select(func.count(Queue.id))) or 0

        return DashboardOverviewResponse(
            total_campaigns=total_campaigns,
            active_campaigns=active_campaigns,
            completed_campaigns=completed_campaigns,
            total_leads=total_leads,
            queue_size=queue_size,
        )
