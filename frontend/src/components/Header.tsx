import { GemCounter } from "./GemCounter";
import { ProfileMenu } from "./ProfileMenu";
import { useAuthStore } from "../store/authStore";

function todayLabel() {
  return new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function Header() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  const initial = user.username.charAt(0).toUpperCase();

  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-md bg-cream/75 border-b border-hairline"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3">
        <ProfileMenu initial={initial} />
        <div className="flex-1 min-w-0">
          <div className="eyebrow leading-none truncate">
            {todayLabel()}
          </div>
          <div className="display text-[1.35rem] sm:text-[1.55rem] mt-0.5 leading-none">
            Pulse<span className="text-rose-400">.</span>
          </div>
        </div>
        <GemCounter gems={user.gems} />
      </div>
    </header>
  );
}
