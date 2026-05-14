export function EnergySlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2 text-sm text-muted">
        <span>Energy level</span>
        <span className="text-ink-900 font-semibold">{value} / 5</span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-pulse-500"
      />
      <div className="flex justify-between text-xs text-muted mt-1">
        <span>🪫 1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>⚡ 5</span>
      </div>
    </div>
  );
}
