from typing import Optional, Sequence, Tuple

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BaseAppException
from app.models.campaign import Campaign
from app.schemas.campaign import CampaignCreate, CampaignUpdate


class CampaignService:
    @staticmethod
    async def get_campaigns(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None,
    ) -> Tuple[Sequence[Campaign], int]:
        query = select(Campaign)
        if status:
            query = query.where(Campaign.status == status)

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = await db.scalar(count_query) or 0

        # Get paginated results
        query = query.order_by(desc(Campaign.created_at)).offset(skip).limit(limit)
        result = await db.execute(query)
        items = result.scalars().all()

        return items, total

    @staticmethod
    async def get_campaign(db: AsyncSession, campaign_id: str) -> Campaign:
        result = await db.execute(select(Campaign).where(Campaign.id == campaign_id))
        campaign = result.scalar_one_or_none()
        if not campaign:
            raise BaseAppException(message="Campaign not found", status_code=404)
        return campaign

    @staticmethod
    async def create_campaign(
        db: AsyncSession, campaign_in: CampaignCreate
    ) -> Campaign:
        campaign = Campaign(**campaign_in.model_dump())
        db.add(campaign)
        await db.commit()
        await db.refresh(campaign)
        return campaign

    @staticmethod
    async def update_campaign(
        db: AsyncSession, campaign_id: str, campaign_in: CampaignUpdate
    ) -> Campaign:
        campaign = await CampaignService.get_campaign(db, campaign_id)

        update_data = campaign_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(campaign, field, value)

        await db.commit()
        await db.refresh(campaign)
        return campaign

    @staticmethod
    async def delete_campaign(db: AsyncSession, campaign_id: str) -> None:
        campaign = await CampaignService.get_campaign(db, campaign_id)
        await db.delete(campaign)
        await db.commit()
