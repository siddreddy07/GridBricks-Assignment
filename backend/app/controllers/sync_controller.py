import requests
from fastapi import HTTPException

from app.data.store import status
from app.services import actual_service, elexon_service, forecast_service


def sync_data():
    try:
        actuals = elexon_service.fetch_actuals()
        forecasts = elexon_service.fetch_forecasts()
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Could not fetch data from Elexon: {e}")

    result = {
        "message": "Data loaded from Elexon",
        "actuals": actual_service.replace_all(actuals),
        "forecasts": forecast_service.replace_all(forecasts),
    }
    status["loaded_from_elexon"] = True
    return result


def ensure_data_loaded():
    """
    Load Elexon data on the first request if it isn't loaded yet.
    Needed on Vercel (serverless), where the startup hook may not run.
    """
    if status["loaded_from_elexon"]:
        return
    try:
        sync_data()
    except HTTPException as e:
        print(f"Could not load Elexon data, using demo data instead: {e.detail}")
