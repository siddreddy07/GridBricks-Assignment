import math
from datetime import datetime, timedelta

from app.data.store import actuals_db, forecasts_db


def get_forecast_vs_actual(start: datetime | None, end: datetime | None, horizon_hours: float) -> dict:
    """
    For every actual in the time range, find the latest forecast that was
    published at least `horizon_hours` before the target time.
    Example: horizon = 24 -> "what did we know 1 day before?"
    """
    # group forecasts by target time so we don't loop over all of them every time
    forecasts_by_time: dict[datetime, list[dict]] = {}
    for forecast in forecasts_db.values():
        forecasts_by_time.setdefault(forecast["start_time"], []).append(forecast)

    points = []
    for actual in sorted(actuals_db.values(), key=lambda a: a["start_time"]):
        target_time = actual["start_time"]
        if start and target_time < start:
            continue
        if end and target_time > end:
            continue

        cutoff = target_time - timedelta(hours=horizon_hours)
        candidates = [f for f in forecasts_by_time.get(target_time, []) if f["publish_time"] <= cutoff]

        if candidates:
            latest = max(candidates, key=lambda f: f["publish_time"])
            points.append({
                "start_time": target_time,
                "actual": actual["generation"],
                "forecast": latest["generation"],
                "publish_time": latest["publish_time"],
                "error": latest["generation"] - actual["generation"],
            })
        else:
            # no forecast for this time (forecasts are hourly, actuals are every 30 min)
            points.append({
                "start_time": target_time,
                "actual": actual["generation"],
                "forecast": None,
                "publish_time": None,
                "error": None,
            })

    return {
        "horizon_hours": horizon_hours,
        "stats": calculate_stats(points),
        "data": points,
    }


def calculate_stats(points: list[dict]) -> dict:
    errors = [p["error"] for p in points if p["error"] is not None]
    if not errors:
        return {"count": 0, "mae": None, "rmse": None, "bias": None, "max_error": None}

    count = len(errors)
    return {
        "count": count,
        "mae": sum(abs(e) for e in errors) / count,          # mean absolute error
        "rmse": math.sqrt(sum(e * e for e in errors) / count),  # root mean squared error
        "bias": sum(errors) / count,                          # + means forecast too high
        "max_error": max(abs(e) for e in errors),
    }
