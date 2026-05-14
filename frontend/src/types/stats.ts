export type DashboardStats = {
  habits_today: { total: number; completed: number; completion_rate: number };
  streaks: {
    best_overall: number;
    active_streaks: { habit_name: string; streak: number }[];
  };
  xp_history: { date: string; xp: number }[];
  current_week: { date: string; completed: number; total: number; rate: number }[];
};
