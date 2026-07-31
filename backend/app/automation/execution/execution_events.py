import logging
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.log import ExecutionLog

logger = logging.getLogger(__name__)


async def log_execution_event(
    db: AsyncSession,
    campaign_id: str,
    level: str,
    message: str
) -> None:
    """
    Persistently logs campaign lifecycle and execution events to the database.
    Levels: INFO, WARNING, ERROR, SUCCESS
    """
    logger.info(f"[Campaign {campaign_id}] {level}: {message}")

    execution_log = ExecutionLog(
        campaign_id=campaign_id,
        level=level.upper(),
        message=message
    )
    db.add(execution_log)
    await db.commit()
