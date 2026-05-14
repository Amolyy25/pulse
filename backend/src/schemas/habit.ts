import { z } from "zod";

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "color must be a #RRGGBB hex");
const frequency = z.enum(["daily", "weekly", "custom"]);

export const createHabitSchema = z.object({
  name: z.string().min(1, "name required").max(80),
  icon: z.string().min(1).max(4).optional(),
  color: hexColor.optional(),
  frequency: frequency.optional(),
  frequency_days: z.array(z.number().int().min(0).max(6)).optional(),
});

export const updateHabitSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  icon: z.string().min(1).max(4).optional(),
  color: hexColor.optional(),
  frequency: frequency.optional(),
  frequency_days: z.array(z.number().int().min(0).max(6)).optional(),
  is_active: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
