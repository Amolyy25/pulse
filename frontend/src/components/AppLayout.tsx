import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { RewardOverlay } from "./RewardOverlay";
import { OnboardingFlow, shouldShowOnboarding } from "./OnboardingFlow";
import { SvgDefs } from "./SvgDefs";

export function AppLayout() {
  const [onboarding, setOnboarding] = useState(false);

  useEffect(() => {
    setOnboarding(shouldShowOnboarding());
  }, []);

  return (
    <div className="app-bg text-ink">
      <SvgDefs />

      {/* Decorative blobs */}
      <div
        className="blob animate-drift-slow"
        style={{
          width: 360,
          height: 360,
          background: "var(--grad-amber)",
          top: -120,
          left: -80,
        }}
      />
      <div
        className="blob animate-drift"
        style={{
          width: 320,
          height: 320,
          background: "var(--grad-rose)",
          top: 80,
          right: -120,
        }}
      />
      <div
        className="blob animate-drift-slow"
        style={{
          width: 420,
          height: 420,
          background: "linear-gradient(135deg, #e2d4ff 0%, #c8b5ff 100%)",
          bottom: -180,
          left: "30%",
        }}
      />

      <Header />
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pb-28 pt-2">
        <Outlet />
      </main>
      <BottomNav />
      <RewardOverlay />
      {onboarding && <OnboardingFlow onDone={() => setOnboarding(false)} />}
    </div>
  );
}
