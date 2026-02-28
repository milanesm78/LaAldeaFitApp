import type { PlanExerciseWithDetails } from "@/features/plans/types";

export interface WorkoutSession {
  id: string;
  client_id: string;
  training_day_id: string;
  started_at: string;
  completed_at: string | null;
}

export interface WorkoutSet {
  id: string;
  session_id: string;
  plan_exercise_id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  created_at: string;
}

/** Workout set with joined plan exercise details */
export interface WorkoutSetWithExercise extends WorkoutSet {
  plan_exercises: PlanExerciseWithDetails;
}

/** Session with all logged sets and exercise details */
export interface SessionWithSets extends WorkoutSession {
  workout_sets: WorkoutSetWithExercise[];
}

/** Map of plan_exercise_id -> array of set values (weight + reps), ordered by set number */
export type LastSessionValues = Map<
  string,
  { weight_kg: number; reps: number }[]
>;
