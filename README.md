# Windsight – Day-ahead Wind Forecast Monitor

A web app for a UK energy utility's day-ahead trading team. It shows:

1. **The latest wind forecast** that was available when the buying decision had to be made.
2. **How accurate those forecasts were**, measured against actual wind generation, so decisions can account for the expected error.

Scope: national-level **wind** generation in **January 2026**, using **Elexon BMRS** data only.

**Live app:** _coming soon (deployment in progress)_

---

## Contents

- [How it works](#how-it-works)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Using the app](#using-the-app)
- [API reference](#api-reference)
- [Key findings (January 2026)](#key-findings-january-2026)
- [Known limitations](#known-limitations)
- [Use of AI tools](#use-of-ai-tools)

---

## How it works

### Data sources (Elexon BMRS)

| Data | Endpoint | Fields used | Resolution |
|---|---|---|---|
| Actual generation | [`FUELHH/stream`](https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/FUELHH/stream), filtered to `fuelType = "WIND"` | `startTime`, `generation` | 30 min |
| Forecast generation | [`WINDFOR/stream`](https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/WINDFOR/stream) | `startTime`, `publishTime`, `generation` | 1 hour |

- **`startTime`** is the period the power is for (the target time).
- **`publishTime`** is when the forecast was made.
- **Lead time** is `startTime − publishTime`, i.e. how far ahead the forecast was made.

### Choosing "the latest forecast"

For each target time **T** and a chosen lead time **H**, the app picks the forecast with the **latest `publishTime` that is still at or before `T − H`**. This is the newest forecast the team would actually have had when deciding, so no information from the future is used.

### Data cleaning

- Actuals: only `WIND` rows for 1–31 January 2026 (1,488 half-hours).
- Forecasts: fetched from 30 December 2025, because a forecast for 1 January 00:00 can be published up to 48 hours earlier. Kept only if:
  - the target time is in January 2026, and
  - the lead time is between 0 and 48 hours. Rows published *after* their target time are not real forecasts and are dropped.

### Accuracy metrics

`error = forecast − actual` (positive means the forecast was too high).

| Metric | Meaning |
|---|---|
| **MAE** (mean absolute error) | Typical size of a miss, in MW |
| **RMSE** (root mean squared error) | Like MAE, but large misses count more |
| **Bias** (mean error) | Direction of the error: + means forecasts run high |
| **Worst hour** | Largest single miss |

---

## Tech stack

| Part | Technology |
|---|---|
| Backend | Python 3.12, FastAPI, Uvicorn, Pydantic v2, requests |
| Frontend | React 19, Vite, Tailwind CSS v4, react-router-dom |
| Data storage | In memory. The data is loaded from Elexon when the server starts. |
| Containers | Docker + Docker Compose |

---

## Project structure

```
.
├── README.md              # this file
├── docker-compose.yml     # runs backend + frontend together
├── .gitignore
│
├── backend/               # FastAPI app (routes → controllers → services)
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py                    # creates the app, CORS, loads Elexon data on startup
│       ├── routes/                    # URL definitions
│       │   ├── actual_routes.py       #   /api/actuals
│       │   ├── forecast_routes.py     #   /api/forecasts
│       │   ├── analysis_routes.py     #   /api/analysis
│       │   └── sync_routes.py         #   /api/sync
│       ├── controllers/               # request handling + HTTP errors (400 / 404 / 502)
│       ├── services/
│       │   ├── actual_service.py      # CRUD for actuals
│       │   ├── forecast_service.py    # CRUD for forecasts
│       │   ├── elexon_service.py      # fetch + clean Elexon data
│       │   └── analysis_service.py    # latest-forecast matching + error metrics
│       ├── models/                    # Pydantic schemas for requests/responses
│       └── data/store.py              # in-memory store (+ demo data as fallback)
│
└── frontend/              # React app
    ├── Dockerfile
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── .env.example       # VITE_API_URL (backend address)
    └── src/
        ├── main.jsx       # React entry + router
        ├── App.jsx        # routes: /forecast, /accuracy, 404
        ├── index.css      # Tailwind + design tokens
        ├── services/api.js        # calls to the backend
        ├── utils/format.js        # number / date formatting
        ├── components/            # Navbar, DaySelect, HorizonPicker, StatsBand, Status
        └── pages/                 # ForecastPage, AccuracyPage, NotFoundPage
```

---

## Getting started

### Option A: Docker (easiest)

Needs only [Docker Desktop](https://www.docker.com/products/docker-desktop/) and internet access.

```bash
git clone <repo-url>
cd <repo-folder>
docker compose up --build
```

- Frontend: **http://localhost:5173**
- Backend: **http://127.0.0.1:8000** (API docs at `/docs`)

Stop with `Ctrl + C`, or run `docker compose down`. Ports 8000 and 5173 must be free; stop any locally running servers first.

### Option B: Run locally without Docker

#### Prerequisites

- **Python 3.12+**
- **Node.js 20+** and npm
- Internet access (the backend fetches data from Elexon when it starts)

#### 1. Clone the repo

```bash
git clone <repo-url>
cd <repo-folder>
```

#### 2. Start the backend

```bash
cd backend

# create and activate a virtual environment
python -m venv .venv
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# macOS / Linux:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

- The API runs at **http://127.0.0.1:8000**.
- Interactive API docs (Swagger) are at **http://127.0.0.1:8000/docs**.
- On startup you should see: `Loaded 1488 actuals and 11873 forecasts from Elexon`. If Elexon can't be reached, the server still starts with a few demo rows.
- To use another port: `uvicorn app.main:app --reload --port 5000`.

> **Windows tip:** if PowerShell blocks `Activate.ps1`, run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once.

#### 3. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The app runs at **http://localhost:5173**.

If the backend is not on `http://127.0.0.1:8000`, create `frontend/.env` from `.env.example` and set the backend address:

```
VITE_API_URL=http://127.0.0.1:5000
```

#### 4. Production build (optional)

```bash
cd frontend
npm run build      # output in frontend/dist
npm run preview    # serve the build locally
```

---

## Deployment (Vercel)

Both apps are deployed as two separate Vercel projects from this same repo.

| Project | Root directory | Settings |
|---|---|---|
| Backend | `backend` | Framework preset: **Other**. Env var `FRONTEND_URL` = the frontend URL (restricts CORS). |
| Frontend | `frontend` | Framework preset: **Vite**. Env var `VITE_API_URL` = the backend URL. |

How it works on Vercel:
- **Backend:** `backend/api/index.py` exposes the FastAPI app as a serverless function, and `backend/vercel.json` routes every path to it. Serverless functions can start cold, so the Elexon data is also loaded on the first analysis request if it isn't loaded yet (`ensure_data_loaded`). The first request after a cold start takes a few seconds.
- **Frontend:** `frontend/vercel.json` sends every path to `index.html`, so React Router routes like `/accuracy` work on refresh.

---

## Using the app

### Forecast page (`/forecast`)

1. Pick a **delivery day** in January 2026.
2. Pick a **lead time** (0, 4, 8, 12, 24 or 36 hours). This is how long before each hour the forecast must have been published.
3. Read the summary (average, peak and lowest forecast) and the hourly table. Each row shows the forecast, the actual generation, the difference, when the forecast was published and its lead time.

### Accuracy page (`/accuracy`)

1. Pick a **date range** and a **lead time**.
2. See the error metrics (MAE, RMSE, bias, worst hour) and what the bias means for buying.
3. Compare **error by lead time**, and check the **largest misses** in the period.

All times are **GMT** (the same as UTC in January).

---

## API reference

Full interactive docs: **`/docs`** on the running backend.

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/api/analysis/forecast-vs-actual` | Forecast vs actual per period, plus error stats |
| `POST` | `/api/sync/` | Reload January 2026 data from Elexon |
| `GET` / `POST` | `/api/actuals/` | List / create actuals |
| `GET` / `PUT` / `DELETE` | `/api/actuals/{id}` | Read / update / delete one actual |
| `GET` / `POST` | `/api/forecasts/` | List / create forecasts |
| `GET` / `PUT` / `DELETE` | `/api/forecasts/{id}` | Read / update / delete one forecast |

### `GET /api/analysis/forecast-vs-actual`

| Query param | Type | Default | Description |
|---|---|---|---|
| `start` | datetime (ISO 8601) | none | Start of the range (times without a timezone are treated as UTC) |
| `end` | datetime (ISO 8601) | none | End of the range |
| `horizon` | number, 0–48 | 4 | Minimum lead time in hours |

Example:

```
GET /api/analysis/forecast-vs-actual?start=2026-01-10T00:00:00Z&end=2026-01-10T23:30:00Z&horizon=24
```

```json
{
  "horizon_hours": 24,
  "stats": { "count": 24, "mae": 919.67, "rmse": 1131.03, "bias": 355.08, "max_error": 3289.0 },
  "data": [
    {
      "start_time": "2026-01-10T00:00:00Z",
      "actual": 11309.0,
      "forecast": 11445.0,
      "publish_time": "2026-01-08T22:30:00Z",
      "error": 136.0
    }
  ]
}
```
*(`data` is shortened here. Half-hours without an hourly forecast are returned with `forecast: null`.)*

**Errors:** `400` start is after end · `404` record not found · `422` invalid input (e.g. horizon > 48) · `502` Elexon unavailable.

---

## Key findings (January 2026)

744 hours compared:

| Lead time | MAE | RMSE | Bias |
|---|---|---|---|
| 0 h | 1,794 MW | 2,281 MW | +1,592 MW |
| 4 h | 1,836 MW | 2,332 MW | +1,645 MW |
| 24 h | 2,050 MW | 2,518 MW | +1,854 MW |
| 36 h | 2,258 MW | 2,750 MW | +1,951 MW |

- **Error grows with lead time.** Day-ahead decisions carry noticeably more uncertainty than same-day ones.
- **Forecasts consistently ran high, by about 1.6–2 GW on average.** Buying against the raw forecast would have left the portfolio short of power.
- **The largest misses were early on 12 January:** about 21 GW was forecast against about 14 GW actual.

---

## Known limitations

- Data is held in memory and re-fetched from Elexon on every server start (no database).
- No automated tests yet.
- `GET /api/forecasts/` returns all ~12k rows (no pagination).
- CORS allows all origins (to be restricted to the deployed frontend URL).
- The cause of the consistent positive bias has not been investigated (for example, differences in the wind capacity each dataset covers).
- Deployment is in progress.

---

## Use of AI tools (AI-assisted development)

This project was built with AI-assisted development, using two AI coding assistants:

| Tool | Used for |
|---|---|
| **Claude Code** (Anthropic) | Planning the backend and frontend structure; writing and reviewing backend and frontend code; exploring the Elexon API responses and checking the results; frontend design guidance (the `frontend-design` plugin); Docker setup; documentation (this README) |
| **OpenCode** | AI-assisted coding in the terminal: writing and refactoring code, debugging, and answering questions about the codebase during development |

All AI-generated code was reviewed, run and tested locally against the real Elexon data before being committed.
