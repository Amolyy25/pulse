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
      toast("Habitude créée 🌱", "success");
      setStep(2);
    } catch {
      toast("Échec création.", "error");
    } finally {
      setHabitBusy(false);
    }
  }

  async function turnOnPush() {
    if (!isPushSupported()) {
      toast("Notifications non supportées.", "warning");
      setStep(3);
      return;
    }
    setPushBusy(true);
    try {
      const r = await enablePush();
      if (r.ok) toast("Rappels activés.", "success");
      else if (r.reason === "denied") toast("Permission refusée.", "warning");
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
      className={[
        "fixed inset-0 z-40 app-bg transition-opacity duration-200 flex items-center justify-center p-4",
        show ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <div
        className="blob"
        style={{ width: 360, height: 360, background: "var(--grad-amber)", top: -120, left: -80 }}
      />
      <div
        className="blob"
        style={{ width: 320, height: 320, background: "var(--grad-rose)", bottom: -100, right: -100 }}
      />

      <div
        className="relative z-10 w-full max-w-md card p-6 sm:p-7 space-y-5 animate-slide-up max-h-[90vh] overflow-y-auto"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)" }}
      >
        {step === 0 && (
          <div className="space-y-4">
            <Illu kind="wave" />
            <div className="text-center">
              <div className="eyebrow">Bienvenue</div>
              <h2 className="display text-3xl mt-1">
                Salut, je suis <span className="flourish">Pulse</span>
              </h2>
            </div>
            <p className="text-ink-soft text-center text-sm leading-relaxed">
              Ton compagnon d'habitudes. Petits gestes, grandes constances.
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
            <div className="text-center">
              <div className="eyebrow">Étape 1</div>
              <h2 className="display text-2xl mt-1">
                Ta première <span className="flourish">habitude</span>
              </h2>
            </div>
            <div>
              <label className="label">Nom</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Méditer 5 min"
                className="input font-display text-[15px]"
                autoFocus
              />
            </div>
            <div>
              <label className="label">Icône</label>
              <div className="grid grid-cols-8 gap-1.5">
                {ICONS.map((i) => (
                  <button
                    key={i}
                    onClick={() => setIcon(i)}
                    className={[
                      "aspect-square rounded-xl text-lg transition",
                      icon === i ? "text-white shadow-md" : "bg-cream hover:bg-peach-50",
                    ].join(" ")}
                    style={icon === i ? { background: "var(--grad-sunrise)" } : undefined}
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
          <div className="space-y-4">
            <Illu kind="bell" />
            <div className="text-center">
              <div className="eyebrow">Étape 2</div>
              <h2 className="display text-2xl mt-1">
                Active les <span className="flourish">rappels</span>
              </h2>
            </div>
            <p className="text-ink-soft text-center text-sm leading-relaxed">
              On t'envoie une notification douce le soir si tu as oublié.
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
          <div className="space-y-4">
            <Illu kind="rocket" />
            <div className="text-center">
              <div className="eyebrow">C'est parti</div>
              <h2 className="display text-2xl mt-1">
                À toi <span className="flourish">de jouer</span>
              </h2>
            </div>
            <p className="text-ink-soft text-center text-sm leading-relaxed">
              Tout est prêt. Valide ta première habitude pour gagner +10 XP.
            </p>
            <button onClick={finish} className="btn-primary w-full justify-center">
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
      <button onClick={onSkip} className="btn-ghost">
        {skipLabel}
      </button>
      <button onClick={onNext} disabled={nextDisabled} className="btn-primary">
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
            i === step ? "w-6 bg-rose-400" : "w-1.5 bg-hairline"
          }`}
        />
      ))}
    </div>
  );
}

function Illu({ kind }: { kind: "wave" | "leaf" | "bell" | "rocket" }) {
  const common = "mx-auto w-24 h-24";
  const tints = {
    wave: "var(--grad-amber)",
    leaf: "var(--grad-mint)",
    bell: "linear-gradient(135deg, #fffaeb, #fadc77)",
    rocket: "var(--grad-rose)",
  };
  const icons = { wave: "👋", leaf: "🌱", bell: "🔔", rocket: "🚀" };
  return (
    <div className={`${common} rounded-full flex items-center justify-center text-4xl`} style={{ background: tints[kind] }}>
      {icons[kind]}
    </div>
  );
}
