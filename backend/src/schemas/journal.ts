import { z } from "zod";

export const upsertJournalSchema = z.object({
  content: z.string().min(1, "content required").max(10_000),
  energy_level: z.number().int().min(1).max(5),
});

export const updateJournalSchema = z.object({
  content: z.string().min(1).max(10_000).optional(),
  energy_level: z.number().int().min(1).max(5).optional(),
});

export type UpsertJournalInput = z.infer<typeof upsertJournalSchema>;
export type UpdateJournalInput = z.infer<typeof updateJournalSchema>;
