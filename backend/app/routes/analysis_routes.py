from datetime import datetime

from fastapi import APIRouter, Query

from app.controllers import analysis_controller
from app.models.analysis_model import AnalysisResponse

router = APIRouter(prefix="/api/analysis", tags=["Analysis"])


@router.get("/forecast-vs-actual", response_model=AnalysisResponse)
def forecast_vs_actual(
    start: datetime | None = None,
    end: datetime | None = None,
    horizon: float = Query(4, ge=0, le=48, description="hours before target time"),
):
    return analysis_controller.get_forecast_vs_actual(start, end, horizon)
