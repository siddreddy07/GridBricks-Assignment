export const HORIZONS = [0, 4, 8, 12, 24, 36];

// segmented buttons: how many hours before each period the forecast must have been published
export default function HorizonPicker({ value, onChange }) {
  return (
    <div role="group" aria-labelledby="lead-time-label">
      <span id="lead-time-label" className="mb-1.5 block text-sm text-muted">
        Lead time
      </span>
      <div className="inline-flex rounded border border-rule bg-surface">
        {HORIZONS.map((h) => (
          <button
            key={h}
            type="button"
            aria-pressed={value === h}
            onClick={() => onChange(h)}
            className={`h-10 border-l border-rule px-3.5 text-sm first:rounded-l first:border-l-0 last:rounded-r focus-visible:relative focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent ${
              value === h ? "bg-ink font-medium text-white" : "text-ink hover:bg-page"
            }`}
          >
            {h} h
          </button>
        ))}
      </div>
    </div>
  );
}
