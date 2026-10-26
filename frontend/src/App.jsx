import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ForecastPage from "./pages/ForecastPage.jsx";
import AccuracyPage from "./pages/AccuracyPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Routes>
          <Route path="/" element={<Navigate to="/forecast" replace />} />
          <Route path="/forecast" element={<ForecastPage />} />
          <Route path="/accuracy" element={<AccuracyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <footer className="mx-auto max-w-6xl px-4 pb-10 text-sm text-muted sm:px-6">
        Data from Elexon BMRS: actual wind generation (FUELHH) and wind forecasts (WINDFOR). All times are GMT.
      </footer>
    </div>
  );
}
