import { api } from "./client";
import type { DashboardStats } from "../types/stats";

export async function dashboardStats(): Promise<DashboardStats> {
  const r = await api.get<DashboardStats>("/api/stats");
  return r.data;
}
