import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { YouTubePlayer } from "@/features/workouts/components/youtube-player";
import { formatWeight } from "@/lib/utils";
import type { TrainingDayWithExercises } from "../types";

interface TrainingDayTabProps {
  trainingDay: TrainingDayWithExercises;
  onStartWorkout: (trainingDayId: string) => void;
}

/**
 * Single training day content showing exercises within that day.
 * Each exercise can be tapped to expand and show its YouTube video.
 * "Start Workout" button at the bottom navigates to the workout page.
 */
export function TrainingDayTab({
  trainingDay,
  onStartWorkout,
}: TrainingDayTabProps) {
  const { t, i18n } = useTranslation();
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const toggleExercise = (exerciseId: string) => {
    setExpandedExercise((prev) => (prev === exerciseId ? null : exerciseId));
  };

  return (
    <div className="space-y-3">
      {trainingDay.plan_exercises.map((pe) => (
        <Collapsible
          key={pe.id}
          open={expandedExercise === pe.id}
          onOpenChange={() => toggleExercise(pe.id)}
        >
          <div className="rounded-lg border bg-card p-3">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between text-left min-h-[48px]"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {pe.exercises.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {pe.prescribed_sets} x {pe.prescribed_reps}{" "}
                    {pe.prescribed_weight_kg > 0 && (
                      <>
                        @ {formatWeight(pe.prescribed_weight_kg, i18n.language)}{" "}
                        {t("workout.kg", "kg")}
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  {pe.exercises.youtube_url && (
                    <Play className="h-4 w-4 text-muted-foreground" />
                  )}
                  {expandedExercise === pe.id ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {pe.exercises.youtube_url && (
                <div className="mt-3">
                  <YouTubePlayer
                    youtubeUrl={pe.exercises.youtube_url}
                    exerciseName={pe.exercises.name}
                  />
                </div>
              )}
            </CollapsibleContent>
          </div>
        </Collapsible>
      ))}

      <Button
        className="w-full h-14 text-base font-semibold mt-4"
        onClick={() => onStartWorkout(trainingDay.id)}
      >
        {t("workout.startWorkout", "Start Workout")}
      </Button>
    </div>
  );
}
