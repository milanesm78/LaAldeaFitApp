import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { useClientDashboard } from "@/features/dashboard/hooks/useDashboard";
import { ClientSearchBar } from "@/features/dashboard/components/client-search-bar";
import { ClientListTable } from "@/features/dashboard/components/client-list-table";

/**
 * Trainer's client management page.
 * Uses useClientDashboard() RPC for single-query client data with workout status.
 * Search bar at top, client list below with status indicators.
 */
export function ClientsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: clients, isPending, error } = useClientDashboard();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">
          {t("trainer.dashboard_title", "Client Management")}
        </h1>
      </div>

      <ClientSearchBar value={searchQuery} onChange={setSearchQuery} />

      {isPending && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-destructive">{t("common.error")}</p>
          </CardContent>
        </Card>
      )}

      {!isPending && !error && clients && (
        <ClientListTable
          clients={clients}
          searchQuery={searchQuery}
          onClientClick={(clientId) =>
            navigate(`/trainer/clients/${clientId}`)
          }
        />
      )}
    </div>
  );
}
