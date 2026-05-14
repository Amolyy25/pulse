import type { Rarity } from "../types/badge";

export const RARITY_META: Record<Rarity, { label: string; color: string; ring: string; chip: string }> = {
  common: {
    label: "Common",
    color: "#94a3b8",
    ring: "ring-slate-500/40",
    chip: "bg-slate-700/60 text-slate-200",
  },
  rare: {
    label: "Rare",
    color: "#60a5fa",
    ring: "ring-blue-500/50",
    chip: "bg-blue-700/40 text-blue-200",
  },
  epic: {
    label: "Epic",
    color: "#c084fc",
    ring: "ring-purple-500/50",
    chip: "bg-purple-700/40 text-purple-200",
  },
  legendary: {
    label: "Legendary",
    color: "#fbbf24",
    ring: "ring-amber-400/60",
    chip: "bg-amber-600/40 text-amber-200",
  },
};
