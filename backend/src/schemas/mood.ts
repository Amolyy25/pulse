import { z } from "zod";

export const moodEnum = z.enum(["amazing", "good", "neutral", "bad", "terrible"]);

export const createMoodSchema = z.object({
  mood: moodEnum,
  score: z.number().int().min(1).max(5),
  note: z.string().max(2000).optional(),
});

export type CreateMoodInput = z.infer<typeof createMoodSchema>;
export type Mood = z.infer<typeof moodEnum>;
