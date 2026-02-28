import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { ClientDashboardRow } from "../types";
import type { PlanWithDays } from "@/features/plans/types";
import type { SessionWithSets } from "@/features/workouts/types";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  clients: () => [...dashboardKeys.all, "clients"] as const,
  clientDetail: (clientId: string) =>
    [...dashboardKeys.all, "client", clientId] as const,
};

/**
 * Fetch the trainer's client dashboard via RPC.
 * Returns all clients with status, plan info, and today's workout status.
 * staleTime of 2 minutes -- trainer doesn't need real-time updates.
 */
export function useClientDashboard() {
  return useQuery({
    queryKey: dashboardKeys.clients(),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_client_dashboard");
      if (error) throw error;
      return data as ClientDashboardRow[];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Fetch a client's profile, active plan, and recent workout sessions
 * for the trainer's client detail view.
 */
export function useClientDetail(clientId: string | undefined) {
  return useQuery({
    queryKey: dashboardKeys.clientDetail(clientId ?? ""),
    queryFn: async () => {
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", clientId!)
        .single();

      if (profileError) throw profileError;

      // Fetch active plan with nested data
      const { data: activePlan, error: planError } = await supabase
        .from("training_plans")
        .select(
          `
          id,
          client_id,
          plan_group_id,
          version,
          name,
          cycle_length_weeks,
          status,
          created_at,
          activated_at,
          archived_at,
          training_days (
            id,
            plan_id,
            day_label,
            day_order,
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
        .eq("status", "active")
        .maybeSingle();

      if (planError) throw planError;

      // Sort if plan exists
      let plan: PlanWithDays | null = null;
      if (activePlan) {
        plan = activePlan as unknown as PlanWithDays;
        plan.training_days.sort((a, b) => a.day_order - b.day_order);
        plan.training_days.forEach((day) => {
          day.plan_exercises.sort(
            (a, b) => a.exercise_order - b.exercise_order
          );
        });
      }

      // Fetch recent sessions (last 10)
      const { data: sessions, error: sessionsError } = await supabase
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
        .order("started_at", { ascending: false })
        .limit(10);

      if (sessionsError) throw sessionsError;

      return {
        profile,
        activePlan: plan,
        recentSessions: sessions as unknown as SessionWithSets[],
      };
    },
    enabled: !!clientId,
  });
}
