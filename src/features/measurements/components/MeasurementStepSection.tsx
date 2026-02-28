import type { Control, FieldValues } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MeasurementNumericField } from "./MeasurementNumericField";

interface FieldConfig {
  name: string;
  label: string;
  unit: "kg" | "cm" | "mm";
  previousValue: number | null;
}

interface MeasurementStepSectionProps<T extends FieldValues> {
  title: string;
  fields: FieldConfig[];
  control: Control<T>;
}

export function MeasurementStepSection<T extends FieldValues>({
  title,
  fields,
  control,
}: MeasurementStepSectionProps<T>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {fields.map((field) => (
            <MeasurementNumericField
              key={field.name}
              name={field.name as never}
              label={field.label}
              unit={field.unit}
              control={control}
              previousValue={field.previousValue}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
