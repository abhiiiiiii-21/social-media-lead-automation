from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AccountLoginRequest(BaseModel):
    username: str
    password: str


class AccountSessionResponse(BaseModel):
    id: str
    account_name: str
    status: str
    last_used: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class AccountValidationResponse(BaseModel):
    account_name: str
    is_valid: bool
    status: str
