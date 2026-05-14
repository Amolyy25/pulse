import { NavLink } from "react-router-dom";

const TABS = [
  { to: "/dashboard", label: "Aujourd'hui", icon: "🏠" },
  { to: "/habits", label: "Habitudes", icon: "✅" },
  { to: "/journal", label: "Journal", icon: "📓" },
  { to: "/mood", label: "Stats", icon: "📊" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-pulse-100">
      <div className="max-w-3xl mx-auto grid grid-cols-4">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `py-3 flex flex-col items-center gap-0.5 text-xs transition ${
                isActive
                  ? "text-pulse-500 font-semibold"
                  : "text-muted hover:text-pulse-400"
              }`
            }
          >
            <span className="text-xl leading-none">{t.icon}</span>
            <span>{t.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
