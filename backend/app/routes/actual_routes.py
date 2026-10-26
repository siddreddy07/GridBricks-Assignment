from fastapi import APIRouter

from app.controllers import actual_controller
from app.models.generation_model import Actual, ActualCreate, ActualUpdate

router = APIRouter(prefix="/api/actuals", tags=["Actuals"])


@router.get("/", response_model=list[Actual])
def list_actuals():
    return actual_controller.list_actuals()


@router.get("/{actual_id}", response_model=Actual)
def get_actual(actual_id: int):
    return actual_controller.get_actual(actual_id)


@router.post("/", response_model=Actual, status_code=201)
def create_actual(data: ActualCreate):
    return actual_controller.create_actual(data)


@router.put("/{actual_id}", response_model=Actual)
def update_actual(actual_id: int, data: ActualUpdate):
    return actual_controller.update_actual(actual_id, data)


@router.delete("/{actual_id}")
def delete_actual(actual_id: int):
    return actual_controller.delete_actual(actual_id)
