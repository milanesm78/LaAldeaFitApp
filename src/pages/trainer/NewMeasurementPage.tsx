import { useParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MeasurementWizard } from "@/features/measurements/components/MeasurementWizard";

export function NewMeasurementPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!clientId) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={() => navigate(`/trainer/clients/${clientId}`)}
          aria-label={t("common.back")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">{t("measurements.newMeasurement")}</h1>
      </div>

      {/* Wizard form */}
      <MeasurementWizard clientId={clientId} />
    </div>
  );
}
