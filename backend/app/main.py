import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.controllers import sync_controller
from app.routes.actual_routes import router as actual_router
from app.routes.analysis_routes import router as analysis_router
from app.routes.forecast_routes import router as forecast_router
from app.routes.sync_routes import router as sync_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # load January 2026 data from Elexon when the server starts
    try:
        result = sync_controller.sync_data()
        print(f"Loaded {result['actuals']} actuals and {result['forecasts']} forecasts from Elexon")
    except Exception as e:
        print(f"Could not load Elexon data, using demo data instead: {e}")
    yield


app = FastAPI(title="Wind Forecast Monitor API", lifespan=lifespan)

# allow the React app to call this API
# FRONTEND_URL is set in production (e.g. https://my-app.vercel.app), otherwise allow all
frontend_url = os.getenv("FRONTEND_URL")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url] if frontend_url else ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(actual_router)
app.include_router(forecast_router)
app.include_router(analysis_router)
app.include_router(sync_router)


@app.get("/")
def health_check():
    return {"status": "ok"}
