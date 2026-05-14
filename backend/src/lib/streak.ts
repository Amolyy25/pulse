import { Prisma, PrismaClient } from "@prisma/client";
import { addDays, startOfUtcDay } from "./dates";

type Tx = Prisma.TransactionClient | PrismaClient;

export async function computeStreak(tx: Tx, habit_id: string): Promise<number> {
  const today = startOfUtcDay();
  const logs = await tx.habitLog.findMany({
    where: { habit_id, completed: true },
    orderBy: { log_date: "desc" },
    select: { log_date: true },
  });
  if (logs.length === 0) return 0;

  const dateSet = new Set(
    logs.map((l: { log_date: Date }) => startOfUtcDay(l.log_date).getTime())
  );

  let streak = 0;
  let cursor = today;
  while (dateSet.has(cursor.getTime())) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
