import { useQuery } from "@tanstack/react-query";
import { fetchLeaderboard } from "../api/leaderboard";
import type { LeaderboardEntry } from "../types/leaderboard";

export default function LeaderboardPage() {
  const q = useQuery({ queryKey: ["leaderboard"], queryFn: fetchLeaderboard });
  const rows = q.data?.leaderboard ?? [];
  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <div className="space-y-4 stagger pt-2">
      <header>
        <div className="eyebrow">Classement</div>
        <h1 className="display text-[1.7rem] sm:text-[2rem] leading-none mt-1">
          Top <span className="flourish">10</span>
        </h1>
      </header>

      {q.isLoading && (
        <div className="space-y-2">
          <div className="skeleton h-40" />
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
        </div>
      )}

      {!q.isLoading && rows.length === 0 && (
        <div className="card p-8 text-center text-muted">
          Personne ici pour l'instant.
        </div>
      )}

      {podium.length > 0 && <Podium podium={podium} />}

      {rest.length > 0 && (
        <div className="space-y-2">
          {rest.map((r) => <Row key={r.user_id} r={r} />)}
        </div>
      )}
    </div>
  );
}

function Podium({ podium }: { podium: LeaderboardEntry[] }) {
  // Visual order on row: 2nd | 1st | 3rd
  const slots: ({ entry: LeaderboardEntry; rank: 1 | 2 | 3 } | null)[] = [
    podium[1] ? { entry: podium[1], rank: 2 } : null,
    podium[0] ? { entry: podium[0], rank: 1 } : null,
    podium[2] ? { entry: podium[2], rank: 3 } : null,
  ];
  const heights: Record<number, number> = { 1: 120, 2: 92, 3: 76 };
  const tints: Record<number, string> = {
    1: "bg-peach-100",
    2: "bg-lavender-100",
    3: "bg-rose-100",
  };
  const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

  return (
    <div className="card p-4 sm:p-5 relative overflow-hidden">
      <div
        className="absolute -top-12 -right-12 w-44 h-44 rounded-full opacity-50 blur-2xl pointer-events-none"
        style={{ background: "var(--grad-rose)" }}
      />
      <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end relative">
        {slots.map((s, i) => {
          if (!s) return <div key={i} />;
          const { entry, rank } = s;
          const big = rank === 1;
          return (
            <div key={entry.user_id} className="flex flex-col items-center min-w-0">
              <Avatar name={entry.username} size={big ? 48 : 38} highlighted={entry.is_me} />
              <div className="mt-1 font-display text-[13px] sm:text-[15px] font-semibold text-ink leading-tight text-center truncate max-w-full">
                {entry.username}
              </div>
              <div className="font-mono text-[10px] sm:text-[11px] text-muted">
                Lvl {entry.level}
              </div>
              <div
                className={`${tints[rank]} mt-2 w-full rounded-t-2xl border border-hairline flex flex-col items-center justify-center gap-0.5 px-1 pt-2 pb-3`}
                style={{ height: heights[rank] }}
              >
                <span className="text-lg leading-none">{medals[rank]}</span>
                <span className="editorial-num text-xl sm:text-2xl leading-none">
                  {entry.xp}
                </span>
                <span className="eyebrow text-[8px]">XP</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ r }: { r: LeaderboardEntry }) {
  return (
    <div
      className={[
        "flex items-center gap-3 p-3 rounded-2xl border transition",
        r.is_me
          ? "card-tinted-peach border-peach-200 animate-glow-pulse"
          : "bg-paper border-hairline",
      ].join(" ")}
    >
      <div className="w-9 text-center">
        <span className="font-display text-lg font-semibold text-ink-soft">{r.rank}</span>
      </div>
      <Avatar name={r.username} size={36} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-ink truncate leading-tight">
          {r.username}
          {r.is_me && (
            <span className="ml-2 text-[10px] uppercase tracking-[0.16em] text-rose-500 font-bold">
              toi
            </span>
          )}
        </div>
        <div className="text-[11px] text-muted">
          Lvl {r.level} · {r.xp} XP
        </div>
      </div>
      <div className="chip">🏆 {r.badges_count}</div>
    </div>
  );
}

function Avatar({
  name,
  size = 36,
  highlighted = false,
}: {
  name: string;
  size?: number;
  highlighted?: boolean;
}) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div
      className={[
        "rounded-2xl flex items-center justify-center font-display font-semibold text-white shadow-md",
        highlighted ? "ring-4 ring-peach-200" : "",
      ].join(" ")}
      style={{
        width: size,
        height: size,
        background: "var(--grad-sunrise)",
        fontSize: size * 0.42,
      }}
    >
      {initial}
    </div>
  );
}
