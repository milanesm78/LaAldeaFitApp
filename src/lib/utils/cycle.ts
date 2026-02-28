import { addWeeks, differenceInMinutes, differenceInSeconds, formatDistanceToNow } from "date-fns";

/**
 * Calculate the end date of a training cycle.
 * @param activatedAt - ISO date string when the plan was activated
 * @param cycleLengthWeeks - Number of weeks in the cycle
 * @returns The date when the cycle ends
 */
export function calculateCycleEnd(
  activatedAt: string,
  cycleLengthWeeks: number
): Date {
  return addWeeks(new Date(activatedAt), cycleLengthWeeks);
}

/**
 * Format the duration of a workout session as a human-readable string.
 * @param startedAt - ISO date string when the session started
 * @param completedAt - ISO date string when the session was completed
 * @returns Formatted duration (e.g., "45 min", "1h 15min", "32 sec")
 */
export function formatSessionDuration(
  startedAt: string,
  completedAt: string
): string {
  const start = new Date(startedAt);
  const end = new Date(completedAt);

  const totalMinutes = differenceInMinutes(end, start);

  if (totalMinutes < 1) {
    const seconds = differenceInSeconds(end, start);
    return `${seconds} sec`;
  }

  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
}

/**
 * Format a date as a relative string (e.g., "2 days ago", "about 1 hour ago").
 * Uses date-fns formatDistanceToNow for natural language.
 * @param date - ISO date string
 * @returns Relative time string with "ago" suffix
 */
export function formatRelativeDate(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}
