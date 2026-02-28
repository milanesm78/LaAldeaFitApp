import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { SessionWithSets, LastSessionValues, WorkoutSet } from "../types";

export const workoutKeys = {
  all: ["workouts"] as const,
  sessions: (clientId: string) =>
    [...workoutKeys.all, "sessions", clientId] as const,
  session: (sessionId: string) =>
    [...workoutKeys.all, "session", sessionId] as const,
  sets: (sessionId: string) =>
    [...workoutKeys.all, "sets", sessionId] as const,
  lastSession: (clientId: string, dayId: string) =>
    [...workoutKeys.all, "last", clientId, dayId] as const,
  history: (clientId: string) =>
    [...workoutKeys.all, "history", clientId] as const,
};

/**
 * Fetch past completed sessions with all logged sets, ordered by started_at desc.
 * Default limit of 20 sessions.
 */
export function useWorkoutHistory(
  clientId: string | undefined,
  limit: number = 20
) {
  return useQuery({
    queryKey: workoutKeys.history(clientId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_sessions")
        .select(
          `
          id,
          client_id,
          training_day_id,
          started_at,
          completed_at,
          workout_sets (
            id,
            session_id,
            plan_exercise_id,
            set_number,
            weight_kg,
            reps,
            created_at,
            plan_exercises (
              id,
              training_day_id,
              exercise_id,
              exercise_order,
              prescribed_sets,
              prescribed_reps,
              prescribed_weight_kg,
              exercises (
                id,
                name,
                youtube_url
              )
            )
          )
        `
        )
        .eq("client_id", clientId!)
        .not("completed_at", "is", null)
        .order("started_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as unknown as SessionWithSets[];
    },
    enabled: !!clientId,
  });
}

/**
 * Fetch the most recent completed session for a training day.
 * Returns a Map of plan_exercise_id -> set values for pre-filling.
 * This is the pre-fill source: last session actual values (locked decision).
 */
export function useLastSessionValues(
  clientId: string | undefined,
  trainingDayId: string | undefined
) {
  return useQuery({
    queryKey: workoutKeys.lastSession(clientId ?? "", trainingDayId ?? ""),
    queryFn: async (): Promise<LastSessionValues> => {
      const { data, error } = await supabase
        .from("workout_sessions")
        .select(
          `
          workout_sets (
            plan_exercise_id,
            set_number,
            weight_kg,
            reps
          )
        `
        )
        .eq("client_id", clientId!)
        .eq("training_day_id", trainingDayId!)
        .not("completed_at", "is", null)
        .order("started_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return new Map();

      // Group sets by plan_exercise_id
      const grouped = new Map<
        string,
        { weight_kg: number; reps: number }[]
      >();
      const sets = data.workout_sets as unknown as Pick<
        WorkoutSet,
        "plan_exercise_id" | "set_number" | "weight_kg" | "reps"
      >[];

      for (const set of sets) {
        const existing = grouped.get(set.plan_exercise_id) || [];
        existing.push({ weight_kg: set.weight_kg, reps: set.reps });
        grouped.set(set.plan_exercise_id, existing);
      }

      // Sort each exercise's sets by set_number (already ordered from DB but ensure)
      for (const [, setValues] of grouped) {
        setValues.sort((a, b) => a.weight_kg - b.weight_kg); // stable sort -- values already in insert order
      }

      return grouped;
    },
    enabled: !!clientId && !!trainingDayId,
  });
}

/**
 * Fetch all sets for an active session.
 */
export function useSessionSets(sessionId: string | undefined) {
  return useQuery({
    queryKey: workoutKeys.sets(sessionId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_sets")
        .select("*")
        .eq("session_id", sessionId!)
        .order("plan_exercise_id")
        .order("set_number");

      if (error) throw error;
      return data as WorkoutSet[];
    },
    enabled: !!sessionId,
  });
}
