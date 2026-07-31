from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.ai.discovery.schemas import DiscoveryRequest, DiscoveryResponse
from app.ai.discovery.discovery_service import process_discovery_prompt

router = APIRouter()


@router.post("/discovery",
             response_model=DiscoveryResponse,
             status_code=status.HTTP_200_OK)
async def analyze_discovery_prompt(
    request: DiscoveryRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Translates a natural language prompt into structured search filters using AI.
    """
    try:
        response = await process_discovery_prompt(request, db)
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during discovery: {str(e)}"
        )
