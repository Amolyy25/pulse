import { z } from "zod";

const stepSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1).max(200),
  duration_min: z.number().int().min(0).max(600),
});

export const createRoutineSchema = z.object({
  name: z.string().min(1).max(80),
  type: z.enum(["morning", "evening", "custom"]).optional(),
  steps: z.array(stepSchema).min(1),
});

export const updateRoutineSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  type: z.enum(["morning", "evening", "custom"]).optional(),
  steps: z.array(stepSchema).optional(),
  is_active: z.boolean().optional(),
});

export type CreateRoutineInput = z.infer<typeof createRoutineSchema>;
export type UpdateRoutineInput = z.infer<typeof updateRoutineSchema>;
