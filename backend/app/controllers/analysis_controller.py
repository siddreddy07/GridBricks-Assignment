from datetime import datetime, timezone

from fastapi import HTTPException

from app.services import analysis_service


def to_utc(value: datetime | None) -> datetime | None:
    # if the user sends a time without timezone, treat it as UTC
    if value is not None and value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


def get_forecast_vs_actual(start: datetime | None, end: datetime | None, horizon: float):
    start = to_utc(start)
    end = to_utc(end)
    if start and end and start > end:
        raise HTTPException(status_code=400, detail="start must be before end")
    return analysis_service.get_forecast_vs_actual(start, end, horizon)
