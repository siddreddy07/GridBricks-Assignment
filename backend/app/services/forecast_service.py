from app.data.store import counters, forecasts_db, next_id
from app.models.generation_model import ForecastCreate, ForecastUpdate


def get_all() -> list[dict]:
    return list(forecasts_db.values())


def get_by_id(forecast_id: int) -> dict | None:
    return forecasts_db.get(forecast_id)


def create(data: ForecastCreate) -> dict:
    new_id = next_id("forecast")
    record = {"id": new_id, **data.model_dump()}
    forecasts_db[new_id] = record
    return record


def update(forecast_id: int, data: ForecastUpdate) -> dict | None:
    record = forecasts_db.get(forecast_id)
    if record is None:
        return None
    record.update(data.model_dump(exclude_unset=True))
    return record


def delete(forecast_id: int) -> bool:
    return forecasts_db.pop(forecast_id, None) is not None


def replace_all(rows: list[dict]) -> int:
    """Remove old data and save the new rows (used when loading from Elexon)."""
    forecasts_db.clear()
    counters["forecast"] = 0
    for row in rows:
        new_id = next_id("forecast")
        forecasts_db[new_id] = {"id": new_id, **row}
    return len(forecasts_db)
