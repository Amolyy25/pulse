import { Router, Request, Response } from "express";
import { z, ZodError } from "zod";
import { prisma } from "../lib/prisma";
import { authenticateToken } from "../middleware/authenticateToken";
import { sendReminder } from "../services/notificationService";

const router = Router();

router.get("/vapid-key", (_req: Request, res: Response) => {
  return res.json({ publicKey: process.env.VAPID_PUBLIC_KEY ?? null });
});

router.use(authenticateToken);

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

router.post("/subscribe", async (req: Request, res: Response) => {
  try {
    const user_id = req.user!.id;
    const { endpoint, keys } = subscribeSchema.parse(req.body);
    const sub = await prisma.pushSubscription.upsert({
      where: { user_id_endpoint: { user_id, endpoint } },
      update: { p256dh: keys.p256dh, auth: keys.auth },
      create: {
        user_id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });
    return res.status(201).json({ id: sub.id });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: "validation failed", details: err.flatten() });
    }
    console.error(err);
    return res.status(500).json({ error: "internal error" });
  }
});

router.delete("/unsubscribe", async (req: Request, res: Response) => {
  const user_id = req.user!.id;
  const endpoint = (req.body?.endpoint as string | undefined)?.trim();
  if (endpoint) {
    await prisma.pushSubscription
      .delete({ where: { user_id_endpoint: { user_id, endpoint } } })
      .catch(() => null);
  } else {
    await prisma.pushSubscription.deleteMany({ where: { user_id } });
  }
  return res.json({ ok: true });
});

router.post("/test", async (req: Request, res: Response) => {
  const user_id = req.user!.id;
  const result = await sendReminder(user_id, {
    title: "🔔 Test Pulse",
    body: "Si tu vois ce message, les notifications sont actives !",
    url: "/dashboard",
  });
  return res.json(result);
});

export default router;
