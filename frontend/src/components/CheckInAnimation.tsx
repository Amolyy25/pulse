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
    }, 1500);
    return () => clearTimeout(t);
  }, [burst, onDone]);

  if (!burst) return null;

  return (
    <div
      className={[
        "pointer-events-none fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <div className="relative bg-white border border-hairline rounded-3xl px-8 py-6 shadow-2xl text-center animate-pop overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{ background: "var(--grad-sunrise-soft)" }}
        />
        <div className="editorial-num text-[2.6rem] leading-none">
          +{burst.xp}
          <span className="font-body text-xs font-semibold tracking-[0.18em] uppercase ml-2 align-middle text-muted">
            XP
          </span>
        </div>
        {burst.gems > 0 && (
          <div className="mt-2 text-sm font-semibold text-rose-500">
            +{burst.gems} 💎 bonus streak
          </div>
        )}
        {burst.leveledUp && (
          <div className="mt-2 text-sm font-semibold text-peach-500">
            ⬆ Niveau supérieur
          </div>
        )}
      </div>
    </div>
  );
}
