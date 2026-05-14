import { useState } from "react";
import type { Habit } from "../types/habit";

export function HabitCard({
  habit,
  onToggle,
}: {
  habit: Habit;
  onToggle: (id: string, currentlyCompleted: boolean) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(false);
  const [bounce, setBounce] = useState(false);
  const completed = habit.completed_today;

  async function handleClick() {
    if (busy) return;
    setBusy(true);
    try {
      await onToggle(habit.id, completed);
      if (!completed) {
        setFlash(true);
        setBounce(true);
        setTimeout(() => setFlash(false), 600);
        setTimeout(() => setBounce(false), 240);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className={`relative w-full text-left p-4 rounded-2xl border transition overflow-hidden
        ${completed
          ? "bg-soft-mint border-emerald-200"
          : "bg-white border-pulse-100 hover:border-pulse-200 shadow-sm"}
        ${flash ? "animate-flash-green" : ""}
        ${bounce ? "animate-card-bounce" : ""}
        disabled:opacity-70`}
      style={{ boxShadow: completed ? `inset 4px 0 0 ${habit.color}` : `inset 4px 0 0 ${habit.color}55` }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ backgroundColor: `${habit.color}33` }}
        >
          {habit.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-ink-900 truncate">{habit.name}</div>
          <div className="text-xs text-muted flex items-center gap-2">
            <span>🔥 {habit.streak_current}d</span>
            {habit.streak_best > habit.streak_current && (
              <span className="text-pulse-400">best {habit.streak_best}d</span>
            )}
          </div>
        </div>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition
            ${completed
              ? "bg-emerald-500 border-emerald-400 text-white"
              : "border-pulse-200 text-transparent"}`}
        >
          ✓
        </div>
      </div>
    </button>
  );
}
