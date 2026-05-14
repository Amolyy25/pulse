import { XPBar } from "./XPBar";
import { GemCounter } from "./GemCounter";
import { ProfileMenu } from "./ProfileMenu";
import { useAuthStore } from "../store/authStore";

export function Header() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  const initial = user.username.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-pulse-100">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
        <ProfileMenu initial={initial} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-ink-700 font-medium truncate">
              {user.username}
            </span>
            <GemCounter gems={user.gems} />
          </div>
          <XPBar xp={user.xp} />
        </div>
      </div>
    </header>
  );
}
