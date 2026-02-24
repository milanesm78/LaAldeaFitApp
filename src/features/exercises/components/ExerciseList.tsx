import { useTranslation } from "react-i18next";
import { Dumbbell, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useExercises } from "../hooks/useExercises";
import { ExerciseCard } from "./ExerciseCard";
import type { Exercise } from "../types";

interface ExerciseListProps {
  onEdit: (exercise: Exercise) => void;
  onDelete: (exercise: Exercise) => void;
}

function SkeletonCard() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full animate-pulse bg-muted" />
      <div className="p-4">
        <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
      </div>
    </Card>
  );
}

export function ExerciseList({ onEdit, onDelete }: ExerciseListProps) {
  const { t } = useTranslation();
  const { data: exercises, isPending, isError, refetch } = useExercises();

  // Loading state: skeleton cards
  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <p className="text-muted-foreground">{t("common.error")}</p>
        <Button variant="outline" onClick={() => refetch()} className="min-h-[44px]">
          <RefreshCw className="mr-2 h-4 w-4" />
          {t("exercises.retry")}
        </Button>
      </div>
    );
  }

  // Empty state
  if (!exercises || exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <Dumbbell className="h-12 w-12 text-muted-foreground/50" />
        <div>
          <p className="font-medium text-muted-foreground">
            {t("exercises.no_exercises")}
          </p>
          <p className="text-sm text-muted-foreground/70">
            {t("exercises.no_exercises_hint")}
          </p>
        </div>
      </div>
    );
  }

  // Exercise grid
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
