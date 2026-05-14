import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function ProfileMenu({ initial }: { initial: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-pulse-300 to-pulse-500 flex items-center justify-center font-bold text-white hover:ring-2 hover:ring-pulse-300 transition"
      >
        {initial}
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-48 bg-white border border-pulse-100 rounded-xl shadow-xl py-1 z-40 animate-slide-up">
          <MenuItem to="/badges" icon="🏆" label="Badges" onClick={() => setOpen(false)} />
          <MenuItem to="/leaderboard" icon="📈" label="Classement" onClick={() => setOpen(false)} />
          <MenuItem to="/settings" icon="⚙️" label="Réglages" onClick={() => setOpen(false)} />
          <div className="border-t border-pulse-100 my-1" />
          <button
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-pulse-50 text-red-500 flex items-center gap-2"
          >
            <span>🚪</span> Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  to,
  icon,
  label,
  onClick,
}: {
  to: string;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="px-3 py-2 text-sm hover:bg-pulse-50 flex items-center gap-2 text-ink-900"
    >
      <span>{icon}</span> {label}
    </Link>
  );
}
