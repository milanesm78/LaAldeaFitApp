import { useState, useCallback, type InputHTMLAttributes } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { normalizeDecimal, formatWeight } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface DecimalInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "type"
  > {
  value: number | null;
  onChange: (value: number | null) => void;
  locale?: string;
}

/**
 * Reusable decimal input component for all weight/measurement values.
 *
 * Uses <input type="text" inputMode="decimal"> instead of type="number"
 * to avoid cross-browser locale issues with European decimal separators.
 * See: GOV.UK research on numeric inputs, RESEARCH.md Pitfall 3.
 *
 * - Accepts both comma (,) and period (.) as decimal separators during typing
 * - When focused: shows raw input value for editing
 * - When blurred: formats display using Intl.NumberFormat based on locale
 * - Spanish locale displays "75,5", English locale displays "75.5"
 */
export function DecimalInput({
  value,
  onChange,
  locale,
  className,
  ...props
}: DecimalInputProps) {
  const { i18n } = useTranslation();
  const currentLocale = locale ?? i18n.language;

  const [isFocused, setIsFocused] = useState(false);
  const [rawValue, setRawValue] = useState("");

  // Display value: formatted when blurred, raw when focused
  const displayValue = isFocused
    ? rawValue
    : value !== null
      ? formatWeight(value, currentLocale)
      : "";

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    // Show the raw numeric value for editing (always with period for consistency)
    setRawValue(value !== null ? String(value) : "");
  }, [value]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Normalize the raw input to a number
    const normalized = normalizeDecimal(rawValue);
    onChange(normalized);
  }, [rawValue, onChange]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Allow empty value (clearing the field)
      if (inputValue === "") {
        setRawValue("");
        onChange(null);
        return;
      }

      // Only allow digits, one comma or period, and optional leading minus
      // Pattern: optional minus, digits, optional single comma/period, digits
      if (!/^-?[0-9]*[,.]?[0-9]*$/.test(inputValue)) {
        return;
      }

      setRawValue(inputValue);

      // Try to parse and report the value upstream
      const normalized = normalizeDecimal(inputValue);
      if (normalized !== null) {
        onChange(normalized);
      }
    },
    [onChange]
  );

  return (
    <Input
      type="text"
      inputMode="decimal"
      pattern="[0-9]*[,.]?[0-9]*"
      value={displayValue}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
      className={cn("min-h-[44px]", className)}
      {...props}
    />
  );
}
