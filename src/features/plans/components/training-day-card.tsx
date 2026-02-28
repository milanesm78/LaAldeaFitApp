import { useState } from "react";
import {
  type Control,
  type UseFormRegister,
  useFieldArray,
  useWatch,
  type FieldErrors,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ExerciseRow } from "./exercise-row";
import { ExercisePickerDialog } from "./exercise-picker-dialog";
import type { PlanFormValues } from "../schemas";

interface TrainingDayCardProps {
  control: Control<PlanFormValues>;
  dayIndex: number;
  register: UseFormRegister<PlanFormValues>;
  onRemove: () => void;
  errors: FieldErrors<PlanFormValues>;
  initialExerciseNames?: Record<number, string>;
}

export function TrainingDayCard({
  control,
  dayIndex,
  register,
  onRemove,
  errors,
  initialExerciseNames,
}: TrainingDayCardProps) {
  const { t } = useTranslation();
  const [pickerOpen, setPickerOpen] = useState(false);

  const { fields: exerciseFields, append, remove, move } = useFieldArray({
    control,
    name: `training_days.${dayIndex}.exercises`,
  });

  // Track exercise names for display (stored alongside form data)
  const exercises = useWatch({
    control,
    name: `training_days.${dayIndex}.exercises`,
  });

  // We need to store exercise names separately since the schema only has exercise_id.
  // We use a local map to track names for display.
  // When editing, initialExerciseNames provides names from the existing plan.
  const [exerciseNames, setExerciseNames] = useState<Record<number, string>>(
    () => initialExerciseNames ?? {}
  );

  const handleAddExercise = (selected: {
    exercise_id: string;
    exercise_name: string;
    prescribed_sets: number;
    prescribed_reps: number;
    prescribed_weight_kg: number;
  }) => {
    const newIndex = exerciseFields.length;
    append({
      exercise_id: selected.exercise_id,
      order: newIndex,
      prescribed_sets: selected.prescribed_sets,
      prescribed_reps: selected.prescribed_reps,
      prescribed_weight_kg: selected.prescribed_weight_kg,
    });
    setExerciseNames((prev) => ({
      ...prev,
      [newIndex]: selected.exercise_name,
    }));
  };

  const handleRemoveExercise = (index: number) => {
    remove(index);
    // Rebuild name map after removal
    setExerciseNames((prev) => {
      const updated: Record<number, string> = {};
      Object.entries(prev).forEach(([key, name]) => {
        const k = Number(key);
        if (k < index) {
          updated[k] = name;
        } else if (k > index) {
          updated[k - 1] = name;
        }
        // skip the removed index
      });
      return updated;
    });
  };

  const handleMove = (from: number, to: number) => {
    move(from, to);
    // Rebuild name map after move
    setExerciseNames((prev) => {
      const entries = Object.entries(prev).map(
        ([k, v]) => [Number(k), v] as [number, string]
      );
      const nameMap = new Map(entries);
      const updated: Record<number, string> = {};

      const fromName = nameMap.get(from);
      const toName = nameMap.get(to);
      nameMap.forEach((name, idx) => {
        if (idx === from) {
          updated[to] = fromName ?? name;
        } else if (idx === to) {
          updated[from] = toName ?? name;
        } else {
          updated[idx] = name;
        }
      });
      return updated;
    });
  };

  const hasExercises = exerciseFields.length > 0;
  const dayErrors = errors?.training_days?.[dayIndex];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex-1 mr-2">
          <Input
            {...register(`training_days.${dayIndex}.day_label`)}
            placeholder={t("plans.dayLabel", "Day label")}
            className="font-medium min-h-[44px]"
          />
          {dayErrors?.day_label && (
            <p className="text-xs text-destructive mt-1">
              {dayErrors.day_label.message}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-destructive hover:text-destructive flex-shrink-0"
          onClick={() => {
            if (hasExercises) {
              if (window.confirm(t("plans.removeDayConfirm", "Remove this day and all its exercises?"))) {
                onRemove();
              }
            } else {
              onRemove();
            }
          }}
          aria-label={t("plans.removeDay", "Remove day")}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {exerciseFields.map((field, exerciseIndex) => (
          <ExerciseRow
            key={field.id}
            control={control}
            register={register}
            dayIndex={dayIndex}
            exerciseIndex={exerciseIndex}
            exerciseName={
              exerciseNames[exerciseIndex] ??
              (exercises?.[exerciseIndex] as Record<string, unknown> & { _name?: string })?._name ??
              t("plans.exercise", "Exercise")
            }
            onRemove={() => handleRemoveExercise(exerciseIndex)}
            onMoveUp={() => handleMove(exerciseIndex, exerciseIndex - 1)}
            onMoveDown={() => handleMove(exerciseIndex, exerciseIndex + 1)}
            canMoveUp={exerciseIndex > 0}
            canMoveDown={exerciseIndex < exerciseFields.length - 1}
          />
        ))}

        {dayErrors?.exercises?.message && (
          <p className="text-xs text-destructive">
            {dayErrors.exercises.message}
          </p>
        )}

        <Button
          type="button"
          variant="outline"
          className="w-full min-h-[44px]"
          onClick={() => setPickerOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("plans.addExercise", "Add Exercise")}
        </Button>

        <ExercisePickerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          onSelect={handleAddExercise}
        />
      </CardContent>
    </Card>
  );
}
