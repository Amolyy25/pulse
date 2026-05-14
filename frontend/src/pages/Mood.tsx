import { useQuery } from "@tanstack/react-query";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { listMoods, moodStats } from "../api/mood";
import type { Mood } from "../types/mood";

const MOOD_META: Record<Mood, { emoji: string; label: string; color: string }> = {
  amazing: { emoji: "🤩", label: "Amazing", color: "#34d399" },
  good: { emoji: "😊", label: "Good", color: "#60a5fa" },
  neutral: { emoji: "😐", label: "Neutral", color: "#a78bfa" },
  bad: { emoji: "😔", label: "Bad", color: "#fbbf24" },
  terrible: { emoji: "😫", label: "Terrible", color: "#f87171" },
};

export default function MoodPage() {
  const moodsQuery = useQuery({ queryKey: ["moods", 90], queryFn: () => listMoods(90) });
  const statsQuery = useQuery({ queryKey: ["mood-stats"], queryFn: moodStats });

  const points = (moodsQuery.data?.moods ?? [])
    .slice()
    .reverse()
    .filter((m) => {
      const ageMs = Date.now() - new Date(m.logged_at).getTime();
      return ageMs <= 30 * 24 * 60 * 60 * 1000;
    })
    .map((m) => ({
      date: new Date(m.logged_at).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      }),
      score: m.score,
    }));

  const stats = statsQuery.data;
  const total30 = stats
    ? Object.values(stats.mood_distribution).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-ink-900">Mood — 30 derniers jours</h2>

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Moyenne 7j"
          value={stats?.average_score_7d ?? 0}
          suffix=" / 5"
          accent="text-pulse-500"
        />
        <StatCard
          label="Moyenne 30j"
          value={stats?.average_score_30d ?? 0}
          suffix=" / 5"
          accent="text-pulse-400"
        />
      </div>

      <div className="card p-4">
        <h3 className="text-sm text-muted mb-3">Évolution</h3>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <LineChart data={points}>
              <CartesianGrid stroke="#fae8ff" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
              <YAxis domain={[1, 5]} stroke="#9ca3af" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid #f5d0fe",
                  borderRadius: 8,
                  color: "#3b0764",
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#d946ef"
                strokeWidth={2}
                dot={{ r: 3, fill: "#d946ef" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="text-sm text-muted mb-3">Répartition</h3>
        <div className="space-y-2">
          {(Object.keys(MOOD_META) as Mood[]).map((m) => {
            const count = stats?.mood_distribution[m] ?? 0;
            const pct = total30 === 0 ? 0 : (count / total30) * 100;
            const meta = MOOD_META[m];
            return (
              <div key={m} className="flex items-center gap-3">
                <span className="text-xl w-7">{meta.emoji}</span>
                <span className="w-20 text-sm text-ink-700">{meta.label}</span>
                <div className="flex-1 h-2 bg-pulse-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: meta.color }}
                  />
                </div>
                <span className="text-sm text-muted w-10 text-right tabular-nums">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: number;
  suffix?: string;
  accent: string;
}) {
  return (
    <div className="card p-4">
      <div className="text-xs text-muted mb-1">{label}</div>
      <div className={`text-2xl font-bold ${accent}`}>
        {value.toFixed(2)}
        {suffix}
      </div>
    </div>
  );
}
