import { api } from "./client";

export async function getVapidKey(): Promise<{ publicKey: string | null }> {
  const r = await api.get<{ publicKey: string | null }>("/api/notifications/vapid-key");
  return r.data;
}

export async function subscribePush(sub: PushSubscriptionJSON): Promise<{ id: string }> {
  const r = await api.post("/api/notifications/subscribe", {
    endpoint: sub.endpoint,
    keys: sub.keys,
  });
  return r.data;
}

export async function unsubscribePush(endpoint?: string): Promise<void> {
  await api.delete("/api/notifications/unsubscribe", {
    data: endpoint ? { endpoint } : {},
  });
}

export async function sendTestNotification(): Promise<{ sent: number; failed: number }> {
  const r = await api.post("/api/notifications/test");
  return r.data;
}
