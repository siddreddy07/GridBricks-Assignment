from fastapi import APIRouter

from app.controllers import sync_controller

router = APIRouter(prefix="/api/sync", tags=["Sync"])


@router.post("/")
def sync_data():
    """Reload actuals + forecasts for January 2026 from Elexon."""
    return sync_controller.sync_data()
