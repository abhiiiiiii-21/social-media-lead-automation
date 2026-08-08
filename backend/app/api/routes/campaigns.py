from typing import Optional
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.schemas.campaign import CampaignCreate, CampaignResponse, CampaignUpdate, LeadResponse
from app.schemas.common import PaginatedResponse
from app.services.campaign import CampaignService

router = APIRouter()


@router.get("", response_model=PaginatedResponse[CampaignResponse])
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
        page=skip // limit + 1 if limit > 0 else 1,
        size=limit,
        pages=(total + limit - 1) // limit if limit > 0 else 1,
    )


@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(campaign_id: str, db: AsyncSession = Depends(get_db)):
    return await CampaignService.get_campaign(db, campaign_id)


@router.post("", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
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


@router.get("/{campaign_id}/leads", response_model=PaginatedResponse[LeadResponse])
async def get_campaign_leads(
    campaign_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: Optional[str] = None,
    qualification_status: Optional[str] = None,
    sort_by: Optional[str] = Query("created_at"),
    sort_order: Optional[str] = Query("desc"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get paginated real leads belonging to this campaign from the database.
    """
    items, total = await CampaignService.get_campaign_leads(
        db=db,
        campaign_id=campaign_id,
        skip=skip,
        limit=limit,
        search=search,
        qualification_status=qualification_status,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return PaginatedResponse(
        items=items,
        total=total,
        page=skip // limit + 1 if limit > 0 else 1,
        size=limit,
        pages=(total + limit - 1) // limit if limit > 0 else 1,
    )


@router.get("/{campaign_id}/leads/export")
async def export_campaign_leads(
    campaign_id: str,
    format: str = Query("csv", regex="^(csv|json)$"),
    db: AsyncSession = Depends(get_db),
):
    """
    Export all stored leads for this campaign in CSV or JSON format.
    """
    content, media_type = await CampaignService.export_campaign_leads(
        db=db, campaign_id=campaign_id, export_format=format
    )
    filename = f"campaign_{campaign_id}_leads.{format}"
    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
