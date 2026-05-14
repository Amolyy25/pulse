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
    <div className="relative inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white border border-hairline shadow-sm shrink-0">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M6 9 L12 3 L18 9 L12 21 Z" fill="url(#sunrise-fill)" stroke="#f4628a" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
      <span className="font-mono text-[13px] font-semibold text-ink tabular-nums">
        {gems}
      </span>
      {delta !== null && (
        <span className="pointer-events-none absolute -top-3 right-0 text-[11px] font-bold text-rose-500 animate-float-up">
          +{delta}
        </span>
      )}
    </div>
  );
}
