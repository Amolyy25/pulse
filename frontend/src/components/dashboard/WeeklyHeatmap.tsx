type WeekDay = { date: string; rate: number };

const DAY_LETTERS = ["L", "M", "M", "J", "V", "S", "D"];

export function WeeklyHeatmap({ week }: { week: WeekDay[] }) {
  // week is 7 days from oldest to today
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-baseline justify-between mb-3">
        <span className="eyebrow">Semaine</span>
        <span className="font-mono text-[11px] text-muted">
          {Math.round((week.reduce((s, d) => s + d.rate, 0) / Math.max(1, week.length)) * 100)}%
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {week.map((d, i) => {
          const intensity = Math.max(0, Math.min(1, d.rate));
          const isToday = i === week.length - 1;
          return (
            <div key={d.date} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-muted uppercase tracking-[0.1em]">
                {DAY_LETTERS[i]}
              </span>
              <div
                className={[
                  "w-full aspect-square rounded-lg border transition-transform hover:scale-105",
                  isToday ? "border-rose-300" : "border-hairline",
                ].join(" ")}
                style={{
                  background:
                    intensity === 0
                      ? "white"
                      : `linear-gradient(135deg, rgba(255, 138, 77, ${0.15 + intensity * 0.55}) 0%, rgba(244, 98, 138, ${0.18 + intensity * 0.55}) 50%, rgba(142, 95, 229, ${0.18 + intensity * 0.45}) 100%)`,
                  boxShadow: intensity > 0.5 ? "0 4px 12px -6px rgba(244, 98, 138, 0.45)" : undefined,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
