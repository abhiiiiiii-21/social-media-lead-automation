import os
from datetime import datetime
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.automation.playwright.constants import SESSION_STATUS_VALID, SESSIONS_DIR
from app.models.session import BrowserSession


class SessionManager:
    def __init__(self, db_session: AsyncSession):
        self.db = db_session
        os.makedirs(SESSIONS_DIR, exist_ok=True)

    def get_session_path(self, account_name: str) -> str:
        return str(SESSIONS_DIR / f"{account_name}.json")

    async def get_session(self, account_name: str) -> Optional[BrowserSession]:
        stmt = select(BrowserSession).where(BrowserSession.account_name == account_name)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def create_or_update_session(
        self, account_name: str, status: str = SESSION_STATUS_VALID
    ) -> BrowserSession:
        session = await self.get_session(account_name)
        session_file = self.get_session_path(account_name)

        if session:
            session.status = status
            session.last_used = datetime.now()  # type: ignore
        else:
            session = BrowserSession(
                account_name=account_name,
                session_file=session_file,
                status=status,
                last_used=datetime.now(),
            )
            self.db.add(session)

        await self.db.commit()
        await self.db.refresh(session)
        return session

    async def delete_session(self, account_name: str) -> bool:
        session = await self.get_session(account_name)
        session_file = self.get_session_path(account_name)

        if os.path.exists(session_file):
            try:
                os.remove(session_file)
            except OSError:
                pass

        if session:
            await self.db.delete(session)
            await self.db.commit()
            return True

        return False

    async def mark_session_status(
        self, account_name: str, status: str
    ) -> Optional[BrowserSession]:
        session = await self.get_session(account_name)
        if session:
            session.status = status
            await self.db.commit()
            await self.db.refresh(session)
            return session
        return None
