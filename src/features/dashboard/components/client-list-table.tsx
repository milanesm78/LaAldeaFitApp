import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClientStatusBadge } from "./client-status-badge";
import { formatRelativeDate } from "@/lib/utils/cycle";
import type { ClientDashboardRow } from "../types";

interface ClientListTableProps {
  clients: ClientDashboardRow[];
  searchQuery: string;
  onClientClick: (clientId: string) => void;
}

/**
 * Scrollable list of all clients with status indicators.
 * Filters by search query, shows activation toggle, and navigates on row click.
 */
export function ClientListTable({
  clients,
  searchQuery,
  onClientClick,
}: ClientListTableProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const lower = searchQuery.toLowerCase();
    return clients.filter(
      (c) =>
        c.full_name.toLowerCase().includes(lower) ||
        c.email.toLowerCase().includes(lower)
    );
  }, [clients, searchQuery]);

  const toggleActivation = useMutation({
    mutationFn: async ({
      clientId,
      activate,
    }: {
      clientId: string;
      activate: boolean;
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: activate })
        .eq("id", clientId);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(
        variables.activate
          ? t("trainer.client_activated")
          : t("trainer.client_deactivated")
      );
    },
    onError: () => {
      toast.error(t("common.error"));
    },
  });

  if (filtered.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12">
          <Users className="h-12 w-12 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium">
              {searchQuery.trim()
                ? t("dashboard.noResults", "No clients found")
                : t("trainer.no_clients")}
            </p>
            <p className="text-sm text-muted-foreground">
              {searchQuery.trim()
                ? t("dashboard.tryDifferentSearch", "Try a different search term.")
                : t("trainer.no_clients_description")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {t("dashboard.clientCount", "{{count}} clients", {
          count: filtered.length,
        })}
      </p>
      {filtered.map((client) => (
        <Card
          key={client.client_id}
          className="cursor-pointer transition-colors hover:bg-accent/50"
          onClick={() => onClientClick(client.client_id)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-medium truncate">
                {client.full_name || client.email}
              </CardTitle>
              <CardDescription className="text-sm truncate hidden sm:block">
                {client.email}
              </CardDescription>
              {client.last_workout_at && (
                <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                  {formatRelativeDate(client.last_workout_at)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <ClientStatusBadge
                status={client.status}
                todayWorkoutStatus={client.today_workout_status}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex justify-end">
              {client.status === "active" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleActivation.mutate({
                      clientId: client.client_id,
                      activate: false,
                    });
                  }}
                  disabled={toggleActivation.isPending}
                >
                  {t("trainer.deactivate")}
                </Button>
              ) : client.status === "pending" ? (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleActivation.mutate({
                      clientId: client.client_id,
                      activate: true,
                    });
                  }}
                  disabled={toggleActivation.isPending}
                >
                  {t("trainer.activate")}
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
