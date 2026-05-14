import { prisma } from "../lib/prisma";
import { configureWebPush, isPushConfigured, webpush } from "../lib/webpush";

export type NotificationPayload = {
  title: string;
  body: string;
  url?: string;
  icon?: string;
};

export async function sendReminder(
  user_id: string,
  payload: NotificationPayload
): Promise<{ sent: number; failed: number }> {
  configureWebPush();
  if (!isPushConfigured()) return { sent: 0, failed: 0 };

  const subs = await prisma.pushSubscription.findMany({ where: { user_id } });
  if (subs.length === 0) return { sent: 0, failed: 0 };

  const json = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url ?? "/dashboard",
    icon: payload.icon,
  });

  let sent = 0;
  let failed = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          },
          json
        );
        sent += 1;
      } catch (err: unknown) {
        failed += 1;
        const code = (err as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) {
          await prisma.pushSubscription
            .delete({ where: { id: s.id } })
            .catch(() => null);
        } else {
          console.error("[push] send error", err);
        }
      }
    })
  );

  return { sent, failed };
}
