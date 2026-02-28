import { useTranslation } from "react-i18next";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { TrainingDayTab } from "./training-day-tab";
import type { PlanWithDays } from "../types";

interface ClientPlanViewProps {
  plan: PlanWithDays;
  onStartWorkout: (trainingDayId: string) => void;
}

/**
 * Client's full plan view with tabs for each training day.
 * Uses shadcn/ui Tabs -- tabs chosen over cards because 3-6 training days
 * fit well in a horizontal tab bar on mobile.
 */
export function ClientPlanView({ plan, onStartWorkout }: ClientPlanViewProps) {
  const { t } = useTranslation();

  if (plan.training_days.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("plan.noPlanDescription", "No training days configured yet.")}
      </div>
    );
  }

  const defaultDay = plan.training_days[0]?.id;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{plan.name}</h2>
        <p className="text-sm text-muted-foreground">
          v{plan.version}
        </p>
      </div>

      <Tabs defaultValue={defaultDay} className="w-full">
        <TabsList className="w-full overflow-x-auto flex">
          {plan.training_days.map((day) => (
            <TabsTrigger
              key={day.id}
              value={day.id}
              className="flex-1 min-w-0"
            >
              {day.day_label}
            </TabsTrigger>
          ))}
        </TabsList>

        {plan.training_days.map((day) => (
          <TabsContent key={day.id} value={day.id}>
            <TrainingDayTab
              trainingDay={day}
              onStartWorkout={onStartWorkout}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
