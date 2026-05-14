import { Router, Request, Response } from "express";
import { ZodError } from "zod";
import { prisma } from "../lib/prisma";
import { authenticateToken } from "../middleware/authenticateToken";
import { createRoutineSchema, updateRoutineSchema } from "../schemas/routine";

const router = Router();
router.use(authenticateToken);

router.get("/", async (req: Request, res: Response) => {
  const user_id = req.user!.id;
  const routines = await prisma.routine.findMany({
    where: { user_id, is_active: true },
    orderBy: { created_at: "asc" },
  });
  return res.json({ routines });
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const user_id = req.user!.id;
    const input = createRoutineSchema.parse(req.body);
    const routine = await prisma.routine.create({
      data: {
        user_id,
        name: input.name,
        type: input.type ?? "morning",
        steps: input.steps,
      },
    });
    return res.status(201).json({ routine });
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
    const input = updateRoutineSchema.parse(req.body);
    const existing = await prisma.routine.findFirst({
      where: { id: req.params.id, user_id },
    });
    if (!existing) return res.status(404).json({ error: "routine not found" });
    const routine = await prisma.routine.update({
      where: { id: existing.id },
      data: input,
    });
    return res.json({ routine });
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
  const existing = await prisma.routine.findFirst({
    where: { id: req.params.id, user_id },
  });
  if (!existing) return res.status(404).json({ error: "routine not found" });
  await prisma.routine.delete({ where: { id: existing.id } });
  return res.json({ ok: true });
});

export default router;
