# Plan – UK Wind Power Forecast Monitor

## 1. What the assignment is asking (in simple words)

- The client is a UK energy company. Every day they buy power from the **day-ahead market**.
- They need to know how much **wind power** will be generated tomorrow, so they know how much extra power to buy.
- Wind depends on weather, so they rely on **forecasts**.
- Our web app should help them:
  1. See the **latest wind forecast** that was available at the time they make the decision.
  2. Check **how accurate** the forecasts are (forecast vs actual, with error numbers).

Data (only from Elexon, only wind, national level, only **January 2026**):

| Dataset | Endpoint | Fields we care about |
|---|---|---|
| Actual generation | `FUELHH/stream` (filter `fuelType = "WIND"`) | `startTime`, `generation` |
| Forecast generation | `WINDFOR/stream` | `startTime`, `publishTime`, `generation` |

Tech that must be used: **React** (frontend), **Python** (backend), **Docker**, deploy on **Vercel or Heroku**.
Also needed: public GitHub repo (random name), README (files, how to run, live link, AI tools used), a max 10 min YouTube video.

---

## 2. Folder Structure

```
rentlAI/
├── Assignment.md
├── Plan.md
├── gridbricks/            # python virtual env (already has fastapi + uvicorn)
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── main.py        # creates FastAPI app, registers routes
│       ├── models/        # pydantic models (shape of data)
│       ├── routes/        # URL paths -> controller functions
│       ├── controllers/   # handles request/response, errors (404 etc.)
│       ├── services/      # business logic (CRUD, later Elexon + error calc)
│       └── data/          # in-memory store for now (no DB yet)
└── frontend/              # React app (created later)
```

Coming from Node/Express, the mapping is:
`routes` = express routers, `controllers` = req/res handlers, `services` = logic, `models` = schemas.

---

## 3. Backend Plan (FastAPI)

### Phase 1 – Basics (doing now)
- [x] MVC folder structure
- [x] Pydantic models for `Actual` and `Forecast`
- [x] In-memory store (Python dict) – no database
- [x] CRUD APIs:

| Method | URL | What it does |
|---|---|---|
| GET | `/api/actuals` | list all actuals |
| GET | `/api/actuals/{id}` | get one actual |
| POST | `/api/actuals` | create actual |
| PUT | `/api/actuals/{id}` | update actual |
| DELETE | `/api/actuals/{id}` | delete actual |
| GET/POST/PUT/DELETE | `/api/forecasts...` | same as above for forecasts |
| GET | `/` | health check |

- [x] CORS enabled so the React app can call it

### Phase 2 – Real data from Elexon
- [x] `services/elexon_service.py` – call `FUELHH/stream` and `WINDFOR/stream` for January 2026
- [x] Keep only `fuelType == "WIND"` for actuals
- [x] Keep only forecasts with target time in January and horizon 0–48h
- [x] Load into the in-memory store on server start (falls back to demo data if Elexon is down)
- [x] `POST /api/sync` to reload the data manually

### Phase 3 – Analysis endpoint
- [x] `GET /api/analysis/forecast-vs-actual?start=&end=&horizon=`
  For each target time, pick the latest forecast whose `publishTime <= startTime - horizon`.
  (Day-ahead decision means forecast must be published before the decision time.)
  Returns the points for the chart + error stats: count, MAE, RMSE, bias, max error.

### Phase 4 – Shipping
- [x] `Dockerfile` for backend
- [ ] `.env` for config (frontend URL, etc.)
- [ ] Deploy (Heroku)

---

## 4. Frontend Plan (React)

### Phase 1 – Setup (now)
- [x] Create empty `frontend/` folder only

### Phase 2 – Basic app
- [x] React + Vite + Tailwind CSS v4 + react-router-dom
- [x] `src/` structure: `pages/`, `components/`, `services/api.js` (fetch calls), `utils/format.js`
- [x] Layout: navbar + 2 pages (`/forecast`, `/accuracy`) + 404 page
- [x] Design: cool "North Sea" palette, Archivo font (condensed headlines), no gradients,
  sentence summaries + tables instead of charts (the assignment doesn't ask for charts)

### Phase 3 – Features
- [x] Date pickers limited to January 2026
- [x] Lead time (horizon) selector: 0 / 4 / 8 / 12 / 24 / 36h
- [x] Forecast page: summary cards + hourly table (forecast, published at, lead time, actual, error)
- [x] Accuracy page: MAE, RMSE, bias, worst miss, error-by-lead-time table, biggest misses
- [x] Loading + error states

### Phase 4 – Shipping
- [x] `Dockerfile` for frontend
- [x] `docker-compose.yml` at root to run both
- [ ] Deploy frontend on Vercel

---

## 5. Final Deliverables Checklist
- [ ] Public GitHub repo with random name
- [ ] README: files/folders, how to run, live link, mention AI tools used
- [ ] Video (max 10 min): Part 1 client pitch (≤5 min), Part 2 tech lead walkthrough (≤5 min)
- [ ] Submit the form, check all links in incognito
