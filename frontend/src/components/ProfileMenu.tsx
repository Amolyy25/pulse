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
        aria-label="profile menu"
        className="relative w-11 h-11 rounded-2xl flex items-center justify-center font-display text-lg font-semibold text-white shadow-[0_8px_18px_-8px_rgba(244,98,138,0.6)] transition hover:scale-105"
        style={{ background: "var(--grad-sunrise)" }}
      >
        <span className="font-display">{initial}</span>
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-52 bg-white border border-hairline rounded-2xl shadow-xl py-1.5 z-40 animate-slide-up overflow-hidden">
          <div className="px-3 pb-2 pt-1 eyebrow">Mon compte</div>
          <MenuItem to="/badges" icon="🏆" label="Badges" onClick={() => setOpen(false)} />
          <MenuItem to="/leaderboard" icon="📈" label="Classement" onClick={() => setOpen(false)} />
          <MenuItem to="/settings" icon="⚙" label="Réglages" onClick={() => setOpen(false)} />
          <div className="border-t border-hairline my-1" />
          <button
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-peach-50 text-rose-500 flex items-center gap-2.5"
          >
            <span>↩</span> Déconnexion
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
      className="px-3 py-2 text-sm hover:bg-peach-50 flex items-center gap-2.5 text-ink"
    >
      <span className="text-base">{icon}</span> {label}
    </Link>
  );
}
