import { useParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useClientDetail } from "@/features/dashboard/hooks/useDashboard";
import { ClientDetailTabs } from "@/features/dashboard/components/client-detail-tabs";

/**
 * Trainer's detail view of a specific client.
 * Replaces ClientPlanPage at /trainer/clients/:clientId.
 * Shows client info at top and tabbed plan/logs view below.
 */
export function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: clientData, isPending, error } = useClientDetail(clientId);

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-destructive">{t("common.error")}</p>
        </CardContent>
      </Card>
    );
  }

  const profile = clientData?.profile;
  const clientName = profile?.full_name ?? profile?.email ?? "";

  return (
    <div className="space-y-4">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={() => navigate("/trainer/clients")}
          aria-label={t("common.back", "Back")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">{clientName}</h1>
          {profile?.email && (
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          )}
        </div>
      </div>

      {/* Tabbed content */}
      {clientId && (
        <ClientDetailTabs clientId={clientId} clientName={clientName} />
      )}
    </div>
  );
}
