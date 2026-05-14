import { useState } from "react";
import type { Mood } from "../types/mood";

const OPTIONS: { mood: Mood; emoji: string; score: number; label: string; tint: string; ring: string }[] = [
  { mood: "terrible", emoji: "😫", score: 1, label: "Rude", tint: "card-tinted-rose", ring: "ring-rose-300/60" },
  { mood: "bad", emoji: "😔", score: 2, label: "Bof", tint: "card-tinted-peach", ring: "ring-peach-300/60" },
  { mood: "neutral", emoji: "😐", score: 3, label: "OK", tint: "card-tinted-butter", ring: "ring-butter-300/70" },
  { mood: "good", emoji: "😊", score: 4, label: "Bien", tint: "card-tinted-lav", ring: "ring-lavender-300/60" },
  { mood: "amazing", emoji: "🤩", score: 5, label: "Top", tint: "card-tinted-mint", ring: "ring-mint-300/60" },
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
      setTimeout(() => setPicked(null), 2400);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="grid grid-cols-5 gap-2">
      {OPTIONS.map((o) => {
        const isPicked = picked === o.mood;
        const isPending = pending === o.mood;
        return (
          <button
            key={o.mood}
            onClick={() => handle(o)}
            disabled={!!pending}
            className={[
              "relative aspect-square rounded-2xl border transition flex flex-col items-center justify-center gap-1 group",
              o.tint,
              "hover:-translate-y-0.5",
              isPicked ? `ring-4 ${o.ring}` : "",
              isPending ? "opacity-60" : "",
            ].join(" ")}
          >
            <span className="text-[26px] sm:text-[28px] leading-none transition-transform group-hover:scale-110">
              {o.emoji}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
