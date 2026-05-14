import { Router, Request, Response } from "express";
import { ZodError } from "zod";
import { prisma } from "../lib/prisma";
import { authenticateToken } from "../middleware/authenticateToken";
import { updateJournalSchema, upsertJournalSchema } from "../schemas/journal";
import { startOfUtcDay } from "../lib/dates";
import { checkAndAwardBadges } from "../services/badgeService";

const router = Router();
router.use(authenticateToken);

router.get("/", async (req: Request, res: Response) => {
  const user_id = req.user!.id;
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? "10"), 10) || 10));
  const skip = (page - 1) * limit;

  const [entries, total] = await Promise.all([
    prisma.journalEntry.findMany({
      where: { user_id },
      orderBy: { entry_date: "desc" },
      skip,
      take: limit,
    }),
    prisma.journalEntry.count({ where: { user_id } }),
  ]);

  return res.json({
    entries,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

router.get("/today", async (req: Request, res: Response) => {
  const user_id = req.user!.id;
  const today = startOfUtcDay();
  const entry = await prisma.journalEntry.findUnique({
    where: { user_id_entry_date: { user_id, entry_date: today } },
  });
  return res.json({ entry });
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const user_id = req.user!.id;
    const input = upsertJournalSchema.parse(req.body);
    const today = startOfUtcDay();
    const entry = await prisma.journalEntry.upsert({
      where: { user_id_entry_date: { user_id, entry_date: today } },
      update: { content: input.content, energy_level: input.energy_level },
      create: {
        user_id,
        entry_date: today,
        content: input.content,
        energy_level: input.energy_level,
      },
    });
    const new_badges = await checkAndAwardBadges(user_id, {
      event: "journal_written",
    });
    return res.status(201).json({ entry, new_badges });
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
    const input = updateJournalSchema.parse(req.body);
    const existing = await prisma.journalEntry.findFirst({
      where: { id: req.params.id, user_id },
    });
    if (!existing) return res.status(404).json({ error: "entry not found" });
    const entry = await prisma.journalEntry.update({
      where: { id: existing.id },
      data: input,
    });
    return res.json({ entry });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: "validation failed", details: err.flatten() });
    }
    console.error(err);
    return res.status(500).json({ error: "internal error" });
  }
});

export default router;
