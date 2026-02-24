import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx and tailwind-merge.
 * Used by shadcn/ui components for conditional class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalize decimal input: replace comma with period for storage.
 * Accepts "75,5" or "75.5" and normalizes to 75.5.
 * Returns null for invalid input.
 */
export function normalizeDecimal(value: string): number | null {
  const normalized = value.replace(",", ".");
  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

/**
 * Format a number for display based on locale.
 * Uses Intl.NumberFormat with 0-1 fraction digits.
 * e.g. formatWeight(75.5, 'es') => "75,5"
 * e.g. formatWeight(75, 'en') => "75"
 */
export function formatWeight(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}
