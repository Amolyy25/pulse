import { api } from "./client";
import type { CheckinResponse, Habit } from "../types/habit";

export async function listHabits(): Promise<{ habits: Habit[] }> {
  const r = await api.get<{ habits: Habit[] }>("/api/habits");
  return r.data;
}

export async function createHabit(input: {
  name: string;
  icon?: string;
  color?: string;
  frequency?: "daily" | "weekly" | "custom";
  frequency_days?: number[];
}): Promise<{ habit: Habit }> {
  const r = await api.post<{ habit: Habit }>("/api/habits", input);
  return r.data;
}

export async function updateHabit(
  id: string,
  input: Partial<{
    name: string;
    icon: string;
    color: string;
    frequency: "daily" | "weekly" | "custom";
    frequency_days: number[];
    is_active: boolean;
    order: number;
  }>
): Promise<{ habit: Habit }> {
  const r = await api.patch<{ habit: Habit }>(`/api/habits/${id}`, input);
  return r.data;
}

export async function deleteHabit(id: string): Promise<void> {
  await api.delete(`/api/habits/${id}`);
}

export async function checkinHabit(id: string): Promise<CheckinResponse> {
  const r = await api.post<CheckinResponse>(`/api/habits/${id}/checkin`);
  return r.data;
}

export async function uncheckinHabit(id: string): Promise<{ habit: Habit }> {
  const r = await api.delete<{ habit: Habit }>(`/api/habits/${id}/checkin`);
  return r.data;
}
