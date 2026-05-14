/// <reference lib="webworker" />
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { NetworkFirst, CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url }) => url.pathname.startsWith("/api/"),
  new NetworkFirst({
    cacheName: "pulse-api",
    networkTimeoutSeconds: 5,
    plugins: [new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 60 * 60 })],
  })
);

registerRoute(
  ({ request }) =>
    request.destination === "image" ||
    request.destination === "font" ||
    request.destination === "style" ||
    request.destination === "script",
  new CacheFirst({
    cacheName: "pulse-static",
    plugins: [
      new ExpirationPlugin({ maxEntries: 128, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

registerRoute(
  new NavigationRoute(new NetworkFirst({ cacheName: "pulse-pages", networkTimeoutSeconds: 4 }))
);

self.addEventListener("push", (event) => {
  let payload: { title?: string; body?: string; icon?: string; url?: string } = {};
  try {
    payload = event.data?.json() ?? {};
  } catch {
    payload = { title: "Pulse", body: event.data?.text() ?? "" };
  }
  const title = payload.title ?? "Pulse";
  const options: NotificationOptions = {
    body: payload.body ?? "",
    icon: payload.icon ?? "/pulse-icon.svg",
    badge: "/pulse-icon.svg",
    data: { url: payload.url ?? "/dashboard" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data?.url as string | undefined) ?? "/dashboard";
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const existing = all.find((c) => c.url.includes(self.registration.scope));
      if (existing) {
        existing.focus();
        existing.navigate(url).catch(() => null);
      } else {
        await self.clients.openWindow(url);
      }
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
