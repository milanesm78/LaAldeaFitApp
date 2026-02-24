import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Exercise, ExerciseFormData } from "../types";

export const exerciseKeys = {
  all: ["exercises"] as const,
  list: () => [...exerciseKeys.all, "list"] as const,
  detail: (id: string) => [...exerciseKeys.all, "detail", id] as const,
};

export function useExercises() {
  return useQuery({
    queryKey: exerciseKeys.list(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Exercise[];
    },
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (exercise: ExerciseFormData) => {
      const { data, error } = await supabase
        .from("exercises")
        .insert(exercise)
        .select()
        .single();
      if (error) throw error;
      return data as Exercise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.list() });
      toast.success(t("exercises.create_success"));
    },
    onError: () => {
      toast.error(t("exercises.create_error"));
    },
  });
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: ExerciseFormData;
    }) => {
      const { data, error } = await supabase
        .from("exercises")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Exercise;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.list() });
      queryClient.invalidateQueries({
        queryKey: exerciseKeys.detail(data.id),
      });
      toast.success(t("exercises.update_success"));
    },
    onError: () => {
      toast.error(t("exercises.update_error"));
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("exercises")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.list() });
      toast.success(t("exercises.delete_success"));
    },
    onError: () => {
      toast.error(t("exercises.delete_error"));
    },
  });
}
