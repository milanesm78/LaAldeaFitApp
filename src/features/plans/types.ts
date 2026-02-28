import type { PlanStatus } from "@/types/database";
import type { Exercise } from "@/features/exercises/types";
import type { PlanFormValues } from "./schemas";

export type { PlanFormValues };

export interface TrainingPlan {
  id: string;
  client_id: string;
  plan_group_id: string;
  version: number;
  name: string;
  cycle_length_weeks: number;
  status: PlanStatus;
  created_at: string;
  activated_at: string | null;
  archived_at: string | null;
}

export interface TrainingDay {
  id: string;
  plan_id: string;
  day_label: string;
  day_order: number;
}

export interface PlanExercise {
  id: string;
  training_day_id: string;
  exercise_id: string;
  exercise_order: number;
  prescribed_sets: number;
  prescribed_reps: number;
  prescribed_weight_kg: number;
}

/** Plan exercise with joined exercise data */
export interface PlanExerciseWithDetails extends PlanExercise {
  exercises: Exercise;
}

/** Training day with nested plan exercises and exercise details */
export interface TrainingDayWithExercises extends TrainingDay {
  plan_exercises: PlanExerciseWithDetails[];
}

/** Full plan with nested training days, exercises, and exercise details */
export interface PlanWithDays extends TrainingPlan {
  training_days: TrainingDayWithExercises[];
}
