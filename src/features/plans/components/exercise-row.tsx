import { type Control, type UseFormRegister, useController } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DecimalInput } from "@/components/DecimalInput";
import type { PlanFormValues } from "../schemas";

interface ExerciseRowProps {
  control: Control<PlanFormValues>;
  register: UseFormRegister<PlanFormValues>;
  dayIndex: number;
  exerciseIndex: number;
  exerciseName: string;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function ExerciseRow({
  control,
  register,
  dayIndex,
  exerciseIndex,
  exerciseName,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: ExerciseRowProps) {
  const { t } = useTranslation();

  const weightField = useController({
    control,
    name: `training_days.${dayIndex}.exercises.${exerciseIndex}.prescribed_weight_kg`,
  });

  return (
    <div className="rounded-lg border bg-card p-3">
      {/* Top row: exercise name + reorder/remove */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-sm font-medium truncate flex-1">
          {exerciseName}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            aria-label={t("common.move_up", "Move up")}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            aria-label={t("common.move_down", "Move down")}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-destructive hover:text-destructive"
            onClick={onRemove}
            aria-label={t("common.delete")}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bottom row: sets / reps / weight */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            {t("plans.sets", "Sets")}
          </label>
          <Input
            type="number"
            min={1}
            max={10}
            className="min-h-[44px]"
            {...register(
              `training_days.${dayIndex}.exercises.${exerciseIndex}.prescribed_sets`,
              { valueAsNumber: true }
            )}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            {t("plans.reps", "Reps")}
          </label>
          <Input
            type="number"
            min={1}
            max={100}
            className="min-h-[44px]"
            {...register(
              `training_days.${dayIndex}.exercises.${exerciseIndex}.prescribed_reps`,
              { valueAsNumber: true }
            )}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            {t("plans.weight", "Weight")} ({t("plans.kg", "kg")})
          </label>
          <DecimalInput
            value={weightField.field.value}
            onChange={(val) => weightField.field.onChange(val ?? 0)}
          />
        </div>
      </div>
    </div>
  );
}
