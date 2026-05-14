import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { listMoods, moodStats } from "../api/mood";
import type { Mood } from "../types/mood";

const MOOD_META: Record<Mood, { emoji: string; label: string; color: string }> = {
  amazing: { emoji: "🤩", label: "Top", color: "#2faa66" },
  good: { emoji: "😊", label: "Bien", color: "#8e5fe5" },
  neutral: { emoji: "😐", label: "OK", color: "#d99c1c" },
  bad: { emoji: "😔", label: "Bof", color: "#ff8a4d" },
  terrible: { emoji: "😫", label: "Rude", color: "#d63e6e" },
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
    <div className="space-y-4 stagger pt-2">
      <header>
        <div className="eyebrow">Mood — 30 derniers jours</div>
        <h1 className="display text-[1.7rem] sm:text-[2rem] leading-none mt-1">
          Tes <span className="flourish">humeurs</span>
        </h1>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <StatCard
          label="Moy. 7j"
          value={stats?.average_score_7d ?? 0}
          tint="card-tinted-peach"
        />
        <StatCard
          label="Moy. 30j"
          value={stats?.average_score_30d ?? 0}
          tint="card-tinted-lav"
        />
      </div>

      <div className="card p-5">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <div className="eyebrow">Évolution</div>
            <h3 className="display text-lg leading-none mt-1">30 jours</h3>
          </div>
          <span className="chip">{points.length} pts</span>
        </div>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <AreaChart data={points} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="mood-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f4628a" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#8e5fe5" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#ecdacb" strokeDasharray="3 5" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#8a6a72"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[1, 5]}
                stroke="#8a6a72"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid #ecdacb",
                  borderRadius: 12,
                  color: "#2b1216",
                  fontFamily: "DM Sans",
                  fontSize: 12,
                }}
                cursor={{ stroke: "#f4628a", strokeWidth: 1, strokeDasharray: "3 3" }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#f4628a"
                strokeWidth={2.5}
                fill="url(#mood-area)"
                dot={{ r: 3, fill: "#f4628a", stroke: "white", strokeWidth: 1.5 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <div className="eyebrow">Répartition</div>
            <h3 className="display text-lg leading-none mt-1">Sur 30 jours</h3>
          </div>
          <span className="chip">{total30} entrées</span>
        </div>
        <div className="space-y-3">
          {(Object.keys(MOOD_META) as Mood[]).map((m) => {
            const count = stats?.mood_distribution[m] ?? 0;
            const pct = total30 === 0 ? 0 : (count / total30) * 100;
            const meta = MOOD_META[m];
            return (
              <div key={m} className="flex items-center gap-3">
                <span className="text-xl w-7 text-center">{meta.emoji}</span>
                <span className="w-16 text-sm text-ink-soft">{meta.label}</span>
                <div className="flex-1 h-3 bg-cream rounded-full overflow-hidden border border-hairline">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${meta.color}cc, ${meta.color})`,
                    }}
                  />
                </div>
                <span className="font-mono text-xs text-ink-soft w-10 text-right tabular-nums">
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
  tint,
}: {
  label: string;
  value: number;
  tint: string;
}) {
  return (
    <div className={`card ${tint} p-4`}>
      <div className="eyebrow">{label}</div>
      <div className="editorial-num text-[2.6rem] leading-none mt-2">
        {value.toFixed(1)}
        <span className="text-muted/60 text-lg ml-1">/5</span>
      </div>
    </div>
  );
}
