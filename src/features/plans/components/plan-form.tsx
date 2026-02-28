import { useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TrainingDayCard } from "./training-day-card";
import { planSchema, type PlanFormValues } from "../schemas";
import type { PlanWithDays } from "../types";

interface PlanFormProps {
  clientId: string;
  existingPlan?: PlanWithDays;
  onSubmit: (values: PlanFormValues) => void;
  isSubmitting: boolean;
}

/** Generate next day letter: A, B, C, ... Z, AA, AB, ... */
function nextDayLetter(count: number): string {
  if (count < 26) return String.fromCharCode(65 + count);
  return (
    String.fromCharCode(65 + Math.floor(count / 26) - 1) +
    String.fromCharCode(65 + (count % 26))
  );
}

export function PlanForm({
  clientId,
  existingPlan,
  onSubmit,
  isSubmitting,
}: PlanFormProps) {
  const { t } = useTranslation();

  // Build default values from existing plan data if editing
  const defaultValues = useMemo<PlanFormValues>(() => {
    if (existingPlan) {
      return {
        client_id: existingPlan.client_id,
        name: existingPlan.name,
        cycle_length_weeks: existingPlan.cycle_length_weeks,
        training_days: existingPlan.training_days.map((day) => ({
          day_label: day.day_label,
          order: day.day_order,
          exercises: day.plan_exercises.map((pe) => ({
            exercise_id: pe.exercise_id,
            order: pe.exercise_order,
            prescribed_sets: pe.prescribed_sets,
            prescribed_reps: pe.prescribed_reps,
            prescribed_weight_kg: pe.prescribed_weight_kg,
          })),
        })),
      };
    }
    return {
      client_id: clientId,
      name: "",
      cycle_length_weeks: 4,
      training_days: [],
    };
  }, [existingPlan, clientId]);

  // Build initial exercise names map from existing plan, keyed by dayIndex
  const initialExerciseNamesByDay = useMemo<
    Record<number, Record<number, string>>
  >(() => {
    if (!existingPlan) return {};
    const byDay: Record<number, Record<number, string>> = {};
    existingPlan.training_days.forEach((day, dayIdx) => {
      const dayMap: Record<number, string> = {};
      day.plan_exercises.forEach((pe, exIdx) => {
        dayMap[exIdx] = pe.exercises?.name ?? "";
      });
      byDay[dayIdx] = dayMap;
    });
    return byDay;
  }, [existingPlan]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues,
  });

  // Ensure client_id is always set
  useEffect(() => {
    setValue("client_id", clientId);
  }, [clientId, setValue]);

  const {
    fields: dayFields,
    append: appendDay,
    remove: removeDay,
  } = useFieldArray({
    control,
    name: "training_days",
  });

  const handleAddDay = () => {
    const nextLetter = nextDayLetter(dayFields.length);
    appendDay({
      day_label: `${t("plans.day", "Day")} ${nextLetter}`,
      order: dayFields.length,
      exercises: [],
    });
  };

  const handleFormSubmit = (values: PlanFormValues) => {
    // Ensure day orders are sequential
    const normalized: PlanFormValues = {
      ...values,
      training_days: values.training_days.map((day, dayIdx) => ({
        ...day,
        order: dayIdx,
        exercises: day.exercises.map((ex, exIdx) => ({
          ...ex,
          order: exIdx,
        })),
      })),
    };
    onSubmit(normalized);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Plan name */}
      <div className="space-y-2">
        <Label htmlFor="plan-name">{t("plans.planName", "Plan Name")}</Label>
        <Input
          id="plan-name"
          {...register("name")}
          placeholder={t("plans.planNamePlaceholder", "e.g. Hypertrophy Block 1")}
          className="min-h-[44px]"
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Cycle length */}
      <div className="space-y-2">
        <Label htmlFor="cycle-length">
          {t("plans.cycleLength", "Cycle Length")} ({t("plans.weeks", "weeks")})
        </Label>
        <Input
          id="cycle-length"
          type="number"
          min={1}
          max={52}
          className="min-h-[44px]"
          {...register("cycle_length_weeks", { valueAsNumber: true })}
        />
        {errors.cycle_length_weeks && (
          <p className="text-xs text-destructive">
            {errors.cycle_length_weeks.message}
          </p>
        )}
      </div>

      {/* Training days */}
      <div className="space-y-4">
        {dayFields.map((field, dayIndex) => (
          <TrainingDayCard
            key={field.id}
            control={control}
            dayIndex={dayIndex}
            register={register}
            onRemove={() => removeDay(dayIndex)}
            errors={errors}
            initialExerciseNames={initialExerciseNamesByDay[dayIndex]}
          />
        ))}

        {errors.training_days?.message && (
          <p className="text-xs text-destructive">
            {errors.training_days.message}
          </p>
        )}

        <Button
          type="button"
          variant="outline"
          className="w-full min-h-[44px]"
          onClick={handleAddDay}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("plans.addDay", "Add Training Day")}
        </Button>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full min-h-[44px]"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? t("common.loading")
          : existingPlan
            ? t("plans.updatePlan", "Update Plan")
            : t("plans.createPlan", "Create Plan")}
      </Button>
    </form>
  );
}
