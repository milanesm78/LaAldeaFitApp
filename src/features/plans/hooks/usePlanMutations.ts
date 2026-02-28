import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { planKeys } from "./usePlans";
import type { PlanFormValues } from "../types";

/**
 * Create a new training plan with training days and exercises.
 * Inserts plan first, then days, then exercises per day (sequential for FK references).
 */
export function useCreatePlan() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (values: PlanFormValues) => {
      // 1. Insert the plan
      const { data: plan, error: planError } = await supabase
        .from("training_plans")
        .insert({
          client_id: values.client_id,
          plan_group_id: crypto.randomUUID(),
          name: values.name,
          cycle_length_weeks: values.cycle_length_weeks,
          status: "draft",
        })
        .select()
        .single();

      if (planError) throw planError;

      // 2. Insert training days
      for (const day of values.training_days) {
        const { data: trainingDay, error: dayError } = await supabase
          .from("training_days")
          .insert({
            plan_id: plan.id,
            day_label: day.day_label,
            day_order: day.order,
          })
          .select()
          .single();

        if (dayError) throw dayError;

        // 3. Insert plan exercises for this day
        if (day.exercises.length > 0) {
          const exerciseRows = day.exercises.map((ex) => ({
            training_day_id: trainingDay.id,
            exercise_id: ex.exercise_id,
            exercise_order: ex.order,
            prescribed_sets: ex.prescribed_sets,
            prescribed_reps: ex.prescribed_reps,
            prescribed_weight_kg: ex.prescribed_weight_kg,
          }));

          const { error: exError } = await supabase
            .from("plan_exercises")
            .insert(exerciseRows);

          if (exError) throw exError;
        }
      }

      return plan;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: planKeys.list(data.client_id) });
      toast.success(t("plans.create_success", "Plan created successfully"));
    },
    onError: () => {
      toast.error(t("plans.create_error", "Failed to create plan"));
    },
  });
}

/**
 * Update a draft plan's metadata and replace its days/exercises.
 * Only works on draft plans. Deletes existing days (CASCADE deletes exercises)
 * and re-inserts from form values.
 */
export function useUpdateDraftPlan() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      planId,
      values,
    }: {
      planId: string;
      values: PlanFormValues;
    }) => {
      // 1. Update plan metadata
      const { data: plan, error: planError } = await supabase
        .from("training_plans")
        .update({
          name: values.name,
          cycle_length_weeks: values.cycle_length_weeks,
        })
        .eq("id", planId)
        .eq("status", "draft")
        .select()
        .single();

      if (planError) throw planError;

      // 2. Delete existing training days (CASCADE deletes plan_exercises)
      const { error: deleteError } = await supabase
        .from("training_days")
        .delete()
        .eq("plan_id", planId);

      if (deleteError) throw deleteError;

      // 3. Re-insert training days and exercises
      for (const day of values.training_days) {
        const { data: trainingDay, error: dayError } = await supabase
          .from("training_days")
          .insert({
            plan_id: planId,
            day_label: day.day_label,
            day_order: day.order,
          })
          .select()
          .single();

        if (dayError) throw dayError;

        if (day.exercises.length > 0) {
          const exerciseRows = day.exercises.map((ex) => ({
            training_day_id: trainingDay.id,
            exercise_id: ex.exercise_id,
            exercise_order: ex.order,
            prescribed_sets: ex.prescribed_sets,
            prescribed_reps: ex.prescribed_reps,
            prescribed_weight_kg: ex.prescribed_weight_kg,
          }));

          const { error: exError } = await supabase
            .from("plan_exercises")
            .insert(exerciseRows);

          if (exError) throw exError;
        }
      }

      return plan;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: planKeys.list(data.client_id) });
      queryClient.invalidateQueries({ queryKey: planKeys.detail(data.id) });
      toast.success(t("plans.update_success", "Plan updated successfully"));
    },
    onError: () => {
      toast.error(t("plans.update_error", "Failed to update plan"));
    },
  });
}

/**
 * Create a new plan version by deep-copying an existing plan via RPC.
 */
export function useCreatePlanVersion() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      sourcePlanId,
      clientId,
    }: {
      sourcePlanId: string;
      clientId: string;
    }) => {
      const { data, error } = await supabase.rpc("create_plan_version", {
        source_plan_id: sourcePlanId,
      });

      if (error) throw error;
      return { newPlanId: data as string, clientId };
    },
    onSuccess: ({ clientId }) => {
      queryClient.invalidateQueries({ queryKey: planKeys.list(clientId) });
      toast.success(
        t("plans.version_created", "New plan version created as draft")
      );
    },
    onError: () => {
      toast.error(
        t("plans.version_error", "Failed to create plan version")
      );
    },
  });
}

/**
 * Activate a draft plan via RPC. Archives the current active plan atomically.
 */
export function useActivatePlan() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      planId,
      clientId,
    }: {
      planId: string;
      clientId: string;
    }) => {
      const { error } = await supabase.rpc("activate_plan_version", {
        new_plan_id: planId,
      });

      if (error) throw error;
      return { planId, clientId };
    },
    onSuccess: ({ clientId }) => {
      queryClient.invalidateQueries({ queryKey: planKeys.list(clientId) });
      queryClient.invalidateQueries({ queryKey: planKeys.active(clientId) });
      toast.success(t("plans.activated", "Plan activated successfully"));
    },
    onError: () => {
      toast.error(t("plans.activate_error", "Failed to activate plan"));
    },
  });
}

/**
 * Delete a draft plan (CASCADE deletes training days and plan exercises).
 */
export function useDeleteDraftPlan() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      planId,
      clientId,
    }: {
      planId: string;
      clientId: string;
    }) => {
      const { error } = await supabase
        .from("training_plans")
        .delete()
        .eq("id", planId)
        .eq("status", "draft");

      if (error) throw error;
      return { clientId };
    },
    onSuccess: ({ clientId }) => {
      queryClient.invalidateQueries({ queryKey: planKeys.list(clientId) });
      toast.success(t("plans.deleted", "Draft plan deleted"));
    },
    onError: () => {
      toast.error(t("plans.delete_error", "Failed to delete plan"));
    },
  });
}
