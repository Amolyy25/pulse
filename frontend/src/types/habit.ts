export type Frequency = "daily" | "weekly" | "custom";

export type Habit = {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: Frequency;
  frequency_days: number[];
  streak_current: number;
  streak_best: number;
  is_active: boolean;
  order: number;
  created_at: string;
  today_log: { completed: boolean; note: string | null } | null;
  completed_today: boolean;
};

import type { AwardedBadge } from "./badge";

export type CheckinResponse = {
  habit: Habit;
  xp_earned: number;
  gems_earned: number;
  leveled_up: boolean;
  user: { xp: number; gems: number; level: number };
  new_badges: AwardedBadge[];
};
