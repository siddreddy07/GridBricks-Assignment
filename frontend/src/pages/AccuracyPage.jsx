import { useEffect, useState } from "react";
import DaySelect from "../components/DaySelect.jsx";
import HorizonPicker, { HORIZONS } from "../components/HorizonPicker.jsx";
import StatsBand from "../components/StatsBand.jsx";
import { EmptyMessage, ErrorMessage, Loading } from "../components/Status.jsx";
import { getForecastVsActual } from "../services/api.js";
import { errorColor, formatDateTime, formatDayShort, formatMW, formatSigned } from "../utils/format.js";

// "1 to 31 January" style title for the chosen range
function rangeTitle(from, to) {
  const fromDay = Number(from.slice(8));
  const toDay = Number(to.slice(8));
  return fromDay === toDay ? `${fromDay} January` : `${fromDay} to ${toDay} January`;
}

export default function AccuracyPage() {
  const [from, setFrom] = useState("2026-01-01");
  const [to, setTo] = useState("2026-01-31");
  const [horizon, setHorizon] = useState(4);
  const [results, setResults] = useState({}); // { 0: {...}, 4: {...}, ... }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const invalidRange = from > to;

  // load every lead time once per date range, so switching lead time is instant
  useEffect(() => {
    if (invalidRange) return;
    let ignore = false;
    setLoading(true);
    setError("");

    const start = `${from}T00:00:00Z`;
    const end = `${to}T23:30:00Z`;
    Promise.all(HORIZONS.map((h) => getForecastVsActual({ start, end, horizon: h })))
      .then((responses) => {
        if (ignore) return;
        const byHorizon = {};
        responses.forEach((res, i) => (byHorizon[HORIZONS[i]] = res));
        setResults(byHorizon);
      })
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [from, to, invalidRange]);

  const stats = results[horizon]?.stats;
  const biggestMisses = (results[horizon]?.data || [])
    .filter((row) => row.error !== null)
    .sort((a, b) => Math.abs(b.error) - Math.abs(a.error))
    .slice(0, 8);
  const ready = !invalidRange && !loading && !error && stats;

  return (
    <>
      <div className="flex flex-wrap items-end gap-x-8 gap-y-4 border-b border-rule pb-6">
        <div className="flex gap-3">
          <DaySelect label="From" value={from} onChange={setFrom} />
          <DaySelect label="To" value={to} onChange={setTo} />
        </div>
        <HorizonPicker value={horizon} onChange={setHorizon} />
      </div>

      <section className="py-10">
        <h1 className="condensed text-5xl font-bold leading-none tracking-tight sm:text-7xl">{rangeTitle(from, to)}</h1>
        {ready && stats.count > 0 && (
          <p className="mt-6 max-w-[62ch] text-xl leading-relaxed">
            Forecasts made {horizon} hours ahead missed by {formatMW(stats.mae)} MW in a typical hour and ran{" "}
            {formatMW(Math.abs(stats.bias))} MW too {stats.bias > 0 ? "high" : "low"} on average.{" "}
            {stats.bias > 0
              ? "Buying against the raw forecast would leave the portfolio short of power."
              : "Buying against the raw forecast would leave the portfolio long on power."}
          </p>
        )}
      </section>

      {invalidRange && <EmptyMessage>Pick a start day on or before the end day.</EmptyMessage>}
      {!invalidRange && loading && <Loading />}
      {!invalidRange && !loading && error && <ErrorMessage message={error} />}
      {ready && stats.count === 0 && (
        <EmptyMessage>No forecasts were published early enough for this range. Try a shorter lead time.</EmptyMessage>
      )}

      {ready && stats.count > 0 && (
        <>
          <StatsBand
            items={[
              { label: "Typical miss (MAE)", value: `${formatMW(stats.mae)} MW` },
              { label: "RMSE", value: `${formatMW(stats.rmse)} MW`, note: "weights large misses" },
              {
                label: "Average bias",
                value: `${formatSigned(stats.bias)} MW`,
                valueClass: errorColor(stats.bias),
              },
              { label: "Worst hour", value: `${formatMW(stats.max_error)} MW` },
              { label: "Hours compared", value: stats.count.toLocaleString("en-GB") },
            ]}
          />

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <section>
              <h2 className="condensed mb-3 text-2xl font-bold tracking-tight">Error by lead time</h2>
              <div className="overflow-x-auto rounded-md border border-rule bg-surface">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted">
                      <th className="px-4 py-3 font-medium">Lead time</th>
                      <th className="px-4 py-3 text-right font-medium">MAE (MW)</th>
                      <th className="px-4 py-3 text-right font-medium">RMSE (MW)</th>
                      <th className="px-4 py-3 text-right font-medium">Bias (MW)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HORIZONS.map((h) => {
                      const s = results[h]?.stats;
                      return (
                        <tr
                          key={h}
                          className={`border-t border-rule ${h === horizon ? "bg-page font-semibold" : ""}`}
                        >
                          <td className="px-4 py-2.5">{h} h</td>
                          <td className="px-4 py-2.5 text-right">{formatMW(s?.mae)}</td>
                          <td className="px-4 py-2.5 text-right">{formatMW(s?.rmse)}</td>
                          <td className={`px-4 py-2.5 text-right ${errorColor(s?.bias)}`}>{formatSigned(s?.bias)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm text-muted">The further ahead a forecast is made, the larger the error.</p>
            </section>

            <section>
              <h2 className="condensed mb-3 text-2xl font-bold tracking-tight">Largest misses</h2>
              <div className="overflow-x-auto rounded-md border border-rule bg-surface">
                <table className="w-full min-w-[420px] text-sm">
                  <thead>
                    <tr className="text-left text-muted">
                      <th className="px-4 py-3 font-medium">Hour</th>
                      <th className="px-4 py-3 text-right font-medium">Forecast (MW)</th>
                      <th className="px-4 py-3 text-right font-medium">Actual (MW)</th>
                      <th className="px-4 py-3 text-right font-medium">Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {biggestMisses.map((row) => (
                      <tr key={row.start_time} className="border-t border-rule hover:bg-page">
                        <td className="px-4 py-2.5">{formatDateTime(row.start_time)}</td>
                        <td className="px-4 py-2.5 text-right">{formatMW(row.forecast)}</td>
                        <td className="px-4 py-2.5 text-right">{formatMW(row.actual)}</td>
                        <td className={`px-4 py-2.5 text-right font-medium ${errorColor(row.error)}`}>
                          {formatSigned(row.error)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm text-muted">
                Between {formatDayShort(from)} and {formatDayShort(to)} at a {horizon} h lead time.
              </p>
            </section>
          </div>
        </>
      )}
    </>
  );
}
