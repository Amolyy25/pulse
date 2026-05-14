import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { RewardOverlay } from "./RewardOverlay";
import { OnboardingFlow, shouldShowOnboarding } from "./OnboardingFlow";

export function AppLayout() {
  const [onboarding, setOnboarding] = useState(false);

  useEffect(() => {
    setOnboarding(shouldShowOnboarding());
  }, []);

  return (
    <div className="min-h-screen bg-pulse-50 text-ink-900">
      <Header />
      <main className="max-w-3xl mx-auto px-4 pb-24 pt-4">
        <Outlet />
      </main>
      <BottomNav />
      <RewardOverlay />
      {onboarding && <OnboardingFlow onDone={() => setOnboarding(false)} />}
    </div>
  );
}
