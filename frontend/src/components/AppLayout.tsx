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

      <div
        className="blob animate-drift-slow"
        style={{ width: 280, height: 280, background: "var(--grad-amber)", top: -100, left: -90 }}
      />
      <div
        className="blob animate-drift"
        style={{ width: 260, height: 260, background: "var(--grad-rose)", top: 120, right: -100 }}
      />
      <div
        className="blob animate-drift-slow"
        style={{
          width: 360,
          height: 360,
          background: "linear-gradient(135deg, #e2d4ff 0%, #c8b5ff 100%)",
          bottom: -180,
          left: "20%",
        }}
      />

      <Header />
      <main
        className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-2"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 100px)" }}
      >
        <Outlet />
      </main>
      <BottomNav />
      <RewardOverlay />
      {onboarding && <OnboardingFlow onDone={() => setOnboarding(false)} />}
    </div>
  );
}
