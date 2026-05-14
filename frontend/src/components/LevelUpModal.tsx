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
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        show ? "opacity-100" : "opacity-0"
      } bg-black/30 backdrop-blur-sm`}
    >
      <div
        className={`bg-gradient-to-br from-pulse-100 to-pulse-300 border border-pulse-300 rounded-2xl p-8 max-w-sm w-full text-center transition-transform duration-300 shadow-xl ring-4 ring-amber-300/50 ${
          show ? "scale-100" : "scale-50"
        }`}
      >
        <div className="text-6xl my-2">🎉</div>
        <h3 className="text-2xl font-bold text-ink-900 mb-1">
          Niveau {level} atteint !
        </h3>
        <p className="text-ink-700 mb-2">Continue comme ça.</p>
        {gemsBonus > 0 && (
          <p className="text-pulse-600 text-sm mb-4">+{gemsBonus} 💎 bonus</p>
        )}
        <button onClick={onClose} className="btn-primary w-full mt-2">
          Continuer
        </button>
      </div>
    </div>
  );
}
