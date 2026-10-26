import { NavLink } from "react-router-dom";

const links = [
  { to: "/forecast", label: "Forecast" },
  { to: "/accuracy", label: "Accuracy" },
];

export default function Navbar() {
  return (
    <header className="border-b border-rule bg-surface">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-10 px-4 sm:px-6">
        <span className="condensed text-lg font-bold tracking-tight">Windsight</span>
        <nav className="flex h-full gap-6">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center border-b-2 text-sm focus-visible:outline-2 focus-visible:outline-accent ${
                  isActive ? "border-accent font-medium text-ink" : "border-transparent text-muted hover:text-ink"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
