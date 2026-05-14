import { create } from "zustand";
import type { AwardedBadge } from "../types/badge";

type LevelReward = { type: "level"; level: number; gemsBonus: number };
type BadgeReward = { type: "badge"; badge: AwardedBadge };
type Reward = LevelReward | BadgeReward;

type State = {
  queue: Reward[];
  current: Reward | null;
  push: (rewards: Reward[]) => void;
  next: () => void;
};

export const useRewardQueue = create<State>((set, get) => ({
  queue: [],
  current: null,
  push: (rewards) => {
    if (rewards.length === 0) return;
    const all = [...get().queue, ...rewards];
    if (!get().current) {
      set({ current: all[0], queue: all.slice(1) });
    } else {
      set({ queue: all });
    }
  },
  next: () => {
    const q = get().queue;
    if (q.length === 0) {
      set({ current: null });
    } else {
      set({ current: q[0], queue: q.slice(1) });
    }
  },
}));
