type Props = {
  done: number;
  total: number;
  size?: number;
  stroke?: number;
};

export function RingProgress({ done, total, size = 148, stroke = 12 }: Props) {
  const pct = total === 0 ? 0 : Math.min(1, done / total);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="ring-track"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="ring-fill"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="editorial-num text-[2.7rem] leading-none">
          {done}
          <span className="text-muted/60">/{total || 0}</span>
        </span>
        <span className="eyebrow mt-1">Aujourd'hui</span>
      </div>
    </div>
  );
}
