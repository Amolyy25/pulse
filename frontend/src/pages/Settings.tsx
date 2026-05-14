import { useEffect, useState } from "react";
import { sendTestNotification } from "../api/notifications";
import { disablePush, enablePush, isPushSupported } from "../lib/push";
import { useToast } from "../components/Toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const supported = isPushSupported();

  useEffect(() => {
    if (!supported) {
      setSubscribed(false);
      return;
    }
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    });
  }, [supported]);

  async function turnOn() {
    const r = await enablePush();
    if (r.ok) {
      setSubscribed(true);
      toast("Rappels activés ✨", "success");
    } else {
      toast(`Activation impossible (${r.reason ?? "erreur"}).`, "warning");
    }
  }

  async function turnOff() {
    await disablePush();
    setSubscribed(false);
    toast("Rappels désactivés.", "info");
  }

  async function testIt() {
    try {
      const r = await sendTestNotification();
      if (r.sent === 0) toast("Aucune subscription active.", "warning");
      else toast(`Notification envoyée (${r.sent}).`, "success");
    } catch {
      toast("Erreur d'envoi.", "error");
    }
  }

  return (
    <div className="space-y-4 stagger pt-2">
      <header>
        <div className="eyebrow">Réglages</div>
        <h1 className="display text-[1.7rem] sm:text-[2rem] leading-none mt-1">
          Mon <span className="flourish">compte</span>
        </h1>
      </header>

      <section className="card p-5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-50 blur-2xl" style={{ background: "var(--grad-amber)" }} />
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="eyebrow">Rappels</div>
            <h3 className="display text-lg leading-none mt-1">Push notifications</h3>
          </div>
          <span
            className={[
              "chip",
              subscribed ? "bg-mint-100 text-mint-500 border-mint-200" : "bg-cream text-muted",
            ].join(" ")}
          >
            <span className={`w-2 h-2 rounded-full ${subscribed ? "bg-mint-400" : "bg-muted/40"}`} />
            {subscribed ? "Actif" : "Désactivé"}
          </span>
        </div>
        <p className="text-sm text-ink-soft">
          Reçois une notification chaque soir si tes habitudes du jour ne sont pas complétées.
        </p>
        {!supported && (
          <p className="mt-3 text-sm text-butter-400 bg-butter-100 border border-butter-200 rounded-xl px-3 py-2">
            Ton navigateur ne supporte pas les notifications push.
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {subscribed ? (
            <button onClick={turnOff} className="btn-secondary">
              Désactiver
            </button>
          ) : (
            <button onClick={turnOn} disabled={!supported} className="btn-primary disabled:opacity-50">
              Activer
            </button>
          )}
          <button
            onClick={testIt}
            disabled={!subscribed}
            className="btn-secondary disabled:opacity-40"
          >
            Test
          </button>
        </div>
      </section>

      <section className="card p-5">
        <div className="eyebrow">À propos</div>
        <h3 className="display text-lg leading-none mt-1 mb-3">Pulse</h3>
        <p className="text-sm text-ink-soft">
          Tracker d'habitudes doux et gamifié. Mobile-first. PWA. Conçu pour durer.
        </p>
      </section>
    </div>
  );
}
