import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createHabit } from "../api/habits";
import { enablePush, isPushSupported } from "../lib/push";
import { useToast } from "./Toast";

const ICONS = ["⭐", "🏃", "💧", "📚", "🧘", "💪", "🥗", "😴"];

const STORAGE_KEY = "onboarding_done";

export function shouldShowOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== "true";
}

export function markOnboardingDone() {
  localStorage.setItem(STORAGE_KEY, "true");
}

export function OnboardingFlow({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("⭐");
  const [habitBusy, setHabitBusy] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const qc = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 10);
    return () => clearTimeout(t);
  }, []);

  function finish() {
    markOnboardingDone();
    onDone();
  }

  async function submitHabit() {
    if (!name.trim()) {
      setStep(2);
      return;
    }
    setHabitBusy(true);
    try {
      await createHabit({ name: name.trim(), icon });
      await qc.invalidateQueries({ queryKey: ["habits"] });
      toast("Habitude créée !", "success");
      setStep(2);
    } catch {
      toast("Échec création de l'habitude", "error");
    } finally {
      setHabitBusy(false);
    }
  }

  async function turnOnPush() {
    if (!isPushSupported()) {
      toast("Notifications non supportées sur ce navigateur.", "warning");
      setStep(3);
      return;
    }
    setPushBusy(true);
    try {
      const r = await enablePush();
      if (r.ok) toast("Rappels activés !", "success");
      else if (r.reason === "denied")
        toast("Permission refusée. Tu peux la réactiver dans les réglages.", "warning");
      else toast("Activation impossible.", "warning");
    } catch {
      toast("Erreur lors de l'activation.", "error");
    } finally {
      setPushBusy(false);
      setStep(3);
    }
  }

  return (
    <div
      className={`fixed inset-0 z-40 bg-pulse-50 transition-opacity duration-200 ${
        show ? "opacity-100" : "opacity-0"
      } flex items-center justify-center p-4`}
    >
      <div className="w-full max-w-md card p-6 space-y-6 animate-slide-up">
        {step === 0 && (
          <div className="text-center space-y-4">
            <Illu kind="wave" />
            <h2 className="text-2xl font-bold text-ink-900">Bienvenue sur Pulse 👋</h2>
            <p className="text-muted">
              Ton tracker d'habitudes gamifié. Tape, gagne de l'XP, débloque des badges.
            </p>
            <NavButtons
              onSkip={finish}
              onNext={() => setStep(1)}
              nextLabel="Commencer"
            />
            <Dots step={step} total={4} />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Illu kind="leaf" />
            <h2 className="text-2xl font-bold text-ink-900 text-center">
              Crée ta première habitude
            </h2>
            <div>
              <label className="block text-sm mb-1 text-ink-700">Nom</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Méditer 5min"
                className="w-full px-3 py-2 rounded-xl bg-pulse-50 border border-pulse-100 focus:outline-none focus:border-pulse-400"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-ink-700">Icône</label>
              <div className="grid grid-cols-8 gap-1">
                {ICONS.map((i) => (
                  <button
                    key={i}
                    onClick={() => setIcon(i)}
                    className={`aspect-square rounded-lg text-xl transition ${
                      icon === i ? "bg-pulse-400 text-white" : "bg-pulse-50 hover:bg-pulse-100"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
            <NavButtons
              onSkip={() => setStep(2)}
              onNext={submitHabit}
              nextDisabled={habitBusy}
              nextLabel={habitBusy ? "…" : "Créer"}
            />
            <Dots step={step} total={4} />
          </div>
        )}

        {step === 2 && (
          <div className="text-center space-y-4">
            <Illu kind="bell" />
            <h2 className="text-2xl font-bold text-ink-900">Active les rappels ?</h2>
            <p className="text-muted">
              On t'envoie une notification douce le soir si tu as oublié de check-in.
            </p>
            <NavButtons
              onSkip={() => setStep(3)}
              onNext={turnOnPush}
              nextDisabled={pushBusy}
              nextLabel={pushBusy ? "…" : "Activer"}
              skipLabel="Plus tard"
            />
            <Dots step={step} total={4} />
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-4">
            <Illu kind="rocket" />
            <h2 className="text-2xl font-bold text-ink-900">C'est parti ! 🚀</h2>
            <p className="text-muted">Tout est prêt. Va valider ta première habitude.</p>
            <button onClick={finish} className="btn-primary w-full">
              Vers le dashboard
            </button>
            <Dots step={step} total={4} />
          </div>
        )}
      </div>
    </div>
  );
}

function NavButtons({
  onSkip,
  onNext,
  nextLabel,
  nextDisabled,
  skipLabel = "Passer",
}: {
  onSkip: () => void;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
  skipLabel?: string;
}) {
  return (
    <div className="flex justify-between items-center pt-2">
      <button onClick={onSkip} className="text-sm text-muted hover:text-ink-700">
        {skipLabel}
      </button>
      <button onClick={onNext} disabled={nextDisabled} className="btn-primary text-sm">
        {nextLabel}
      </button>
    </div>
  );
}

function Dots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex justify-center gap-1.5 pt-1">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i === step ? "w-6 bg-pulse-500" : "w-1.5 bg-pulse-200"
          }`}
        />
      ))}
    </div>
  );
}

function Illu({ kind }: { kind: "wave" | "leaf" | "bell" | "rocket" }) {
  const common = "mx-auto w-24 h-24";
  if (kind === "wave") {
    return (
      <svg viewBox="0 0 96 96" className={common}>
        <circle cx="48" cy="48" r="42" fill="#fae8ff" />
        <text x="48" y="62" textAnchor="middle" fontSize="42">👋</text>
      </svg>
    );
  }
  if (kind === "leaf") {
    return (
      <svg viewBox="0 0 96 96" className={common}>
        <circle cx="48" cy="48" r="42" fill="#d1fae5" />
        <text x="48" y="62" textAnchor="middle" fontSize="42">🌱</text>
      </svg>
    );
  }
  if (kind === "bell") {
    return (
      <svg viewBox="0 0 96 96" className={common}>
        <circle cx="48" cy="48" r="42" fill="#fef9c3" />
        <text x="48" y="62" textAnchor="middle" fontSize="42">🔔</text>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 96 96" className={common}>
      <circle cx="48" cy="48" r="42" fill="#fae8ff" />
      <text x="48" y="62" textAnchor="middle" fontSize="42">🚀</text>
    </svg>
  );
}
