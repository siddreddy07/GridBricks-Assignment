// all calls to our FastAPI backend live here (like an axios service file)
export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function getForecastVsActual({ start, end, horizon }) {
  const params = new URLSearchParams({ horizon });
  if (start) params.append("start", start);
  if (end) params.append("end", end);

  const res = await fetch(`${API_URL}/api/analysis/forecast-vs-actual?${params}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (${res.status})`);
  }
  return res.json();
}
