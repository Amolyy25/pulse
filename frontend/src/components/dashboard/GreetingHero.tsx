function greetingFor(d: Date) {
  const h = d.getHours();
  if (h < 5) return "Bonne nuit";
  if (h < 12) return "Bon matin";
  if (h < 18) return "Bel après-midi";
  return "Belle soirée";
}

function ordinalFr(n: number) {
  return n === 1 ? "1er" : `${n}`;
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
  const day = now.getDate();
  const month = now.toLocaleDateString("fr-FR", { month: "long" });

  return (
    <section className="relative card card-tinted-peach overflow-hidden p-5 sm:p-6">
      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full opacity-70 blur-2xl" style={{ background: "var(--grad-rose)" }} />
      <div className="absolute top-3 right-4 eyebrow text-ink-soft">
        {ordinalFr(day)} {month}
      </div>
      <div className="relative">
        <div className="eyebrow mb-2">{greetingFor(now)}</div>
        <h1 className="display-xl text-[2.4rem] sm:text-[2.8rem] text-ink">
          {username}<span className="text-rose-400">,</span>{" "}
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

function Stat({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur border border-hairline rounded-full px-3 py-1.5">
      <span className="text-sm">{icon}</span>
      <span className="font-mono text-[13px] font-semibold tabular-nums text-ink">{value}</span>
      <span className="eyebrow text-[9px]">{label}</span>
    </div>
  );
}
