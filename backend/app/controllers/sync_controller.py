import requests
from fastapi import HTTPException

from app.services import actual_service, elexon_service, forecast_service


def sync_data():
    try:
        actuals = elexon_service.fetch_actuals()
        forecasts = elexon_service.fetch_forecasts()
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Could not fetch data from Elexon: {e}")

    return {
        "message": "Data loaded from Elexon",
        "actuals": actual_service.replace_all(actuals),
        "forecasts": forecast_service.replace_all(forecasts),
    }
