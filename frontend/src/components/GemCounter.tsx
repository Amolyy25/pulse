import { useEffect, useState } from "react";

export function GemCounter({ gems }: { gems: number }) {
  const [prev, setPrev] = useState(gems);
  const [delta, setDelta] = useState<number | null>(null);

  useEffect(() => {
    if (gems !== prev) {
      const d = gems - prev;
      if (d > 0) {
        setDelta(d);
        const t = setTimeout(() => setDelta(null), 1500);
        return () => clearTimeout(t);
      }
      setPrev(gems);
    }
  }, [gems, prev]);

  useEffect(() => {
    if (delta === null) setPrev(gems);
  }, [delta, gems]);

  return (
    <div className="relative inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pulse-100 border border-pulse-200">
      <span className="text-base">💎</span>
      <span className="font-semibold text-pulse-500 text-sm tabular-nums">{gems}</span>
      {delta !== null && (
        <span className="pointer-events-none absolute -top-2 right-0 text-xs font-bold text-pulse-500 animate-float-up">
          +{delta}
        </span>
      )}
    </div>
  );
}
