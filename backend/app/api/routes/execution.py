from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.api.dependencies import get_db
from app.schemas.execution import ExecutionStateResponse, ExecutionStatusResponse, StartExecutionRequest
from app.automation.execution.execution_manager import execution_manager
from app.automation.execution.progress_tracker import get_execution_state
from app.models.execution import CampaignExecution
from app.models.log import ExecutionLog

router = APIRouter()


@router.post("/start/{campaign_id}", response_model=ExecutionStatusResponse)
async def start_campaign_execution(
    campaign_id: str,
    request: StartExecutionRequest,
    db: AsyncSession = Depends(get_db)
):
    await execution_manager.start_campaign(db, campaign_id, request.instagram_account)
    stmt = select(CampaignExecution).where(CampaignExecution.campaign_id == campaign_id)
    result = await db.execute(stmt)
    execution = result.scalars().first()
    return execution


@router.post("/pause/{campaign_id}", response_model=ExecutionStatusResponse)
async def pause_campaign_execution(
    campaign_id: str,
    db: AsyncSession = Depends(get_db)
):
    await execution_manager.pause_campaign(db, campaign_id)
    stmt = select(CampaignExecution).where(CampaignExecution.campaign_id == campaign_id)
    result = await db.execute(stmt)
    execution = result.scalars().first()
    return execution


@router.post("/resume/{campaign_id}", response_model=ExecutionStatusResponse)
async def resume_campaign_execution(
    campaign_id: str,
    request: StartExecutionRequest,
    db: AsyncSession = Depends(get_db)
):
    await execution_manager.resume_campaign(db, campaign_id, request.instagram_account)
    stmt = select(CampaignExecution).where(CampaignExecution.campaign_id == campaign_id)
    result = await db.execute(stmt)
    execution = result.scalars().first()
    return execution


@router.post("/stop/{campaign_id}", response_model=ExecutionStatusResponse)
async def stop_campaign_execution(
    campaign_id: str,
    db: AsyncSession = Depends(get_db)
):
    await execution_manager.stop_campaign(db, campaign_id)
    stmt = select(CampaignExecution).where(CampaignExecution.campaign_id == campaign_id)
    result = await db.execute(stmt)
    execution = result.scalars().first()
    return execution


@router.get("/status/{campaign_id}", response_model=ExecutionStatusResponse)
async def get_campaign_status(
    campaign_id: str,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(CampaignExecution).where(CampaignExecution.campaign_id == campaign_id)
    result = await db.execute(stmt)
    execution = result.scalars().first()
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    return execution


@router.get("/progress/{campaign_id}", response_model=ExecutionStateResponse)
async def get_campaign_progress(
    campaign_id: str,
    db: AsyncSession = Depends(get_db)
):
    state = await get_execution_state(db, campaign_id)
    return state


@router.get("/logs/{campaign_id}")
async def get_campaign_logs(
    campaign_id: str,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ExecutionLog).where(ExecutionLog.campaign_id == campaign_id).order_by(ExecutionLog.created_at.desc()).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()
