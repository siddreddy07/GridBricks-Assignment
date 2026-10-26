import { useEffect, useState } from "react";
import DaySelect from "../components/DaySelect.jsx";
import HorizonPicker from "../components/HorizonPicker.jsx";
import { EmptyMessage, ErrorMessage, Loading } from "../components/Status.jsx";
import { getForecastVsActual } from "../services/api.js";
import {
  errorColor,
  formatDateTime,
  formatDayLong,
  formatMW,
  formatSigned,
  formatTime,
  hoursBetween,
} from "../utils/format.js";

export default function ForecastPage() {
  const [day, setDay] = useState("2026-01-15");
  const [horizon, setHorizon] = useState(4);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false; // avoid setting state from an old request
    setLoading(true);
    setError("");

    getForecastVsActual({ start: `${day}T00:00:00Z`, end: `${day}T23:30:00Z`, horizon })
      .then((result) => {
        // forecasts are hourly, so only keep periods that have one
        if (!ignore) setRows(result.data.filter((row) => row.forecast !== null));
      })
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [day, horizon]);

  // summary numbers for the headline sentence
  const forecasts = rows.map((row) => row.forecast);
  const peak = rows.find((row) => row.forecast === Math.max(...forecasts));
  const low = rows.find((row) => row.forecast === Math.min(...forecasts));
  const average = forecasts.reduce((a, b) => a + b, 0) / (forecasts.length || 1);
  const latestPublish = rows.reduce((latest, row) => (row.publish_time > latest ? row.publish_time : latest), "");

  return (
    <>
      <div className="flex flex-wrap items-end gap-x-8 gap-y-4 border-b border-rule pb-6">
        <DaySelect label="Delivery day" value={day} onChange={setDay} />
        <HorizonPicker value={horizon} onChange={setHorizon} />
      </div>

      <section className="py-10">
        <h1 className="condensed text-5xl font-bold leading-none tracking-tight sm:text-7xl">{formatDayLong(day)}</h1>
        {!loading && !error && rows.length > 0 && (
          <>
            <p className="mt-6 max-w-[60ch] text-xl leading-relaxed">
              Wind is forecast to average {formatMW(average)} MW, peaking at {formatMW(peak.forecast)} MW at{" "}
              {formatTime(peak.start_time)} and dropping to {formatMW(low.forecast)} MW at {formatTime(low.start_time)}.
            </p>
            <p className="mt-3 max-w-[70ch] text-muted">
              {horizon === 0
                ? "Each hour uses the newest forecast published before that hour started."
                : `Each hour uses the newest forecast published at least ${horizon} hours before it.`}{" "}
              The most recent one used was published on {formatDateTime(latestPublish)}.
            </p>
          </>
        )}
      </section>

      {loading && <Loading />}
      {!loading && error && <ErrorMessage message={error} />}
      {!loading && !error && rows.length === 0 && (
        <EmptyMessage>No forecasts were published early enough for this day. Try a shorter lead time.</EmptyMessage>
      )}

      {!loading && !error && rows.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-md border border-rule bg-surface">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-muted">
                  <th className="px-4 py-3 font-medium">Hour</th>
                  <th className="px-4 py-3 text-right font-medium">Forecast (MW)</th>
                  <th className="px-4 py-3 text-right font-medium">Actual (MW)</th>
                  <th className="px-4 py-3 text-right font-medium">Difference (MW)</th>
                  <th className="px-4 py-3 font-medium">Forecast published</th>
                  <th className="px-4 py-3 text-right font-medium">Lead time</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.start_time} className="border-t border-rule hover:bg-page">
                    <td className="px-4 py-2.5 font-medium">{formatTime(row.start_time)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold">{formatMW(row.forecast)}</td>
                    <td className="px-4 py-2.5 text-right">{formatMW(row.actual)}</td>
                    <td className={`px-4 py-2.5 text-right ${errorColor(row.error)}`}>{formatSigned(row.error)}</td>
                    <td className="px-4 py-2.5 text-muted">{formatDateTime(row.publish_time)}</td>
                    <td className="px-4 py-2.5 text-right text-muted">
                      {hoursBetween(row.publish_time, row.start_time).toFixed(1)} h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted">
            Difference is forecast minus actual: <span className="text-over">positive</span> means the forecast was too
            high, <span className="text-under">negative</span> means it was too low.
          </p>
        </>
      )}
    </>
  );
}
