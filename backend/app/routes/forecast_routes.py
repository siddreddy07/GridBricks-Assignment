from fastapi import APIRouter

from app.controllers import forecast_controller
from app.models.generation_model import Forecast, ForecastCreate, ForecastUpdate

router = APIRouter(prefix="/api/forecasts", tags=["Forecasts"])


@router.get("/", response_model=list[Forecast])
def list_forecasts():
    return forecast_controller.list_forecasts()


@router.get("/{forecast_id}", response_model=Forecast)
def get_forecast(forecast_id: int):
    return forecast_controller.get_forecast(forecast_id)


@router.post("/", response_model=Forecast, status_code=201)
def create_forecast(data: ForecastCreate):
    return forecast_controller.create_forecast(data)


@router.put("/{forecast_id}", response_model=Forecast)
def update_forecast(forecast_id: int, data: ForecastUpdate):
    return forecast_controller.update_forecast(forecast_id, data)


@router.delete("/{forecast_id}")
def delete_forecast(forecast_id: int):
    return forecast_controller.delete_forecast(forecast_id)
