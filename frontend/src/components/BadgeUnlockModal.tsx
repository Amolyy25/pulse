import { useEffect, useState } from "react";
import type { AwardedBadge } from "../types/badge";
import { RARITY_META } from "../lib/rarity";

const CONFETTI_COLORS = ["#ff8a4d", "#f4628a", "#8e5fe5", "#5ec78a", "#f3c33d", "#ffaecf"];

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

  const confetti = Array.from({ length: 22 }).map((_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 0.7;
    const dur = 1.6 + Math.random() * 1.4;
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const size = 5 + Math.random() * 8;
    const rot = Math.random() * 360;
    return (
      <span
        key={i}
        className="absolute top-0 animate-confetti-fall"
        style={{
          left: `${left}%`,
          width: size,
          height: size * 0.4,
          background: color,
          borderRadius: 2,
          transform: `rotate(${rot}deg)`,
          animationDelay: `${delay}s`,
          animationDuration: `${dur}s`,
        }}
      />
    );
  });

  return (
    <div
      className={[
        "fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200",
        show ? "opacity-100" : "opacity-0",
        "bg-ink/30 backdrop-blur-sm",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">{confetti}</div>
      <div
        className={[
          "relative bg-white border border-hairline rounded-3xl p-8 max-w-sm w-full text-center transition-transform duration-300 shadow-2xl",
          show ? "scale-100" : "scale-75",
        ].join(" ")}
      >
        <div
          aria-hidden
          className="absolute inset-0 -z-10 rounded-3xl opacity-70"
          style={{ background: "var(--grad-sunrise-soft)" }}
        />
        <div className="eyebrow mb-1">Récompense</div>
        <h3 className="display text-2xl mb-3 text-ink">
          Badge <span className="flourish">débloqué</span>
        </h3>
        <div
          className="relative mx-auto w-24 h-24 mb-3 rounded-full flex items-center justify-center text-5xl"
          style={{ background: meta.color + "22", boxShadow: `0 0 0 6px ${meta.color}1a` }}
        >
          {badge.icon}
        </div>
        <div className="font-display text-xl font-semibold mb-1" style={{ color: meta.color }}>
          {badge.name}
        </div>
        <div className={`inline-block text-[10px] px-2 py-0.5 rounded-full uppercase tracking-[0.18em] font-semibold mb-3 ${meta.chip}`}>
          {meta.label}
        </div>
        {badge.description && (
          <p className="text-sm text-ink-soft mb-6">{badge.description}</p>
        )}
        <button onClick={onClose} className="btn-primary w-full justify-center">
          Continuer
        </button>
      </div>
    </div>
  );
}
