import { useEffect, useState } from "react";

export type Burst = { id: number; xp: number; gems: number; leveledUp: boolean };

export function CheckInAnimation({
  burst,
  onDone,
}: {
  burst: Burst | null;
  onDone: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!burst) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 250);
    }, 1400);
    return () => clearTimeout(t);
  }, [burst, onDone]);

  if (!burst) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="bg-white/95 border border-pulse-200 rounded-2xl px-8 py-6 shadow-xl text-center animate-pop">
        <div className="text-4xl font-bold text-pulse-500">+{burst.xp} XP 🎉</div>
        {burst.gems > 0 && (
          <div className="text-pulse-600 mt-2 text-lg">+{burst.gems} 💎 streak bonus!</div>
        )}
        {burst.leveledUp && (
          <div className="text-amber-500 mt-2 text-lg font-semibold">⬆️ Level up!</div>
        )}
      </div>
    </div>
  );
}
