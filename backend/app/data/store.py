# Simple in-memory storage (like a JS object). Data is lost when the server restarts.
# TODO: move to SQLite / proper DB if needed later.
from datetime import datetime

# demo data so we have something to play with (resets on every restart)
# TODO: replace with real Elexon data for January 2026
actuals_db: dict[int, dict] = {
    1: {"id": 1, "start_time": datetime.fromisoformat("2026-01-01T00:00:00+00:00"), "generation": 8250.0},
    2: {"id": 2, "start_time": datetime.fromisoformat("2026-01-01T00:30:00+00:00"), "generation": 8410.0},
    3: {"id": 3, "start_time": datetime.fromisoformat("2026-01-01T01:00:00+00:00"), "generation": 8120.0},
}

# forecasts for the same target times, published the day before (day-ahead)
forecasts_db: dict[int, dict] = {
    1: {"id": 1, "start_time": datetime.fromisoformat("2026-01-01T00:00:00+00:00"),
        "publish_time": datetime.fromisoformat("2025-12-31T09:00:00+00:00"), "generation": 7900.0},
    2: {"id": 2, "start_time": datetime.fromisoformat("2026-01-01T00:30:00+00:00"),
        "publish_time": datetime.fromisoformat("2025-12-31T09:00:00+00:00"), "generation": 8600.0},
    3: {"id": 3, "start_time": datetime.fromisoformat("2026-01-01T01:00:00+00:00"),
        "publish_time": datetime.fromisoformat("2025-12-31T09:00:00+00:00"), "generation": 8300.0},
}

# auto-increment ids (start after the demo data)
counters = {"actual": len(actuals_db), "forecast": len(forecasts_db)}

# becomes True once the real Elexon data replaced the demo data
status = {"loaded_from_elexon": False}


def next_id(name: str) -> int:
    counters[name] += 1
    return counters[name]
