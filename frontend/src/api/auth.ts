import { api } from "./client";
import type { AuthResponse, User } from "../types/user";

export async function register(input: {
  username: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const resp = await api.post<AuthResponse>("/api/auth/register", input);
  return resp.data;
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const resp = await api.post<AuthResponse>("/api/auth/login", input);
  return resp.data;
}

export async function logout(refresh_token: string): Promise<void> {
  await api.post("/api/auth/logout", { refresh_token });
}

export async function me(): Promise<{ user: User }> {
  const resp = await api.get<{ user: User }>("/api/me");
  return resp.data;
}
