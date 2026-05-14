import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listHabits, checkinHabit, uncheckinHabit } from "../api/habits";
import { me } from "../api/auth";
import { createMood } from "../api/mood";
import { getTodayEntry, upsertTodayEntry } from "../api/journal";
import { HabitCard } from "../components/HabitCard";
import { MoodPicker } from "../components/MoodPicker";
import { EnergySlider } from "../components/EnergySlider";
import { CheckInAnimation, type Burst } from "../components/CheckInAnimation";
import { useAuthStore } from "../store/authStore";
import { useRewardQueue } from "../store/rewardQueue";

export default function Dashboard() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const pushRewards = useRewardQueue((s) => s.push);
  const [burst, setBurst] = useState<Burst | null>(null);
  const [journalContent, setJournalContent] = useState("");
  const [energy, setEnergy] = useState(3);
  const [journalSaved, setJournalSaved] = useState(false);

  const meQuery = useQuery({ queryKey: ["me"], queryFn: me });
  useEffect(() => {
    if (meQuery.data?.user) setUser(meQuery.data.user);
  }, [meQuery.data, setUser]);

  const habitsQuery = useQuery({ queryKey: ["habits"], queryFn: listHabits });

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
        if (rewards.length) {
          setTimeout(() => pushRewards(rewards), 1500);
        }
        qc.invalidateQueries({ queryKey: ["badges"] });
      }
    },
  });

  const mood = useMutation({
    mutationFn: createMood,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["mood-stats"] });
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
      setTimeout(() => setJournalSaved(false), 2000);
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

  return (
    <div className="space-y-8">
      <CheckInAnimation burst={burst} onDone={() => setBurst(null)} />

      <section>
        <h2 className="text-xl font-semibold mb-3 text-ink-900">Aujourd'hui</h2>
        {habitsQuery.isLoading && (
          <div className="space-y-2">
            <div className="skeleton h-16" />
            <div className="skeleton h-16" />
          </div>
        )}
        {!habitsQuery.isLoading && habits.length === 0 && (
          <div className="card p-6 text-center text-muted">
            Aucune habitude pour l'instant. Ajoutes-en depuis l'onglet ✅ Habitudes.
          </div>
        )}
        <div className="space-y-2">
          {habits.map((h) => (
            <HabitCard key={h.id} habit={h} onToggle={toggle} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3 text-ink-900">Humeur du jour</h2>
        <MoodPicker
          onPick={async (m, s) => {
            await mood.mutateAsync({ mood: m, score: s });
          }}
        />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3 text-ink-900">Journal</h2>
        <div className="card p-4 space-y-4">
          <textarea
            value={journalContent}
            onChange={(e) => setJournalContent(e.target.value)}
            placeholder="Comment s'est passée ta journée ?"
            rows={5}
            className="w-full bg-pulse-50 border border-pulse-100 rounded-xl p-3 text-ink-900 focus:outline-none focus:border-pulse-400 resize-none"
          />
          <EnergySlider value={energy} onChange={setEnergy} />
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-600">
              {journalSaved ? "✓ Sauvegardé" : ""}
            </span>
            <button
              onClick={() =>
                journal.mutate({ content: journalContent, energy_level: energy })
              }
              disabled={journal.isPending || journalContent.trim().length === 0}
              className="btn-primary text-sm"
            >
              {journal.isPending ? "…" : "Sauvegarder"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
