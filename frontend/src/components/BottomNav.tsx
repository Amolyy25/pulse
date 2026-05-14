import { NavLink } from "react-router-dom";

const TABS = [
  { to: "/dashboard", label: "Jour", icon: HomeIcon },
  { to: "/habits", label: "Habits", icon: HabitsIcon },
  { to: "/journal", label: "Journal", icon: JournalIcon },
  { to: "/mood", label: "Stats", icon: StatsIcon },
];

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 z-30 pointer-events-none px-3"
      style={{ bottom: "max(env(safe-area-inset-bottom), 12px)" }}
    >
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="relative bg-white/90 backdrop-blur-xl border border-hairline rounded-full shadow-[0_18px_40px_-18px_rgba(43,18,22,0.35)] p-1">
          <div className="grid grid-cols-4 gap-0.5">
            {TABS.map((t) => (
              <Tab key={t.to} to={t.to} label={t.label} Icon={t.icon} />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

function Tab({
  to,
  label,
  Icon,
}: {
  to: string;
  label: string;
  Icon: (p: { active?: boolean }) => JSX.Element;
}) {
  return (
    <NavLink to={to} className="block">
      {({ isActive }) => (
        <div
          className={[
            "relative w-full rounded-full py-2 px-1 flex flex-col items-center justify-center gap-0.5 transition",
            isActive ? "text-white" : "text-ink-soft",
          ].join(" ")}
        >
          {isActive && (
            <span
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{ background: "var(--grad-sunrise)" }}
            />
          )}
          <span className="relative flex flex-col items-center gap-0.5 leading-none">
            <Icon active={isActive} />
            <span className="text-[10px] font-semibold tracking-[0.04em] uppercase">
              {label}
            </span>
          </span>
        </div>
      )}
    </NavLink>
  );
}

type IconProps = { active?: boolean };

function HomeIcon({ active }: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}
function HabitsIcon({ active }: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="m8 12 3 3 5-6" />
    </svg>
  );
}
function JournalIcon({ active }: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4h10a4 4 0 0 1 4 4v12H8a3 3 0 0 1-3-3z" />
      <path d="M9 8h6M9 12h5" />
    </svg>
  );
}
function StatsIcon({ active }: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H4" />
    </svg>
  );
}
