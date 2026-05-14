import { useQuery } from "@tanstack/react-query";
import { fetchLeaderboard } from "../api/leaderboard";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const q = useQuery({ queryKey: ["leaderboard"], queryFn: fetchLeaderboard });
  const rows = q.data?.leaderboard ?? [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-ink-900">Classement</h2>

      {q.isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-16" />
          ))}
        </div>
      )}
      {!q.isLoading && rows.length === 0 && (
        <div className="card p-6 text-center text-muted">
          Personne ici pour l'instant.
        </div>
      )}

      <div className="space-y-2">
        {rows.map((r) => {
          const initial = r.username.charAt(0).toUpperCase();
          return (
            <div
              key={r.user_id}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition ${
                r.is_me
                  ? "bg-pulse-100 border-pulse-300"
                  : "bg-white border-pulse-100"
              }`}
            >
              <div className="w-9 text-center font-bold text-ink-700">
                {r.rank <= 3 ? MEDALS[r.rank - 1] : `#${r.rank}`}
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pulse-300 to-pulse-500 flex items-center justify-center font-bold text-white">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink-900 truncate">
                  {r.username}
                  {r.is_me && (
                    <span className="ml-2 text-xs text-pulse-500">(toi)</span>
                  )}
                </div>
                <div className="text-xs text-muted">
                  Lvl {r.level} · {r.xp} XP
                </div>
              </div>
              <div className="text-sm text-ink-700 tabular-nums">
                🏆 {r.badges_count}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
