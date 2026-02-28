import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { ClipboardList } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useActivePlan } from "@/features/plans/hooks/usePlans";
import { ClientPlanView } from "@/features/plans/components/client-plan-view";

/**
 * Page for the client to view their assigned training plan.
 * Route: /client/plan
 * Shows training days as tabs, exercises within each day,
 * and a "Start Workout" button per day.
 */
export function MyPlanPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session } = useAuth();
  const userId = session?.user?.id;

  const { data: plan, isLoading, error } = useActivePlan(userId);

  const handleStartWorkout = (trainingDayId: string) => {
    navigate(`/client/workout/${trainingDayId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 w-full animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ClipboardList className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          {t("plan.noPlan", "No training plan yet")}
        </h2>
        <p className="text-muted-foreground max-w-sm">
          {t(
            "plan.noPlanDescription",
            "No training plan assigned yet. Your trainer will create one for you."
          )}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        {t("plan.myPlan", "My Plan")}
      </h1>
      <ClientPlanView plan={plan} onStartWorkout={handleStartWorkout} />
    </div>
  );
}
