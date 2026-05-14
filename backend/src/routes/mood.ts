import { Router, Request, Response } from "express";
import { ZodError } from "zod";
import { prisma } from "../lib/prisma";
import { authenticateToken } from "../middleware/authenticateToken";
import { createMoodSchema } from "../schemas/mood";
import { checkAndAwardBadges } from "../services/badgeService";

const router = Router();
router.use(authenticateToken);

router.get("/", async (req: Request, res: Response) => {
  const user_id = req.user!.id;
  const limit = Math.min(365, Math.max(1, parseInt(String(req.query.limit ?? "30"), 10) || 30));
  const moods = await prisma.moodLog.findMany({
    where: { user_id },
    orderBy: { logged_at: "desc" },
    take: limit,
  });
  return res.json({ moods });
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const user_id = req.user!.id;
    const input = createMoodSchema.parse(req.body);
    const mood = await prisma.moodLog.create({
      data: {
        user_id,
        mood: input.mood,
        score: input.score,
        note: input.note,
      },
    });
    const new_badges = await checkAndAwardBadges(user_id, { event: "mood_logged" });
    return res.status(201).json({ mood, new_badges });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: "validation failed", details: err.flatten() });
    }
    console.error(err);
    return res.status(500).json({ error: "internal error" });
  }
});

router.get("/stats", async (req: Request, res: Response) => {
  const user_id = req.user!.id;
  const now = Date.now();
  const since7 = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const since30 = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const [last7, last30] = await Promise.all([
    prisma.moodLog.findMany({
      where: { user_id, logged_at: { gte: since7 } },
      select: { score: true },
    }),
    prisma.moodLog.findMany({
      where: { user_id, logged_at: { gte: since30 } },
      select: { score: true, mood: true },
    }),
  ]);

  const avg = (arr: { score: number }[]) =>
    arr.length === 0 ? 0 : arr.reduce((s, m) => s + m.score, 0) / arr.length;

  const distribution: Record<string, number> = {
    amazing: 0,
    good: 0,
    neutral: 0,
    bad: 0,
    terrible: 0,
  };
  for (const m of last30) {
    distribution[m.mood] = (distribution[m.mood] ?? 0) + 1;
  }

  return res.json({
    average_score_7d: Number(avg(last7).toFixed(2)),
    average_score_30d: Number(avg(last30).toFixed(2)),
    mood_distribution: distribution,
  });
});

export default router;
