export function SvgDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <defs>
        <linearGradient id="sunrise-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff8a4d" />
          <stop offset="55%" stopColor="#f4628a" />
          <stop offset="100%" stopColor="#8e5fe5" />
        </linearGradient>
        <linearGradient id="sunrise-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd4b8" />
          <stop offset="50%" stopColor="#ffaecf" />
          <stop offset="100%" stopColor="#c8b5ff" />
        </linearGradient>
        <linearGradient id="mint-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5ec78a" />
          <stop offset="100%" stopColor="#1d8650" />
        </linearGradient>
      </defs>
    </svg>
  );
}
