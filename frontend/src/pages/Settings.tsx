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
      toast("Rappels activés !", "success");
    } else {
      toast(`Échec activation (${r.reason ?? "erreur"}).`, "warning");
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
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-ink-900">Réglages</h2>

      <section className="card p-4 space-y-3">
        <h3 className="font-semibold text-ink-900">Rappels</h3>
        <p className="text-sm text-muted">
          Reçois une notification le soir si tes habitudes du jour ne sont pas validées.
        </p>
        {!supported && (
          <p className="text-sm text-amber-700 bg-soft-lemon rounded-lg px-3 py-2">
            Ton navigateur ne supporte pas les notifications push.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {subscribed ? (
            <button onClick={turnOff} className="btn-secondary text-sm">
              Désactiver
            </button>
          ) : (
            <button onClick={turnOn} disabled={!supported} className="btn-primary text-sm">
              Activer
            </button>
          )}
          <button
            onClick={testIt}
            disabled={!subscribed}
            className="btn-secondary text-sm disabled:opacity-50"
          >
            Envoyer un test
          </button>
        </div>
      </section>
    </div>
  );
}
