import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authenticateToken } from "../middleware/authenticateToken";
import { addDays, isoDate, startOfUtcDay } from "../lib/dates";

const router = Router();
router.use(authenticateToken);

router.get("/", async (req: Request, res: Response) => {
  const user_id = req.user!.id;
  const today = startOfUtcDay();
  const weekStart = addDays(today, -6);

  const habits = await prisma.habit.findMany({
    where: { user_id, is_active: true },
    select: { id: true, name: true, streak_current: true, streak_best: true },
  });

  const habit_ids = habits.map((h) => h.id);

  const todayLogs = habit_ids.length
    ? await prisma.habitLog.findMany({
        where: { habit_id: { in: habit_ids }, log_date: today, completed: true },
        select: { habit_id: true },
      })
    : [];

  const total = habits.length;
  const completed = todayLogs.length;
  const completion_rate = total === 0 ? 0 : completed / total;

  const best_overall = habits.reduce((m, h) => Math.max(m, h.streak_best), 0);
  const active_streaks = habits
    .filter((h) => h.streak_current > 0)
    .sort((a, b) => b.streak_current - a.streak_current)
    .slice(0, 5)
    .map((h) => ({ habit_name: h.name, streak: h.streak_current }));

  const weekLogs = habit_ids.length
    ? await prisma.habitLog.findMany({
        where: {
          habit_id: { in: habit_ids },
          log_date: { gte: weekStart, lte: today },
          completed: true,
        },
        select: { habit_id: true, log_date: true },
      })
    : [];

  const dailyCounts = new Map<string, number>();
  for (const l of weekLogs) {
    const key = isoDate(l.log_date);
    dailyCounts.set(key, (dailyCounts.get(key) ?? 0) + 1);
  }

  const current_week: { date: string; completed: number; total: number; rate: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(weekStart, i);
    const key = isoDate(d);
    const c = dailyCounts.get(key) ?? 0;
    current_week.push({
      date: key,
      completed: c,
      total,
      rate: total === 0 ? 0 : c / total,
    });
  }

  const xp_history = current_week.map((d) => ({
    date: d.date,
    xp: d.completed * 10,
  }));

  return res.json({
    habits_today: { total, completed, completion_rate: Number(completion_rate.toFixed(2)) },
    streaks: { best_overall, active_streaks },
    xp_history,
    current_week,
  });
});

export default router;
