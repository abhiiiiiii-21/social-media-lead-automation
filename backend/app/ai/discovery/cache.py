import re
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.ai_discovery import AIDiscovery


def normalize_prompt(prompt: str) -> str:
    """
    Normalizes the prompt by lowercasing, stripping whitespace,
    collapsing multiple spaces, and removing trailing punctuation.
    """
    text = prompt.lower().strip()
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[.,;!]+$', '', text)
    return text


async def get_cached_discovery(normalized_prompt: str,
                               session: AsyncSession) -> Optional[AIDiscovery]:
    """
    Looks up previously parsed AI discoveries using the normalized prompt.
    """
    stmt = select(AIDiscovery).where(
        AIDiscovery.normalized_prompt == normalized_prompt,
        AIDiscovery.status == "SUCCESS"
    ).order_by(AIDiscovery.created_at.desc()).limit(1)

    result = await session.execute(stmt)
    return result.scalar_one_or_none()
