import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authenticateToken } from "../middleware/authenticateToken";

const router = Router();
router.use(authenticateToken);

router.get("/", async (req: Request, res: Response) => {
  const me_id = req.user!.id;
  const users = await prisma.user.findMany({
    orderBy: [{ xp: "desc" }, { created_at: "asc" }],
    take: 10,
    select: {
      id: true,
      username: true,
      level: true,
      xp: true,
      _count: { select: { badges: true } },
    },
  });
  const leaderboard = users.map((u, idx) => ({
    rank: idx + 1,
    user_id: u.id,
    username: u.username,
    level: u.level,
    xp: u.xp,
    badges_count: u._count.badges,
    is_me: u.id === me_id,
  }));
  return res.json({ leaderboard });
});

export default router;
