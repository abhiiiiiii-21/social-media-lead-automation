from fastapi import APIRouter

from app.api.routes import campaigns, dashboard, health, settings, templates

api_router = APIRouter()
api_router.include_router(campaigns.router, prefix="/campaigns", tags=["campaigns"])
api_router.include_router(templates.router, prefix="/templates", tags=["templates"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])

# Health routes are generally at the root, but we can include them in api or root
root_router = APIRouter()
root_router.include_router(health.router, tags=["system"])
