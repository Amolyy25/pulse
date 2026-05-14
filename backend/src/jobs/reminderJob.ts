import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { sendReminder } from "../services/notificationService";
import { startOfUtcDay } from "../lib/dates";

export function startReminderJob() {
  cron.schedule(
    "0 20 * * *",
    async () => {
      try {
        const now = new Date();
        const today = startOfUtcDay(now);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const recentlyActive = await prisma.habit.groupBy({
          by: ["user_id"],
          where: { is_active: true, created_at: { gte: sevenDaysAgo } },
          _count: { _all: true },
        });

        for (const row of recentlyActive) {
          const user_id = row.user_id;
          const totalActive = await prisma.habit.count({
            where: { user_id, is_active: true },
          });
          if (totalActive === 0) continue;

          const completedToday = await prisma.habitLog.count({
            where: {
              completed: true,
              log_date: today,
              habit: { user_id, is_active: true },
            },
          });

          if (completedToday < totalActive) {
            await sendReminder(user_id, {
              title: "💪 Encore quelques habitudes !",
              body: "Tu as des habitudes à valider aujourd'hui.",
              url: "/dashboard",
            });
          }
        }
        console.log(`[cron] reminder job processed ${recentlyActive.length} users`);
      } catch (err) {
        console.error("[cron] reminder job error", err);
      }
    },
    { timezone: "Europe/Paris" }
  );
  console.log("[cron] reminder job scheduled for 20:00 Europe/Paris");
}
