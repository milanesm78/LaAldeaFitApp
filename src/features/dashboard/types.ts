export interface ClientDashboardRow {
  client_id: string;
  full_name: string;
  email: string;
  status: "active" | "inactive" | "pending";
  has_active_plan: boolean;
  today_workout_status: "completed" | "in_progress" | "not_started";
  last_workout_at: string | null;
}
