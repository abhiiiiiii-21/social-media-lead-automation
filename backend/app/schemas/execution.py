from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from enum import Enum


class CampaignStatus(str, Enum):
    CREATED = "Created"
    READY = "Ready"
    RUNNING = "Running"
    PAUSED = "Paused"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"
    FAILED = "Failed"
    RECOVERING = "Recovering"


class ExecutionStateResponse(BaseModel):
    campaign_id: str
    current_lead_id: Optional[str] = None
    current_worker_id: Optional[str] = None
    current_session: Optional[str] = None
    progress: float
    eta_seconds: Optional[int] = None
    remaining_leads: int
    processed_leads: int
    failed_leads: int
    skipped_leads: int
    retries: int
    last_checkpoint: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class ExecutionStatusResponse(BaseModel):
    campaign_id: str
    status: str
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    error: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class StartExecutionRequest(BaseModel):
    instagram_account: str
