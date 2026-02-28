import { useTranslation } from "react-i18next";

interface ClientStatusBadgeProps {
  status: "active" | "inactive" | "pending";
  todayWorkoutStatus:
    | "completed"
    | "in_progress"
    | "not_started"
    | null;
}

/**
 * Color-coded status indicator for client activity.
 * Shows activity badge + today's workout dot.
 */
export function ClientStatusBadge({
  status,
  todayWorkoutStatus,
}: ClientStatusBadgeProps) {
  const { t } = useTranslation();

  const statusStyles: Record<string, string> = {
    active:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    inactive:
      "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  };

  const statusLabels: Record<string, string> = {
    active: t("status.active", "Active"),
    pending: t("status.pending", "Pending"),
    inactive: t("status.inactive", "Inactive"),
  };

  const workoutDotColors: Record<string, string> = {
    completed: "bg-green-500",
    in_progress: "bg-amber-500",
    not_started: "bg-gray-400",
  };

  return (
    <div className="flex items-center gap-2">
      {todayWorkoutStatus && (
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${workoutDotColors[todayWorkoutStatus]}`}
          title={t(`status.today.${todayWorkoutStatus}`, todayWorkoutStatus)}
        />
      )}
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status] ?? statusStyles.inactive}`}
      >
        {statusLabels[status] ?? status}
      </span>
    </div>
  );
}
