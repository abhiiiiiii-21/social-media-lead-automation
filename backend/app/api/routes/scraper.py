from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.log import ExecutionLog
from app.schemas.scraper import ScraperStartRequest, ScraperStatusResponse
from app.schemas.profile_inspector import ProfileInspectRequest, ProfileInspectResponse
from app.services.scraper_service import ScraperService
from app.services.profile_inspector_service import ProfileInspectorService
from app.automation.instagram.progress_tracker import get_job_stats

router = APIRouter(prefix="/scraper", tags=["scraper"])


@router.post(
    "/start",
    status_code=status.HTTP_202_ACCEPTED,
)
async def start_scraping(
    request: ScraperStartRequest,
    session: AsyncSession = Depends(get_db),
) -> dict:
    """
    Start a background scraping job for a campaign.
    """
    service = ScraperService(session)
    try:
        await service.start_scraping(
            campaign_id=request.campaign_id,
            account_name=request.account_name,
            search_mode=request.search_mode,
            source_query=request.source_query,
            max_profiles=request.max_profiles,
            max_scrolls=request.max_scrolls
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
        
    return {"message": "Scraping started"}


@router.post(
    "/stop/{campaign_id}",
    status_code=status.HTTP_200_OK,
)
async def stop_scraping(
    campaign_id: str,
    session: AsyncSession = Depends(get_db),
) -> dict:
    """
    Stop an active scraping job.
    """
    service = ScraperService(session)
    try:
        await service.stop_scraping(campaign_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
        
    return {"message": "Scraping stopped"}


@router.get(
    "/status/{campaign_id}",
    response_model=ScraperStatusResponse,
    status_code=status.HTTP_200_OK,
)
async def get_scraping_status(
    campaign_id: str,
) -> ScraperStatusResponse:
    """
    Get live progress stats for a campaign.
    """
    stats = get_job_stats(campaign_id)
    if stats is None:
        return ScraperStatusResponse(campaign_id=campaign_id, is_running=False, stats=None)
        
    is_running = stats.get("status") in ["INITIALIZING", "RUNNING"]
    return ScraperStatusResponse(
        campaign_id=campaign_id,
        is_running=is_running,
        stats=stats
    )


@router.get(
    "/logs/{campaign_id}",
    status_code=status.HTTP_200_OK,
)
async def get_scraping_logs(
    campaign_id: str,
    limit: int = 100,
    session: AsyncSession = Depends(get_db),
) -> List[dict]:
    """
    Get detailed logs for a campaign.
    """
    stmt = select(ExecutionLog).where(ExecutionLog.campaign_id == campaign_id).order_by(ExecutionLog.created_at.desc()).limit(limit)
    result = await session.execute(stmt)
    logs = result.scalars().all()
    
    return [
        {
            "id": log.id,
            "level": log.level,
            "message": log.message,
            "created_at": log.created_at
        }
        for log in logs
    ]


@router.post(
    "/inspect-profile",
    response_model=ProfileInspectResponse,
    status_code=status.HTTP_200_OK,
)
async def inspect_single_profile(
    request: ProfileInspectRequest,
    session: AsyncSession = Depends(get_db),
) -> ProfileInspectResponse:
    """
    Inspect a single public Instagram profile and extract all publicly available details.
    """
    service = ProfileInspectorService(session)
    return await service.inspect(request)

