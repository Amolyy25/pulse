import { Router, Request, Response } from "express";
import { ZodError } from "zod";
import { prisma } from "../lib/prisma";
import { authenticateToken } from "../middleware/authenticateToken";
import { createHabitSchema, updateHabitSchema } from "../schemas/habit";
import { computeStreak } from "../lib/streak";
import { levelFromXp } from "../lib/level";
import { startOfUtcDay } from "../lib/dates";
import { checkAndAwardBadges } from "../services/badgeService";

const router = Router();
router.use(authenticateToken);

router.get("/", async (req: Request, res: Response) => {
  const user_id = req.user!.id;
  const today = startOfUtcDay();
  const habits = await prisma.habit.findMany({
    where: { user_id, is_active: true },
    orderBy: [{ order: "asc" }, { created_at: "asc" }],
    include: {
      logs: {
        where: { log_date: today },
        take: 1,
      },
    },
  });
  const result = habits.map((h) => ({
    id: h.id,
    name: h.name,
    icon: h.icon,
    color: h.color,
    frequency: h.frequency,
    frequency_days: h.frequency_days,
    streak_current: h.streak_current,
    streak_best: h.streak_best,
    is_active: h.is_active,
    order: h.order,
    created_at: h.created_at,
    today_log: h.logs[0]
      ? { completed: h.logs[0].completed, note: h.logs[0].note }
      : null,
    completed_today: h.logs[0]?.completed ?? false,
  }));
  return res.json({ habits: result });
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const user_id = req.user!.id;
    const input = createHabitSchema.parse(req.body);
    const last = await prisma.habit.findFirst({
      where: { user_id },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const nextOrder = (last?.order ?? -1) + 1;
    const habit = await prisma.habit.create({
      data: {
        user_id,
        name: input.name,
        icon: input.icon ?? "⭐",
        color: input.color ?? "#a78bfa",
        frequency: input.frequency ?? "daily",
        frequency_days: input.frequency_days ?? [],
        order: nextOrder,
      },
    });
    return res.status(201).json({ habit });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: "validation failed", details: err.flatten() });
    }
    console.error(err);
    return res.status(500).json({ error: "internal error" });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const user_id = req.user!.id;
    const input = updateHabitSchema.parse(req.body);
    const existing = await prisma.habit.findFirst({
      where: { id: req.params.id, user_id },
    });
    if (!existing) return res.status(404).json({ error: "habit not found" });
    const habit = await prisma.habit.update({
      where: { id: existing.id },
      data: input,
    });
    return res.json({ habit });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: "validation failed", details: err.flatten() });
    }
    console.error(err);
    return res.status(500).json({ error: "internal error" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const user_id = req.user!.id;
  const existing = await prisma.habit.findFirst({
    where: { id: req.params.id, user_id },
  });
  if (!existing) return res.status(404).json({ error: "habit not found" });
  await prisma.habit.update({
    where: { id: existing.id },
    data: { is_active: false },
  });
  return res.json({ ok: true });
});

router.post("/:id/checkin", async (req: Request, res: Response) => {
  const user_id = req.user!.id;
  const today = startOfUtcDay();

  const result = await prisma.$transaction(async (tx) => {
    const habit = await tx.habit.findFirst({
      where: { id: req.params.id, user_id },
    });
    if (!habit) return { error: "habit not found" as const };

    await tx.habitLog.upsert({
      where: { habit_id_log_date: { habit_id: habit.id, log_date: today } },
      update: { completed: true },
      create: { habit_id: habit.id, log_date: today, completed: true },
    });

    const streak = await computeStreak(tx, habit.id);
    const streak_best = Math.max(habit.streak_best, streak);

    const xp_earned = 10;
    const gems_earned = streak > 0 && streak % 7 === 0 ? 1 : 0;

    const updatedHabit = await tx.habit.update({
      where: { id: habit.id },
      data: { streak_current: streak, streak_best },
    });

    const user = await tx.user.findUniqueOrThrow({ where: { id: user_id } });
    const newXp = user.xp + xp_earned;
    const newGems = user.gems + gems_earned;
    const newLevel = levelFromXp(newXp);
    const leveled_up = newLevel > user.level;

    const updatedUser = await tx.user.update({
      where: { id: user_id },
      data: { xp: newXp, gems: newGems, level: newLevel },
      select: { xp: true, gems: true, level: true },
    });

    const checkinBadges = await checkAndAwardBadges(
      user_id,
      { event: "checkin", new_streak: streak },
      tx
    );
    const levelBadges = leveled_up
      ? await checkAndAwardBadges(
          user_id,
          { event: "level_up", new_level: newLevel },
          tx
        )
      : [];

    return {
      habit: updatedHabit,
      xp_earned,
      gems_earned,
      leveled_up,
      user: updatedUser,
      new_badges: [...checkinBadges, ...levelBadges],
    };
  });

  if ("error" in result) return res.status(404).json({ error: result.error });
  return res.json(result);
});

router.delete("/:id/checkin", async (req: Request, res: Response) => {
  const user_id = req.user!.id;
  const today = startOfUtcDay();

  const result = await prisma.$transaction(async (tx) => {
    const habit = await tx.habit.findFirst({
      where: { id: req.params.id, user_id },
    });
    if (!habit) return { error: "habit not found" as const };

    await tx.habitLog
      .delete({
        where: { habit_id_log_date: { habit_id: habit.id, log_date: today } },
      })
      .catch(() => null);

    const streak = await computeStreak(tx, habit.id);
    const updatedHabit = await tx.habit.update({
      where: { id: habit.id },
      data: { streak_current: streak },
    });
    return { habit: updatedHabit };
  });

  if ("error" in result) return res.status(404).json({ error: result.error });
  return res.json(result);
});

export default router;
