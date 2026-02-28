import { z } from "zod";

export const setLogSchema = z.object({
  plan_exercise_id: z.string().uuid(),
  set_number: z.number().int().min(1),
  weight_kg: z.number().min(0),
  reps: z.number().int().min(0),
});

export type SetLogValues = z.infer<typeof setLogSchema>;
