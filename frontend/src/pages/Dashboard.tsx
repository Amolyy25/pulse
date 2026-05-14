import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listHabits, checkinHabit, uncheckinHabit } from "../api/habits";
import { me } from "../api/auth";
import { createMood } from "../api/mood";
import { getTodayEntry, upsertTodayEntry } from "../api/journal";
import { dashboardStats } from "../api/stats";
import { HabitCard } from "../components/HabitCard";
import { MoodPicker } from "../components/MoodPicker";
import { EnergySlider } from "../components/EnergySlider";
import { CheckInAnimation, type Burst } from "../components/CheckInAnimation";
import { GreetingHero } from "../components/dashboard/GreetingHero";
import { RingProgress } from "../components/dashboard/RingProgress";
import { WeeklyHeatmap } from "../components/dashboard/WeeklyHeatmap";
import { XPBar } from "../components/XPBar";
import { useAuthStore } from "../store/authStore";
import { useRewardQueue } from "../store/rewardQueue";
import { useToast } from "../components/Toast";

export default function Dashboard() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const pushRewards = useRewardQueue((s) => s.push);
  const { toast } = useToast();
  const [burst, setBurst] = useState<Burst | null>(null);
  const [journalContent, setJournalContent] = useState("");
  const [energy, setEnergy] = useState(3);
  const [journalSaved, setJournalSaved] = useState(false);

  const user = useAuthStore((s) => s.user);

  const meQuery = useQuery({ queryKey: ["me"], queryFn: me });
  useEffect(() => {
    if (meQuery.data?.user) setUser(meQuery.data.user);
  }, [meQuery.data, setUser]);

  const habitsQuery = useQuery({ queryKey: ["habits"], queryFn: listHabits });
  const statsQuery = useQuery({ queryKey: ["stats"], queryFn: dashboardStats });

  const journalQuery = useQuery({ queryKey: ["journal-today"], queryFn: getTodayEntry });
  useEffect(() => {
    const e = journalQuery.data?.entry;
    if (e) {
      setJournalContent(e.content);
      setEnergy(e.energy_level);
    }
  }, [journalQuery.data]);

  const checkin = useMutation({
    mutationFn: async (vars: { id: string; on: boolean }) =>
      vars.on ? checkinHabit(vars.id) : uncheckinHabit(vars.id),
    onSuccess: (data, vars) => {
      qc.invalidateQueries({ queryKey: ["habits"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      if (vars.on && "xp_earned" in data) {
        setUser({
          ...useAuthStore.getState().user!,
          xp: data.user.xp,
          gems: data.user.gems,
          level: data.user.level,
        });
        setBurst({
          id: Date.now(),
          xp: data.xp_earned,
          gems: data.gems_earned,
          leveledUp: data.leveled_up,
        });
        const rewards: Parameters<typeof pushRewards>[0] = [];
        if (data.leveled_up) {
          rewards.push({
            type: "level",
            level: data.user.level,
            gemsBonus: data.gems_earned,
          });
        }
        for (const b of data.new_badges ?? []) {
          rewards.push({ type: "badge", badge: b });
        }
        if (rewards.length) setTimeout(() => pushRewards(rewards), 1600);
        qc.invalidateQueries({ queryKey: ["badges"] });
      }
    },
  });

  const mood = useMutation({
    mutationFn: createMood,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["mood-stats"] });
      qc.invalidateQueries({ queryKey: ["moods", 90] });
      toast("Humeur enregistrée ✨", "success");
      if (data.new_badges?.length) {
        pushRewards(data.new_badges.map((b) => ({ type: "badge", badge: b })));
        qc.invalidateQueries({ queryKey: ["badges"] });
      }
    },
  });

  const journal = useMutation({
    mutationFn: upsertTodayEntry,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["journal-today"] });
      qc.invalidateQueries({ queryKey: ["journal"] });
      setJournalSaved(true);
      setTimeout(() => setJournalSaved(false), 2400);
      if (data.new_badges?.length) {
        pushRewards(data.new_badges.map((b) => ({ type: "badge", badge: b })));
        qc.invalidateQueries({ queryKey: ["badges"] });
      }
    },
  });

  async function toggle(id: string, currentlyCompleted: boolean) {
    await checkin.mutateAsync({ id, on: !currentlyCompleted });
  }

  const habits = habitsQuery.data?.habits ?? [];
  const stats = statsQuery.data;
  const completedToday = habits.filter((h) => h.completed_today).length;
  const totalToday = habits.length;

  const topStreak =
    habits.reduce((m, h) => Math.max(m, h.streak_current), 0) || 0;

  return (
    <div className="space-y-3 sm:space-y-4 stagger pt-2 pb-4">
      <CheckInAnimation burst={burst} onDone={() => setBurst(null)} />

      {/* Greeting hero */}
      <GreetingHero
        username={user?.username ?? "..."}
        topStreak={topStreak}
        level={user?.level ?? 1}
      />

      {/* Bento row: ring + XP/heat */}
      <section className="bento">
        <div className="sm:col-span-7 col-span-12 card card-tinted-lav p-5 sm:p-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left order-2 sm:order-1 w-full sm:w-auto">
              <span className="eyebrow">Progression</span>
              <h2 className="display text-2xl mt-1 mb-2 sm:mb-3 text-ink">
                Tes <span className="flourish">habitudes</span>
              </h2>
              <p className="text-sm text-ink-soft max-w-[16rem] mx-auto sm:mx-0">
                {totalToday === 0
                  ? "Crée ta première habitude pour démarrer."
                  : completedToday === totalToday
                    ? "Tout coché aujourd'hui. Magnifique."
                    : `Encore ${totalToday - completedToday} à valider.`}
              </p>
            </div>
            <div className="order-1 sm:order-2 shrink-0">
              <RingProgress done={completedToday} total={totalToday} size={148} />
            </div>
          </div>
        </div>

        <div className="sm:col-span-5 col-span-12 grid grid-cols-1 gap-3 sm:gap-4">
          <div className="card p-4 sm:p-5">
            <span className="eyebrow">Expérience</span>
            <div className="mt-2">
              <XPBar xp={user?.xp ?? 0} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-cream py-2 border border-hairline">
                <div className="editorial-num text-2xl">{user?.xp ?? 0}</div>
                <div className="eyebrow text-[9px]">XP total</div>
              </div>
              <div className="rounded-xl bg-cream py-2 border border-hairline">
                <div className="editorial-num text-2xl">{user?.gems ?? 0}</div>
                <div className="eyebrow text-[9px]">💎 Gems</div>
              </div>
            </div>
          </div>

          {stats && (
            <WeeklyHeatmap
              week={stats.current_week.map((d) => ({ date: d.date, rate: d.rate }))}
            />
          )}
        </div>
      </section>

      {/* Habits list */}
      <section className="space-y-3">
        <SectionHeader
          eyebrow="À faire"
          title="Aujourd'hui"
          action={
            <Link to="/habits" className="btn-ghost text-xs">
              Gérer →
            </Link>
          }
        />
        {habitsQuery.isLoading && (
          <div className="space-y-2">
            <div className="skeleton h-[72px]" />
            <div className="skeleton h-[72px]" />
          </div>
        )}
        {!habitsQuery.isLoading && habits.length === 0 && <EmptyHabits />}
        <div className="space-y-2">
          {habits.map((h) => (
            <HabitCard key={h.id} habit={h} onToggle={toggle} />
          ))}
        </div>
      </section>

      {/* Mood + Journal bento */}
      <section className="bento">
        <div className="sm:col-span-5 col-span-12 card p-4 sm:p-5">
          <SectionHeader eyebrow="Humeur" title="Ça va ?" tight />
          <div className="mt-3">
            <MoodPicker
              onPick={async (m, s) => {
                await mood.mutateAsync({ mood: m, score: s });
              }}
            />
          </div>
        </div>

        <div className="sm:col-span-7 col-span-12 card p-4 sm:p-5 relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-60 blur-2xl"
            style={{ background: "var(--grad-amber)" }}
          />
          <SectionHeader eyebrow="Journal" title="Quelques mots" tight />
          <textarea
            value={journalContent}
            onChange={(e) => setJournalContent(e.target.value)}
            placeholder="Une pensée, un moment, une intention…"
            rows={4}
            className="mt-3 w-full bg-cream border border-hairline rounded-xl p-3 text-ink focus:outline-none focus:border-peach-300 focus:ring-4 focus:ring-peach-200/40 resize-none font-display text-[15px] leading-relaxed"
          />
          <div className="mt-3">
            <EnergySlider value={energy} onChange={setEnergy} />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-mint-500 font-semibold transition-opacity">
              {journalSaved ? "✓ Sauvegardé" : ""}
            </span>
            <button
              onClick={() =>
                journal.mutate({ content: journalContent, energy_level: energy })
              }
              disabled={journal.isPending || journalContent.trim().length === 0}
              className="btn-primary"
            >
              {journal.isPending ? "…" : "Sauvegarder"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  action,
  tight = false,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
  tight?: boolean;
}) {
  return (
    <div className={`flex items-end justify-between ${tight ? "" : "mb-1"}`}>
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2 className="display text-[1.4rem] text-ink leading-none mt-1">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function EmptyHabits() {
  return (
    <div className="card card-tinted-butter p-6 text-center relative overflow-hidden">
      <div className="text-4xl mb-2">🌱</div>
      <h3 className="display text-lg mb-1">Page blanche</h3>
      <p className="text-sm text-ink-soft mb-4 max-w-xs mx-auto">
        Crée ta première habitude — quelque chose de petit pour commencer.
      </p>
      <Link to="/habits" className="btn-primary">
        + Nouvelle habitude
      </Link>
    </div>
  );
}
