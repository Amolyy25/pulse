import { useEffect } from "react";
import { useRewardQueue } from "../store/rewardQueue";
import { BadgeUnlockModal } from "./BadgeUnlockModal";
import { LevelUpModal } from "./LevelUpModal";
import { fetchNewBadges } from "../api/badges";
import { useAuthStore } from "../store/authStore";

export function RewardOverlay() {
  const current = useRewardQueue((s) => s.current);
  const next = useRewardQueue((s) => s.next);
  const push = useRewardQueue((s) => s.push);
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken) return;
    fetchNewBadges()
      .then((r) => {
        if (r.badges.length > 0) {
          push(r.badges.map((b) => ({ type: "badge" as const, badge: b })));
        }
      })
      .catch(() => null);
  }, [accessToken, push]);

  if (!current) return null;

  if (current.type === "badge") {
    return <BadgeUnlockModal badge={current.badge} onClose={next} />;
  }
  return (
    <LevelUpModal
      level={current.level}
      gemsBonus={current.gemsBonus}
      onClose={next}
    />
  );
}
