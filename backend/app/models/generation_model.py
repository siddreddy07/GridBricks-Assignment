from datetime import datetime

from pydantic import BaseModel


# ---------- Actual generation (FUELHH, fuelType = WIND) ----------

class ActualCreate(BaseModel):
    start_time: datetime  # target time (30 min resolution)
    generation: float     # wind power in MW


class ActualUpdate(BaseModel):
    start_time: datetime | None = None
    generation: float | None = None


class Actual(ActualCreate):
    id: int


# ---------- Forecast generation (WINDFOR) ----------

class ForecastCreate(BaseModel):
    start_time: datetime    # target time
    publish_time: datetime  # when the forecast was made
    generation: float       # forecasted wind power in MW


class ForecastUpdate(BaseModel):
    start_time: datetime | None = None
    publish_time: datetime | None = None
    generation: float | None = None


class Forecast(ForecastCreate):
    id: int
