from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.session import BrowserSession
from app.schemas.account import (
    AccountLoginRequest,
    AccountSessionResponse,
    AccountValidationResponse,
)
from app.automation.playwright.browser_manager import BrowserManager
from app.automation.playwright.session_manager import SessionManager
from app.automation.playwright.instagram_auth import perform_login
from app.automation.playwright.health_check import validate_session

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.post(
    "/login",
    response_model=AccountSessionResponse,
    status_code=status.HTTP_200_OK,
)
async def login_account(
    request: AccountLoginRequest,
    session: AsyncSession = Depends(get_db),
) -> AccountSessionResponse:
    """
    Automates a login to Instagram.
    Creates or updates the BrowserSession.
    """
    browser_manager = BrowserManager()
    session_manager = SessionManager(session)
    
    # Run automation
    try:
        success, message = await perform_login(
            browser_manager,
            session_manager,
            request.username,
            request.password
        )
    finally:
        await browser_manager.close()
        
    if not success:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=message
        )
        
    db_session = await session_manager.get_session(request.username)
    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve saved session"
        )
        
    return db_session


@router.get(
    "",
    response_model=List[AccountSessionResponse],
    status_code=status.HTTP_200_OK,
)
async def get_accounts(
    session: AsyncSession = Depends(get_db),
) -> List[AccountSessionResponse]:
    """
    Get all registered Instagram accounts / sessions.
    """
    stmt = select(BrowserSession).order_by(BrowserSession.created_at.desc())
    result = await session.execute(stmt)
    return list(result.scalars().all())


@router.get(
    "/{account_name}",
    response_model=AccountSessionResponse,
    status_code=status.HTTP_200_OK,
)
async def get_account(
    account_name: str,
    session: AsyncSession = Depends(get_db),
) -> AccountSessionResponse:
    """
    Get a specific account by username.
    """
    stmt = select(BrowserSession).where(BrowserSession.account_name == account_name)
    result = await session.execute(stmt)
    account = result.scalars().first()
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    return account


@router.post(
    "/{account_name}/validate",
    response_model=AccountValidationResponse,
    status_code=status.HTTP_200_OK,
)
async def validate_account(
    account_name: str,
    session: AsyncSession = Depends(get_db),
) -> AccountValidationResponse:
    """
    Check if the existing session state is still fully authenticated on Instagram.
    """
    browser_manager = BrowserManager()
    session_manager = SessionManager(session)
    
    # Check if we even have a DB record
    if not await session_manager.get_session(account_name):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    
    try:
        is_valid, status_msg = await validate_session(
            browser_manager,
            session_manager,
            account_name
        )
    finally:
        await browser_manager.close()
        
    return AccountValidationResponse(
        account_name=account_name,
        is_valid=is_valid,
        status=status_msg
    )


@router.delete(
    "/{account_name}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_account(
    account_name: str,
    session: AsyncSession = Depends(get_db),
) -> None:
    """
    Deletes the session state file and removes the DB record.
    """
    session_manager = SessionManager(session)
    deleted = await session_manager.delete_session(account_name)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
        
    return None

@router.post(
    "/{account_name}/logout",
    status_code=status.HTTP_200_OK,
)
async def logout_account(
    account_name: str,
    session: AsyncSession = Depends(get_db),
) -> dict:
    """
    Log out via deleting the session state and removing the DB record.
    (Equivalent to delete for now since we drop the state)
    """
    session_manager = SessionManager(session)
    deleted = await session_manager.delete_session(account_name)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
        
    return {"message": "Logged out successfully"}
