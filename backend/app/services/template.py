from typing import Optional, Sequence, Tuple

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BaseAppException
from app.models.template import MessageTemplate
from app.schemas.template import MessageTemplateCreate, MessageTemplateUpdate


class TemplateService:
    @staticmethod
    async def get_templates(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        platform: Optional[str] = None,
        category: Optional[str] = None,
    ) -> Tuple[Sequence[MessageTemplate], int]:
        query = select(MessageTemplate)
        if platform:
            query = query.where(MessageTemplate.platform == platform)
        if category:
            query = query.where(MessageTemplate.category == category)

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = await db.scalar(count_query) or 0

        # Get paginated results
        query = (
            query.order_by(desc(MessageTemplate.created_at)).offset(skip).limit(limit)
        )
        result = await db.execute(query)
        items = result.scalars().all()

        return items, total

    @staticmethod
    async def get_template(db: AsyncSession, template_id: str) -> MessageTemplate:
        result = await db.execute(
            select(MessageTemplate).where(MessageTemplate.id == template_id)
        )
        template = result.scalar_one_or_none()
        if not template:
            raise BaseAppException(message="Template not found", status_code=404)
        return template

    @staticmethod
    async def create_template(
        db: AsyncSession, template_in: MessageTemplateCreate
    ) -> MessageTemplate:
        template = MessageTemplate(**template_in.model_dump())
        db.add(template)
        await db.commit()
        await db.refresh(template)
        return template

    @staticmethod
    async def update_template(
        db: AsyncSession, template_id: str, template_in: MessageTemplateUpdate
    ) -> MessageTemplate:
        template = await TemplateService.get_template(db, template_id)

        update_data = template_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(template, field, value)

        await db.commit()
        await db.refresh(template)
        return template

    @staticmethod
    async def delete_template(db: AsyncSession, template_id: str) -> None:
        template = await TemplateService.get_template(db, template_id)
        await db.delete(template)
        await db.commit()
