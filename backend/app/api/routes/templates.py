from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.schemas.common import PaginatedResponse
from app.schemas.template import (
    MessageTemplateCreate,
    MessageTemplateResponse,
    MessageTemplateUpdate,
)
from app.services.template import TemplateService

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[MessageTemplateResponse])
async def get_templates(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    platform: Optional[str] = None,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    items, total = await TemplateService.get_templates(
        db, skip=skip, limit=limit, platform=platform, category=category
    )
    return PaginatedResponse(
        items=items,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=(total + limit - 1) // limit,
    )


@router.get("/{template_id}", response_model=MessageTemplateResponse)
async def get_template(template_id: str, db: AsyncSession = Depends(get_db)):
    return await TemplateService.get_template(db, template_id)


@router.post(
    "/", response_model=MessageTemplateResponse, status_code=status.HTTP_201_CREATED
)
async def create_template(
    template_in: MessageTemplateCreate, db: AsyncSession = Depends(get_db)
):
    return await TemplateService.create_template(db, template_in)


@router.patch("/{template_id}", response_model=MessageTemplateResponse)
async def update_template(
    template_id: str,
    template_in: MessageTemplateUpdate,
    db: AsyncSession = Depends(get_db),
):
    return await TemplateService.update_template(db, template_id, template_in)


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(template_id: str, db: AsyncSession = Depends(get_db)):
    await TemplateService.delete_template(db, template_id)
