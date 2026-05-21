import { z } from "zod";

export const createRoundSchema = z.object({
  playedOn: z.string().date(),
  targetHoleCount: z.union([z.literal(6), z.literal(12), z.literal(18)]),
});

export const upsertHoleEntrySchema = z.object({
  strokes: z.number().int().min(1),
  penalties: z.number().int().min(0),
  bunkers: z.number().int().min(0),
  putts: z.number().int().min(0),
  greenInRegulation: z.boolean(),
});

export type CreateRoundInput = z.infer<typeof createRoundSchema>;
export type UpsertHoleEntryInput = z.infer<typeof upsertHoleEntrySchema>;
