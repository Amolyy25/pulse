export type Rarity = "common" | "rare" | "epic" | "legendary";

export type AwardedBadge = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon: string;
  rarity: Rarity;
  earned_at: string;
};

export type BadgeListItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  rarity: Rarity;
  condition_type: string;
  condition_value: number;
  earned: boolean;
  earned_at: string | null;
  progress: { current: number; target: number } | null;
};
