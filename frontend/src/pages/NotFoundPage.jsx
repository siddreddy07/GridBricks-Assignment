import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="py-16">
      <h1 className="condensed text-5xl font-bold tracking-tight">This page doesn't exist</h1>
      <p className="mt-4 text-muted">Check the address, or go back to the forecast.</p>
      <Link to="/forecast" className="mt-6 inline-block font-medium text-accent underline underline-offset-4">
        Open the forecast
      </Link>
    </div>
  );
}
