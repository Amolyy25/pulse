import { useQuery } from "@tanstack/react-query";
import { listBadges } from "../api/badges";
import { RARITY_META } from "../lib/rarity";
import type { BadgeListItem } from "../types/badge";

export default function BadgesPage() {
  const q = useQuery({ queryKey: ["badges"], queryFn: listBadges });
  const badges = q.data?.badges ?? [];

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-ink-900">Badges</h2>
        <span className="text-sm text-muted">
          {earnedCount} / {badges.length}
        </span>
      </div>

      {q.isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-40" />
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {badges.map((b) => (
          <BadgeCard key={b.id} badge={b} />
        ))}
      </div>
    </div>
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
      className={`relative card p-4 text-center
        ${badge.earned ? `ring-2 ${meta.ring}` : ""}`}
    >
      <div
        className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full font-semibold ${meta.chip}`}
      >
        {meta.label}
      </div>
      <div
        className={`text-5xl mb-2 transition ${badge.earned ? "" : "opacity-40 grayscale"}`}
      >
        {badge.icon}
      </div>
      <div
        className="font-semibold text-sm mb-1"
        style={badge.earned ? { color: meta.color } : { color: "var(--color-muted)" }}
      >
        {badge.name}
      </div>
      <p className="text-[11px] text-muted leading-snug min-h-[2.5em]">
        {badge.description}
      </p>
      {!badge.earned && badge.progress && (
        <div className="mt-3">
          <div className="w-full h-1.5 bg-pulse-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-pulse-400 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-[10px] text-muted mt-1">
            {badge.progress.current} / {badge.progress.target}
          </div>
        </div>
      )}
      {badge.earned && badge.earned_at && (
        <div className="text-[10px] text-muted mt-2">
          {new Date(badge.earned_at).toLocaleDateString("fr-FR")}
        </div>
      )}
    </div>
  );
}
