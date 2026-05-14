import type { Rarity } from "../types/badge";

export const RARITY_META: Record<
  Rarity,
  { label: string; color: string; ring: string; chip: string; tint: string }
> = {
  common: {
    label: "Commun",
    color: "#8a6a72",
    ring: "ring-hairline",
    chip: "bg-cream text-ink-soft",
    tint: "card-tinted-peach",
  },
  rare: {
    label: "Rare",
    color: "#6f3fd0",
    ring: "ring-lavender-300/60",
    chip: "bg-lavender-100 text-lavender-500",
    tint: "card-tinted-lav",
  },
  epic: {
    label: "Épique",
    color: "#d63e6e",
    ring: "ring-rose-300/60",
    chip: "bg-rose-100 text-rose-500",
    tint: "card-tinted-rose",
  },
  legendary: {
    label: "Légendaire",
    color: "#d99c1c",
    ring: "ring-butter-300/70",
    chip: "bg-butter-100 text-butter-400",
    tint: "card-tinted-butter",
  },
};
