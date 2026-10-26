from datetime import datetime

from pydantic import BaseModel


class AnalysisPoint(BaseModel):
    start_time: datetime
    actual: float
    forecast: float | None
    publish_time: datetime | None
    error: float | None  # forecast - actual


class ErrorStats(BaseModel):
    count: int
    mae: float | None
    rmse: float | None
    bias: float | None
    max_error: float | None


class AnalysisResponse(BaseModel):
    horizon_hours: float
    stats: ErrorStats
    data: list[AnalysisPoint]
