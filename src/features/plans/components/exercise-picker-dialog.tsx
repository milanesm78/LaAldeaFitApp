import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useExercises } from "@/features/exercises/hooks/useExercises";
import {
  extractYouTubeVideoId,
  getYouTubeThumbnailUrl,
} from "@/lib/utils/youtube";

interface SelectedExercise {
  exercise_id: string;
  exercise_name: string;
  prescribed_sets: number;
  prescribed_reps: number;
  prescribed_weight_kg: number;
}

interface ExercisePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (exercise: SelectedExercise) => void;
}

export function ExercisePickerDialog({
  open,
  onOpenChange,
  onSelect,
}: ExercisePickerDialogProps) {
  const { t } = useTranslation();
  const { data: exercises, isPending } = useExercises();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!exercises) return [];
    if (!search.trim()) return exercises;
    const lower = search.toLowerCase();
    return exercises.filter((ex) => ex.name.toLowerCase().includes(lower));
  }, [exercises, search]);

  const handleSelect = (exercise: { id: string; name: string }) => {
    onSelect({
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      prescribed_sets: 3,
      prescribed_reps: 10,
      prescribed_weight_kg: 0,
    });
    setSearch("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("plans.selectExercise", "Select Exercise")}</DialogTitle>
          <DialogDescription>
            {t("plans.searchExercises", "Search exercises from your library")}
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("plans.searchExercises", "Search exercises...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 min-h-[44px]"
          />
        </div>

        <div className="flex-1 overflow-y-auto -mx-6 px-6 min-h-0">
          {isPending && (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
            </div>
          )}

          {!isPending && filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              {t("exercises.no_exercises", "No exercises found")}
            </p>
          )}

          {!isPending && filtered.length > 0 && (
            <div className="space-y-2 pb-2">
              {filtered.map((exercise) => {
                const videoId = extractYouTubeVideoId(exercise.youtube_url);
                return (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => handleSelect(exercise)}
                    className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent min-h-[56px]"
                  >
                    {videoId && (
                      <img
                        src={getYouTubeThumbnailUrl(videoId)}
                        alt=""
                        className="h-10 w-16 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <span className="text-sm font-medium">{exercise.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
