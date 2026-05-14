import { xpProgress } from "../lib/level";

export function XPBar({ xp, compact = false }: { xp: number; compact?: boolean }) {
  const { level, into, span, progress } = xpProgress(xp);
  const pct = Math.min(100, Math.max(0, progress * 100));

  return (
    <div className="w-full">
      {!compact && (
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="eyebrow leading-none">Niveau</span>
          <span className="text-[11px] text-muted tabular-nums">
            {into} / {span} XP
          </span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <span className="display text-[1.5rem] leading-none text-ink">{level}</span>
        <div className="flex-1 h-1.5 bg-hairline rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${pct}%`,
              background: "var(--grad-sunrise)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
