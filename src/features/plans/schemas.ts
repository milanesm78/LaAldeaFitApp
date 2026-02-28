import { z } from "zod";

export const exerciseSchema = z.object({
  exercise_id: z.string().uuid(),
  order: z.number().int().min(0),
  prescribed_sets: z.number().int().min(1).max(10),
  prescribed_reps: z.number().int().min(1).max(100),
  prescribed_weight_kg: z.number().min(0).max(500),
});

export const trainingDaySchema = z.object({
  day_label: z.string().min(1).max(50),
  order: z.number().int().min(0),
  exercises: z.array(exerciseSchema).min(1),
});

export const planSchema = z.object({
  client_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  cycle_length_weeks: z.number().int().min(1).max(52),
  training_days: z.array(trainingDaySchema).min(1),
});

export type PlanFormValues = z.infer<typeof planSchema>;
export type TrainingDayFormValues = z.infer<typeof trainingDaySchema>;
export type ExerciseFormValues = z.infer<typeof exerciseSchema>;
