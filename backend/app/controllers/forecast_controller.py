from fastapi import HTTPException

from app.models.generation_model import ForecastCreate, ForecastUpdate
from app.services import forecast_service


def list_forecasts():
    return forecast_service.get_all()


def get_forecast(forecast_id: int):
    record = forecast_service.get_by_id(forecast_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Forecast not found")
    return record


def create_forecast(data: ForecastCreate):
    return forecast_service.create(data)


def update_forecast(forecast_id: int, data: ForecastUpdate):
    record = forecast_service.update(forecast_id, data)
    if record is None:
        raise HTTPException(status_code=404, detail="Forecast not found")
    return record


def delete_forecast(forecast_id: int):
    if not forecast_service.delete(forecast_id):
        raise HTTPException(status_code=404, detail="Forecast not found")
    return {"message": "Forecast deleted"}
