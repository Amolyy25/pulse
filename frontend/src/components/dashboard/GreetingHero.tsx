function greetingFor(d: Date) {
  const h = d.getHours();
  if (h < 5) return "Bonne nuit";
  if (h < 12) return "Bon matin";
  if (h < 18) return "Bel après-midi";
  return "Belle soirée";
}

export function GreetingHero({
  username,
  topStreak,
  level,
}: {
  username: string;
  topStreak: number;
  level: number;
}) {
  const now = new Date();

  return (
    <section className="relative card card-tinted-peach overflow-hidden p-5 sm:p-6">
      <div
        className="absolute -top-10 -right-10 w-36 sm:w-44 h-36 sm:h-44 rounded-full opacity-60 blur-2xl pointer-events-none"
        style={{ background: "var(--grad-rose)" }}
      />
      <div className="relative">
        <div className="eyebrow mb-1.5">{greetingFor(now)}</div>
        <h1 className="display-xl text-[2rem] sm:text-[2.6rem] leading-[1] text-ink break-words">
          {username}
          <span className="text-rose-400">,</span>
          <br className="sm:hidden" />
          <span className="sm:ml-2"> </span>
          <span className="flourish">prêt·e</span> ?
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Stat label="record" value={`${topStreak}j`} icon="🔥" />
          <Stat label="niveau" value={level} icon="✦" />
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-white/70 backdrop-blur border border-hairline rounded-full px-2.5 py-1">
      <span className="text-xs">{icon}</span>
      <span className="font-mono text-[12px] font-semibold tabular-nums text-ink">
        {value}
      </span>
      <span className="eyebrow text-[9px]">{label}</span>
    </div>
  );
}
