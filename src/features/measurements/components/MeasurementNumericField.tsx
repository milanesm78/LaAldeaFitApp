import { useController, type Control, type FieldValues, type Path } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { DecimalInput } from "@/components/DecimalInput";

interface MeasurementNumericFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  unit: "kg" | "cm" | "mm";
  control: Control<T>;
  previousValue: number | null;
}

export function MeasurementNumericField<T extends FieldValues>({
  name,
  label,
  unit,
  control,
  previousValue,
}: MeasurementNumericFieldProps<T>) {
  const { t } = useTranslation();
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ name, control });

  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        <span className="ml-1 text-xs text-muted-foreground">({unit})</span>
      </Label>
      <DecimalInput
        id={name}
        value={value ?? null}
        onChange={onChange}
        placeholder={previousValue !== null ? String(previousValue) : undefined}
        className={error ? "border-destructive" : ""}
      />
      {previousValue !== null && (
        <p className="text-xs text-muted-foreground">
          {t("measurements.previous", { value: previousValue, unit })}
        </p>
      )}
      {error && (
        <p className="text-xs text-destructive">
          {error.message}
        </p>
      )}
    </div>
  );
}
