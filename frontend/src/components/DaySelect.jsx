import { JANUARY_DAYS, formatDayShort } from "../utils/format.js";

// dropdown of January 2026 days (the only data we have)
export default function DaySelect({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded border border-rule bg-surface px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
      >
        {JANUARY_DAYS.map((day) => (
          <option key={day} value={day}>
            {formatDayShort(day)}
          </option>
        ))}
      </select>
    </label>
  );
}
