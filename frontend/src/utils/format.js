// UK is on GMT in January, so UTC times are also local times

// "2026-01-01" ... "2026-01-31" – the only days we have data for
export const JANUARY_DAYS = Array.from({ length: 31 }, (_, i) => `2026-01-${String(i + 1).padStart(2, "0")}`);

const dayShortFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const dayLongFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

export function formatDayShort(day) {
  return dayShortFormat.format(new Date(`${day}T00:00:00Z`)); // "Thu 15 Jan"
}

export function formatDayLong(day) {
  return dayLongFormat.format(new Date(`${day}T00:00:00Z`)); // "Thursday 15 January"
}

export function formatTime(iso) {
  return new Date(iso).toISOString().slice(11, 16); // "14:00"
}

export function formatDateTime(iso) {
  return dateTimeFormat.format(new Date(iso)); // "8 Jan, 22:30"
}

export function formatMW(value) {
  if (value === null || value === undefined) return "–";
  return Math.round(value).toLocaleString("en-GB");
}

export function formatSigned(value) {
  if (value === null || value === undefined) return "–";
  const rounded = Math.round(value);
  if (rounded > 0) return `+${rounded.toLocaleString("en-GB")}`;
  if (rounded < 0) return `−${Math.abs(rounded).toLocaleString("en-GB")}`;
  return "0";
}

export function hoursBetween(fromIso, toIso) {
  return (new Date(toIso) - new Date(fromIso)) / (1000 * 60 * 60);
}

// text colour for an error value: forecast too high vs too low
export function errorColor(value) {
  if (value > 0) return "text-over";
  if (value < 0) return "text-under";
  return "text-muted";
}
