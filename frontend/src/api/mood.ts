import { api } from "./client";
import type { Mood, MoodLog, MoodStats } from "../types/mood";
import type { AwardedBadge } from "../types/badge";

export async function listMoods(limit = 30): Promise<{ moods: MoodLog[] }> {
  const r = await api.get("/api/mood", { params: { limit } });
  return r.data;
}

export async function createMood(input: {
  mood: Mood;
  score: number;
  note?: string;
}): Promise<{ mood: MoodLog; new_badges: AwardedBadge[] }> {
  const r = await api.post("/api/mood", input);
  return r.data;
}

export async function moodStats(): Promise<MoodStats> {
  const r = await api.get<MoodStats>("/api/mood/stats");
  return r.data;
}
