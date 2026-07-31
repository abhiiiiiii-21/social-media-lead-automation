from typing import Any, Dict
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.import_history import ImportHistory
from app.schemas.common import PaginatedResponse
from app.schemas.import_csv import (
    ImportExecuteRequest,
    ImportExecuteResponse,
    ImportHistoryResponse,
    ImportMappingRequest,
    ImportPreviewResponse,
    ImportUploadResponse,
    ImportValidateResponse,
)
from app.services.import_service import import_service

router = APIRouter(prefix="/import", tags=["import"])


@router.post(
    "/upload",
    response_model=ImportUploadResponse,
    status_code=status.HTTP_200_OK,
)
async def upload_csv(
    file: UploadFile = File(...),
) -> ImportUploadResponse:
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are supported"
        )
        
    try:
        content = await file.read()
        if not content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty file"
            )
            
        return await import_service.upload_csv(content, file.filename)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get(
    "/{upload_id}/preview",
    response_model=ImportPreviewResponse,
    status_code=status.HTTP_200_OK,
)
async def preview_csv(upload_id: str) -> ImportPreviewResponse:
    try:
        return await import_service.preview_csv(upload_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post(
    "/{upload_id}/mapping",
    response_model=Dict[str, Any],
    status_code=status.HTTP_200_OK,
)
async def map_columns(
    upload_id: str,
    request: ImportMappingRequest,
) -> Dict[str, Any]:
    # In a full UI, you might just save this mapping state in a cache or return success.
    # We will just return it back to signify it is accepted.
    return {"message": "Mapping accepted", "mapping": request.mapping}


@router.post(
    "/{upload_id}/validate",
    response_model=ImportValidateResponse,
    status_code=status.HTTP_200_OK,
)
async def validate_csv(
    upload_id: str,
    request: ImportMappingRequest,
    session: AsyncSession = Depends(get_db),
) -> ImportValidateResponse:
    try:
        return await import_service.validate_csv(upload_id, request.mapping, session)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post(
    "/{upload_id}/execute",
    response_model=ImportExecuteResponse,
    status_code=status.HTTP_200_OK,
)
async def execute_import(
    upload_id: str,
    request: ImportExecuteRequest,
    session: AsyncSession = Depends(get_db),
) -> ImportExecuteResponse:
    try:
        return await import_service.execute_import(upload_id, request, session)
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


@router.get(
    "/history",
    response_model=PaginatedResponse[ImportHistoryResponse],
    status_code=status.HTTP_200_OK,
)
async def get_import_history(
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_db),
) -> PaginatedResponse[ImportHistoryResponse]:
    stmt = select(ImportHistory).order_by(ImportHistory.created_at.desc()).offset(skip).limit(limit)
    result = await session.execute(stmt)
    items = result.scalars().all()
    
    # We can add total count in a real app, but for now we'll just mock total
    return PaginatedResponse(
        items=list(items),
        total=len(items) + skip, # Mock total for simplicity
        page=(skip // limit) + 1 if limit > 0 else 1,
        size=limit,
        pages=1
    )
