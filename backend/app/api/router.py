from fastapi import APIRouter

from app.api.routes import accounts, campaigns, dashboard, health, imports, scraper, settings, templates, execution
from app.ai.discovery import router as discovery_router

api_router = APIRouter()
api_router.include_router(campaigns.router, prefix="/campaigns", tags=["campaigns"])
api_router.include_router(templates.router, prefix="/templates", tags=["templates"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(imports.router)
api_router.include_router(accounts.router)
api_router.include_router(scraper.router)
api_router.include_router(execution.router, prefix="/execution", tags=["execution"])

api_router.include_router(discovery_router.router, prefix="/ai", tags=["ai"])

# Health routes are generally at the root, but we can include them in api or root
root_router = APIRouter()
root_router.include_router(health.router, tags=["system"])
