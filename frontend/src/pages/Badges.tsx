import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listBadges } from "../api/badges";
import { RARITY_META } from "../lib/rarity";
import type { BadgeListItem, Rarity } from "../types/badge";

type FilterKey = "all" | "earned" | "locked";

export default function BadgesPage() {
  const q = useQuery({ queryKey: ["badges"], queryFn: listBadges });
  const badges = q.data?.badges ?? [];
  const [filter, setFilter] = useState<FilterKey>("all");

  const earnedCount = badges.filter((b) => b.earned).length;

  const filtered = useMemo(() => {
    if (filter === "earned") return badges.filter((b) => b.earned);
    if (filter === "locked") return badges.filter((b) => !b.earned);
    return badges;
  }, [badges, filter]);

  const byRarity = useMemo(() => {
    const order: Rarity[] = ["legendary", "epic", "rare", "common"];
    const groups = new Map<Rarity, BadgeListItem[]>();
    for (const r of order) groups.set(r, []);
    for (const b of filtered) groups.get(b.rarity)!.push(b);
    return order.filter((r) => (groups.get(r)?.length ?? 0) > 0).map((r) => ({ rarity: r, items: groups.get(r)! }));
  }, [filtered]);

  return (
    <div className="space-y-4 pt-2 stagger">
      <header className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="eyebrow">Collection</div>
          <h1 className="display text-[1.7rem] sm:text-[2rem] leading-none mt-1">
            Mes <span className="flourish">badges</span>
          </h1>
        </div>
        <div className="text-right shrink-0">
          <div className="editorial-num text-3xl">{earnedCount}</div>
          <div className="eyebrow text-[9px]">sur {badges.length}</div>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
          Tout · {badges.length}
        </FilterPill>
        <FilterPill active={filter === "earned"} onClick={() => setFilter("earned")}>
          Gagnés · {earnedCount}
        </FilterPill>
        <FilterPill active={filter === "locked"} onClick={() => setFilter("locked")}>
          À débloquer · {badges.length - earnedCount}
        </FilterPill>
      </div>

      {q.isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-44" />
          ))}
        </div>
      )}

      {byRarity.map(({ rarity, items }) => (
        <section key={rarity} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="eyebrow">{RARITY_META[rarity].label}</span>
            <div className="flex-1 ml-3 h-px bg-hairline" />
            <span className="font-mono text-[11px] text-muted ml-3">{items.length}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {items.map((b) => (
              <BadgeCard key={b.id} badge={b} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function FilterPill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-full transition",
        active
          ? "text-white shadow-md"
          : "bg-white border border-hairline text-ink-soft hover:border-peach-300",
      ].join(" ")}
      style={active ? { background: "var(--grad-sunrise)" } : undefined}
    >
      {children}
    </button>
  );
}

function BadgeCard({ badge }: { badge: BadgeListItem }) {
  const meta = RARITY_META[badge.rarity];
  const pct =
    badge.progress && badge.progress.target > 0
      ? Math.min(100, (badge.progress.current / badge.progress.target) * 100)
      : 0;

  return (
    <div
      className={[
        "relative card p-4 text-center transition",
        badge.earned ? `${meta.tint} card-hover` : "",
      ].join(" ")}
    >
      <div
        className={`absolute top-2 right-2 text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-[0.1em] ${meta.chip}`}
      >
        {meta.label}
      </div>
      <div
        className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center text-4xl mb-2 transition ${
          badge.earned ? "" : "opacity-40 grayscale"
        }`}
        style={
          badge.earned
            ? { background: meta.color + "22", boxShadow: `0 0 0 6px ${meta.color}10` }
            : { background: "rgba(0,0,0,0.03)" }
        }
      >
        {badge.icon}
      </div>
      <div
        className="font-display font-semibold text-[15px] leading-tight mb-1"
        style={badge.earned ? { color: meta.color } : { color: "var(--color-ink)" }}
      >
        {badge.name}
      </div>
      <p className="text-[11px] text-ink-soft leading-snug min-h-[2.5em]">
        {badge.description}
      </p>
      {!badge.earned && badge.progress && (
        <div className="mt-3">
          <div className="w-full h-1.5 bg-cream rounded-full overflow-hidden border border-hairline">
            <div
              className="h-full transition-all"
              style={{ width: `${pct}%`, background: "var(--grad-sunrise)" }}
            />
          </div>
          <div className="font-mono text-[10px] text-muted mt-1">
            {badge.progress.current} / {badge.progress.target}
          </div>
        </div>
      )}
      {badge.earned && badge.earned_at && (
        <div className="font-mono text-[10px] text-muted mt-2">
          {new Date(badge.earned_at).toLocaleDateString("fr-FR")}
        </div>
      )}
    </div>
  );
}
