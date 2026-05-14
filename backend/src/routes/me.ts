import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authenticateToken } from "../middleware/authenticateToken";

const router = Router();

router.get("/", authenticateToken, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "unauthenticated" });
  }
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      username: true,
      email: true,
      xp: true,
      gems: true,
      level: true,
      created_at: true,
    },
  });
  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }
  return res.json({ user });
});

export default router;
