import { api } from "./client";
import type { JournalEntry } from "../types/journal";
import type { AwardedBadge } from "../types/badge";

export async function listJournal(
  page = 1,
  limit = 10
): Promise<{
  entries: JournalEntry[];
  pagination: { page: number; limit: number; total: number; pages: number };
}> {
  const r = await api.get("/api/journal", { params: { page, limit } });
  return r.data;
}

export async function getTodayEntry(): Promise<{ entry: JournalEntry | null }> {
  const r = await api.get("/api/journal/today");
  return r.data;
}

export async function upsertTodayEntry(input: {
  content: string;
  energy_level: number;
}): Promise<{ entry: JournalEntry; new_badges: AwardedBadge[] }> {
  const r = await api.post("/api/journal", input);
  return r.data;
}

export async function updateEntry(
  id: string,
  input: Partial<{ content: string; energy_level: number }>
): Promise<{ entry: JournalEntry }> {
  const r = await api.patch(`/api/journal/${id}`, input);
  return r.data;
}
