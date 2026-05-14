import { Badge, Prisma, PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "../lib/prisma";

type Tx = Prisma.TransactionClient | PrismaClient;

export type BadgeEvent =
  | { event: "checkin"; new_streak: number }
  | { event: "level_up"; new_level: number }
  | { event: "mood_logged" }
  | { event: "journal_written" };

export type AwardedBadge = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  earned_at: Date;
};

async function evaluateBadge(
  tx: Tx,
  user_id: string,
  badge: Badge,
  ctx: BadgeEvent
): Promise<boolean> {
  switch (badge.condition_type) {
    case "first_checkin": {
      if (ctx.event !== "checkin") return false;
      const count = await tx.habitLog.count({
        where: { completed: true, habit: { user_id } },
      });
      return count >= 1;
    }
    case "streak_N": {
      if (ctx.event !== "checkin") return false;
      return ctx.new_streak >= badge.condition_value;
    }
    case "total_checkins_N": {
      if (ctx.event !== "checkin") return false;
      const count = await tx.habitLog.count({
        where: { completed: true, habit: { user_id } },
      });
      return count >= badge.condition_value;
    }
    case "level_N": {
      if (ctx.event !== "level_up") return false;
      return ctx.new_level >= badge.condition_value;
    }
    case "mood_logged_N": {
      if (ctx.event !== "mood_logged") return false;
      const count = await tx.moodLog.count({ where: { user_id } });
      return count >= badge.condition_value;
    }
    case "journal_written_N": {
      if (ctx.event !== "journal_written") return false;
      const count = await tx.journalEntry.count({ where: { user_id } });
      return count >= badge.condition_value;
    }
    default:
      return false;
  }
}

const TYPES_FOR_EVENT: Record<BadgeEvent["event"], string[]> = {
  checkin: ["first_checkin", "streak_N", "total_checkins_N"],
  level_up: ["level_N"],
  mood_logged: ["mood_logged_N"],
  journal_written: ["journal_written_N"],
};

export async function checkAndAwardBadges(
  user_id: string,
  ctx: BadgeEvent,
  client?: Tx
): Promise<AwardedBadge[]> {
  const tx = client ?? defaultPrisma;
  const types = TYPES_FOR_EVENT[ctx.event];
  const candidates = await tx.badge.findMany({
    where: { condition_type: { in: types } },
  });
  if (candidates.length === 0) return [];

  const owned = await tx.userBadge.findMany({
    where: { user_id, badge_id: { in: candidates.map((b) => b.id) } },
    select: { badge_id: true },
  });
  const ownedSet = new Set(owned.map((b) => b.badge_id));

  const awarded: AwardedBadge[] = [];
  for (const badge of candidates) {
    if (ownedSet.has(badge.id)) continue;
    const earned = await evaluateBadge(tx, user_id, badge, ctx);
    if (!earned) continue;
    const ub = await tx.userBadge.create({
      data: { user_id, badge_id: badge.id },
    });
    awarded.push({
      id: badge.id,
      slug: badge.slug,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      rarity: badge.rarity,
      earned_at: ub.earned_at,
    });
  }
  return awarded;
}

export async function progressFor(
  user_id: string,
  badge: Badge,
  client?: Tx
): Promise<{ current: number; target: number } | null> {
  const tx = client ?? defaultPrisma;
  const target = badge.condition_value;
  switch (badge.condition_type) {
    case "first_checkin": {
      const count = await tx.habitLog.count({
        where: { completed: true, habit: { user_id } },
      });
      return { current: Math.min(count, 1), target: 1 };
    }
    case "total_checkins_N": {
      const count = await tx.habitLog.count({
        where: { completed: true, habit: { user_id } },
      });
      return { current: count, target };
    }
    case "mood_logged_N": {
      const count = await tx.moodLog.count({ where: { user_id } });
      return { current: count, target };
    }
    case "journal_written_N": {
      const count = await tx.journalEntry.count({ where: { user_id } });
      return { current: count, target };
    }
    case "streak_N": {
      const best = await tx.habit.aggregate({
        where: { user_id },
        _max: { streak_best: true },
      });
      return { current: best._max.streak_best ?? 0, target };
    }
    case "level_N": {
      const user = await tx.user.findUnique({
        where: { id: user_id },
        select: { level: true },
      });
      return { current: user?.level ?? 1, target };
    }
    default:
      return null;
  }
}
