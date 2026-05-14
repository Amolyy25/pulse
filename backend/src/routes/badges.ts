import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authenticateToken } from "../middleware/authenticateToken";
import { progressFor } from "../services/badgeService";

const router = Router();
router.use(authenticateToken);

router.get("/", async (req: Request, res: Response) => {
  const user_id = req.user!.id;

  const [badges, userBadges] = await Promise.all([
    prisma.badge.findMany({ orderBy: [{ rarity: "asc" }, { condition_value: "asc" }] }),
    prisma.userBadge.findMany({ where: { user_id } }),
  ]);

  const owned = new Map(userBadges.map((ub) => [ub.badge_id, ub]));

  const result = await Promise.all(
    badges.map(async (b) => {
      const ub = owned.get(b.id);
      const progress = await progressFor(user_id, b);
      return {
        id: b.id,
        slug: b.slug,
        name: b.name,
        description: b.description,
        icon: b.icon,
        rarity: b.rarity,
        condition_type: b.condition_type,
        condition_value: b.condition_value,
        earned: !!ub,
        earned_at: ub?.earned_at ?? null,
        progress,
      };
    })
  );

  return res.json({ badges: result });
});

router.get("/new", async (req: Request, res: Response) => {
  const user_id = req.user!.id;

  const unseen = await prisma.userBadge.findMany({
    where: { user_id, seen: false },
    include: { badge: true },
    orderBy: { earned_at: "desc" },
  });

  if (unseen.length === 0) return res.json({ badges: [] });

  await prisma.userBadge.updateMany({
    where: { user_id, seen: false },
    data: { seen: true },
  });

  return res.json({
    badges: unseen.map((ub) => ({
      id: ub.badge.id,
      slug: ub.badge.slug,
      name: ub.badge.name,
      description: ub.badge.description,
      icon: ub.badge.icon,
      rarity: ub.badge.rarity,
      earned_at: ub.earned_at,
    })),
  });
});

export default router;
