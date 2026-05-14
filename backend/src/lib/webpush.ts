import webpush from "web-push";

let configured = false;

export function configureWebPush() {
  if (configured) return;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_EMAIL ?? "mailto:hello@pulse.app";
  if (!pub || !priv) {
    console.warn("[webpush] VAPID keys missing — push disabled");
    return;
  }
  webpush.setVapidDetails(email, pub, priv);
  configured = true;
}

export function isPushConfigured(): boolean {
  return configured;
}

export { webpush };
