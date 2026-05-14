import { useState } from "react";
import type { Mood } from "../types/mood";

const OPTIONS: { mood: Mood; emoji: string; score: number; label: string }[] = [
  { mood: "terrible", emoji: "😫", score: 1, label: "Terrible" },
  { mood: "bad", emoji: "😔", score: 2, label: "Bad" },
  { mood: "neutral", emoji: "😐", score: 3, label: "Neutral" },
  { mood: "good", emoji: "😊", score: 4, label: "Good" },
  { mood: "amazing", emoji: "🤩", score: 5, label: "Amazing" },
];

export function MoodPicker({
  onPick,
}: {
  onPick: (mood: Mood, score: number) => Promise<void> | void;
}) {
  const [pending, setPending] = useState<Mood | null>(null);
  const [picked, setPicked] = useState<Mood | null>(null);

  async function handle(o: (typeof OPTIONS)[number]) {
    if (pending) return;
    setPending(o.mood);
    try {
      await onPick(o.mood, o.score);
      setPicked(o.mood);
      setTimeout(() => setPicked(null), 2000);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex items-center justify-between gap-2">
      {OPTIONS.map((o) => {
        const isPicked = picked === o.mood;
        const isPending = pending === o.mood;
        return (
          <button
            key={o.mood}
            onClick={() => handle(o)}
            disabled={!!pending}
            title={o.label}
            className={`flex-1 aspect-square rounded-2xl text-3xl bg-white border border-pulse-100 hover:border-pulse-300 transition
              ${isPicked ? "border-pulse-400 bg-pulse-100 scale-110" : ""}
              ${isPending ? "opacity-50" : ""}`}
          >
            {o.emoji}
          </button>
        );
      })}
    </div>
  );
}
