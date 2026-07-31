from pydantic import BaseModel


class DashboardOverviewResponse(BaseModel):
    total_campaigns: int
    active_campaigns: int
    completed_campaigns: int
    total_leads: int
    queue_size: int
