import { useEffect, useState } from "react";
import type { AwardedBadge } from "../types/badge";
import { RARITY_META } from "../lib/rarity";

const CONFETTI_COLORS = ["#f0abfc", "#fbcfe8", "#a78bfa", "#fde68a", "#a7f3d0"];

export function BadgeUnlockModal({
  badge,
  onClose,
}: {
  badge: AwardedBadge;
  onClose: () => void;
}) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 10);
    return () => clearTimeout(t);
  }, []);

  const meta = RARITY_META[badge.rarity];

  const confetti = Array.from({ length: 18 }).map((_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 0.6;
    const dur = 1.5 + Math.random() * 1.2;
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const size = 6 + Math.random() * 6;
    return (
      <span
        key={i}
        className="absolute top-0 animate-confetti-fall"
        style={{
          left: `${left}%`,
          width: size,
          height: size,
          background: color,
          borderRadius: 2,
          animationDelay: `${delay}s`,
          animationDuration: `${dur}s`,
        }}
      />
    );
  });

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        show ? "opacity-100" : "opacity-0"
      } bg-black/30 backdrop-blur-sm`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">{confetti}</div>
      <div
        className={`relative bg-white border border-pulse-100 rounded-2xl p-8 max-w-sm w-full text-center transition-transform duration-300 shadow-xl ring-4 ${meta.ring} ${
          show ? "scale-100" : "scale-50"
        }`}
      >
        <div
          className={`inline-block text-xs px-2 py-1 rounded-full mb-3 font-semibold ${meta.chip}`}
        >
          {meta.label}
        </div>
        <h3 className="text-lg text-ink-700 mb-2">Badge débloqué !</h3>
        <div className="text-6xl my-4">{badge.icon}</div>
        <div className="text-2xl font-bold mb-1" style={{ color: meta.color }}>
          {badge.name}
        </div>
        {badge.description && (
          <p className="text-sm text-muted mb-6">{badge.description}</p>
        )}
        <button onClick={onClose} className="btn-primary w-full">
          Super !
        </button>
      </div>
    </div>
  );
}
