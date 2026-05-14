import { useEffect, useState } from "react";

export function LevelUpModal({
  level,
  gemsBonus,
  onClose,
}: {
  level: number;
  gemsBonus: number;
  onClose: () => void;
}) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={[
        "fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200",
        show ? "opacity-100" : "opacity-0",
        "bg-ink/30 backdrop-blur-sm",
      ].join(" ")}
    >
      <div
        className={[
          "relative max-w-sm w-full text-center rounded-3xl p-6 sm:p-8 shadow-2xl transition-transform duration-300 overflow-x-hidden overflow-y-auto max-h-[90vh]",
          show ? "scale-100" : "scale-75",
        ].join(" ")}
        style={{ background: "var(--grad-sunrise)" }}
      >
        <div className="absolute inset-0 -z-10 opacity-30 mix-blend-overlay">
          <svg width="100%" height="100%">
            <pattern id="dots" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
        <div className="eyebrow text-white/80 mb-1">Bravo</div>
        <div className="editorial-num text-[5rem] text-white leading-none">{level}</div>
        <h3 className="display text-xl text-white mt-1 mb-3">
          Nouveau niveau
        </h3>
        {gemsBonus > 0 && (
          <p className="text-white/90 text-sm mb-4">+{gemsBonus} 💎 reçus en bonus.</p>
        )}
        <button
          onClick={onClose}
          className="w-full justify-center inline-flex items-center bg-white text-ink rounded-full py-2.5 font-semibold text-sm hover:bg-cream transition"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
