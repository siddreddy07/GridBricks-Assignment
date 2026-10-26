from datetime import datetime, timedelta

import requests

BASE_URL = "https://data.elexon.co.uk/bmrs/api/v1/datasets"

# we only care about target times in January 2026
JAN_START = datetime.fromisoformat("2026-01-01T00:00:00+00:00")
JAN_END = datetime.fromisoformat("2026-02-01T00:00:00+00:00")

# we only look at forecasts made 0 - 48 hours before the target time
MAX_HORIZON_HOURS = 48


def fetch_actuals() -> list[dict]:
    """Actual wind generation (FUELHH) for January 2026."""
    response = requests.get(
        f"{BASE_URL}/FUELHH/stream",
        params={
            "settlementDateFrom": "2026-01-01",
            "settlementDateTo": "2026-01-31",
            "fuelType": "WIND",
        },
        timeout=60,
    )
    response.raise_for_status()

    actuals = []
    for row in response.json():
        if row["fuelType"] != "WIND":
            continue
        actuals.append({
            "start_time": datetime.fromisoformat(row["startTime"]),
            "generation": row["generation"],
        })
    return actuals


def fetch_forecasts() -> list[dict]:
    """Wind forecasts (WINDFOR) for January 2026 target times."""
    # a forecast for 1st Jan 00:00 can be published up to 48h earlier, so start from 30th Dec
    publish_from = JAN_START - timedelta(hours=MAX_HORIZON_HOURS)
    response = requests.get(
        f"{BASE_URL}/WINDFOR/stream",
        params={
            "publishDateTimeFrom": publish_from.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "publishDateTimeTo": JAN_END.strftime("%Y-%m-%dT%H:%M:%SZ"),
        },
        timeout=60,
    )
    response.raise_for_status()

    forecasts = []
    for row in response.json():
        start_time = datetime.fromisoformat(row["startTime"])
        publish_time = datetime.fromisoformat(row["publishTime"])

        # skip target times outside January
        if start_time < JAN_START or start_time >= JAN_END:
            continue

        # skip rows published after the target time (not a real forecast)
        # and forecasts made more than 48h before
        horizon = start_time - publish_time
        if horizon < timedelta(0) or horizon > timedelta(hours=MAX_HORIZON_HOURS):
            continue

        forecasts.append({
            "start_time": start_time,
            "publish_time": publish_time,
            "generation": row["generation"],
        })
    return forecasts
