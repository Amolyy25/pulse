import { api } from "./client";
import type { LeaderboardEntry } from "../types/leaderboard";

export async function fetchLeaderboard(): Promise<{ leaderboard: LeaderboardEntry[] }> {
  const r = await api.get("/api/leaderboard");
  return r.data;
}
