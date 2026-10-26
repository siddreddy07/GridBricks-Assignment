import { API_URL } from "../services/api.js";

export function Loading() {
  return <p className="py-12 text-muted">Loading forecasts…</p>;
}

export function ErrorMessage({ message }) {
  return (
    <div className="my-8 rounded-md border border-over/40 bg-surface p-5">
      <p className="font-medium text-over">The data could not be loaded: {message}.</p>
      <p className="mt-1 text-sm text-muted">
        Check that the backend is running at {API_URL}, then reload this page.
      </p>
    </div>
  );
}

export function EmptyMessage({ children }) {
  return <p className="py-12 text-muted">{children}</p>;
}
