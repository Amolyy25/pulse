export function EnergySlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="eyebrow">Énergie</span>
        <span className="font-mono text-[13px] font-semibold text-ink tabular-nums">
          {value} / 5
        </span>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => {
          const active = n <= value;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={[
                "h-9 rounded-full border transition-all",
                active
                  ? "border-transparent text-white"
                  : "bg-white border-hairline text-muted hover:border-peach-300",
              ].join(" ")}
              style={
                active
                  ? {
                      background: "var(--grad-sunrise)",
                      boxShadow: "0 6px 14px -8px rgba(244, 98, 138, 0.45)",
                    }
                  : undefined
              }
            >
              <span className="text-[11px] font-semibold">{n}</span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-1.5 text-[10px] uppercase tracking-[0.12em] text-muted">
        <span>plat</span>
        <span>plein</span>
      </div>
    </div>
  );
}
