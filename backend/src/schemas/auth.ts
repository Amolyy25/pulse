import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3, "username must be at least 3 characters"),
  email: z.string().email("invalid email"),
  password: z.string().min(8, "password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("invalid email"),
  password: z.string().min(1, "password required"),
});

export const refreshSchema = z.object({
  refresh_token: z.string().min(1, "refresh_token required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
