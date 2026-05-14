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
      className={[
        "group relative w-full text-left p-4 rounded-2xl border transition overflow-hidden card-hover",
        completed
          ? "card-tinted-mint"
          : "bg-paper hairline border",
        flash ? "animate-flash-green" : "",
        bounce ? "animate-card-bounce" : "",
        "disabled:opacity-80",
      ].join(" ")}
    >
      {/* Color rail */}
      <span
        aria-hidden
        className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-opacity"
        style={{ background: habit.color, opacity: completed ? 1 : 0.45 }}
      />

      <div className="flex items-center gap-3 pl-2">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-[20px] transition-transform group-hover:rotate-[-4deg]"
          style={{ background: `${habit.color}24`, boxShadow: `inset 0 0 0 1px ${habit.color}3a` }}
        >
          {habit.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-ink truncate leading-tight">
            {habit.name}
          </div>
          <div className="text-[12px] text-muted flex items-center gap-2 mt-0.5">
            <span className="inline-flex items-center gap-1">
              <FlameIcon /> {habit.streak_current}
              <span className="text-[11px] text-muted/70">jours</span>
            </span>
            {habit.streak_best > habit.streak_current && habit.streak_best > 0 && (
              <span className="text-muted/70">· record {habit.streak_best}</span>
            )}
          </div>
        </div>

        <Checkmark active={completed} />
      </div>
    </button>
  );
}

function FlameIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2c1.5 3 5 4.5 5 9a5 5 0 1 1-10 0c0-2.2 1.5-3.4 1.5-5 1 .8 1.5 1.6 1.5 2.6C10 6 11 4 12 2Z"
        fill="url(#sunrise-fill)"
        stroke="#f3622b"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Checkmark({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={[
        "relative w-9 h-9 rounded-full flex items-center justify-center transition-all",
        active
          ? "text-white"
          : "bg-white border border-hairline text-transparent group-hover:border-peach-300",
      ].join(" ")}
      style={
        active
          ? { background: "var(--grad-mint)", boxShadow: "0 6px 14px -6px rgba(46, 170, 102, 0.45)" }
          : undefined
      }
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="m5 12 5 5 9-11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
