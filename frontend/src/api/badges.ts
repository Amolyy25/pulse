import { api } from "./client";
import type { AwardedBadge, BadgeListItem } from "../types/badge";

export async function listBadges(): Promise<{ badges: BadgeListItem[] }> {
  const r = await api.get("/api/badges");
  return r.data;
}

export async function fetchNewBadges(): Promise<{ badges: AwardedBadge[] }> {
  const r = await api.get("/api/badges/new");
  return r.data;
}
