from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.schemas.campaign import CampaignCreate, CampaignResponse, CampaignUpdate
from app.schemas.common import PaginatedResponse
from app.services.campaign import CampaignService

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[CampaignResponse])
async def get_campaigns(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    items, total = await CampaignService.get_campaigns(
        db, skip=skip, limit=limit, status=status
    )
    return PaginatedResponse(
        items=items,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=(total + limit - 1) // limit,
    )


@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(campaign_id: str, db: AsyncSession = Depends(get_db)):
    return await CampaignService.get_campaign(db, campaign_id)


@router.post("/", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    campaign_in: CampaignCreate, db: AsyncSession = Depends(get_db)
):
    return await CampaignService.create_campaign(db, campaign_in)


@router.patch("/{campaign_id}", response_model=CampaignResponse)
async def update_campaign(
    campaign_id: str, campaign_in: CampaignUpdate, db: AsyncSession = Depends(get_db)
):
    return await CampaignService.update_campaign(db, campaign_id, campaign_in)


@router.delete("/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_campaign(campaign_id: str, db: AsyncSession = Depends(get_db)):
    await CampaignService.delete_campaign(db, campaign_id)
