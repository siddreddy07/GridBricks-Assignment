from fastapi import HTTPException

from app.models.generation_model import ActualCreate, ActualUpdate
from app.services import actual_service


def list_actuals():
    return actual_service.get_all()


def get_actual(actual_id: int):
    record = actual_service.get_by_id(actual_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Actual not found")
    return record


def create_actual(data: ActualCreate):
    return actual_service.create(data)


def update_actual(actual_id: int, data: ActualUpdate):
    record = actual_service.update(actual_id, data)
    if record is None:
        raise HTTPException(status_code=404, detail="Actual not found")
    return record


def delete_actual(actual_id: int):
    if not actual_service.delete(actual_id):
        raise HTTPException(status_code=404, detail="Actual not found")
    return {"message": "Actual deleted"}
