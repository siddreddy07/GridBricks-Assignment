from app.data.store import actuals_db, counters, next_id
from app.models.generation_model import ActualCreate, ActualUpdate


def get_all() -> list[dict]:
    return list(actuals_db.values())


def get_by_id(actual_id: int) -> dict | None:
    return actuals_db.get(actual_id)


def create(data: ActualCreate) -> dict:
    new_id = next_id("actual")
    record = {"id": new_id, **data.model_dump()}
    actuals_db[new_id] = record
    return record


def update(actual_id: int, data: ActualUpdate) -> dict | None:
    record = actuals_db.get(actual_id)
    if record is None:
        return None
    # only update the fields that were sent
    record.update(data.model_dump(exclude_unset=True))
    return record


def delete(actual_id: int) -> bool:
    return actuals_db.pop(actual_id, None) is not None


def replace_all(rows: list[dict]) -> int:
    """Remove old data and save the new rows (used when loading from Elexon)."""
    actuals_db.clear()
    counters["actual"] = 0
    for row in rows:
        new_id = next_id("actual")
        actuals_db[new_id] = {"id": new_id, **row}
    return len(actuals_db)
