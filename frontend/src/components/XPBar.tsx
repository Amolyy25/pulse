import { xpProgress } from "../lib/level";

export function XPBar({ xp }: { xp: number }) {
  const { level, into, span, progress } = xpProgress(xp);
  const pct = Math.min(100, Math.max(0, progress * 100));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-ink-700 mb-1">
        <span className="font-semibold">Lvl {level}</span>
        <span className="text-muted">
          {into} / {span} XP
        </span>
      </div>
      <div className="w-full h-2 bg-pulse-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-pulse-300 to-pulse-400 transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
