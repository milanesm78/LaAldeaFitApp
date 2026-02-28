import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ClientSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Search input for filtering the client list.
 * Client-side filtering for 20-50 clients (fits in memory per locked decision).
 */
export function ClientSearchBar({
  value,
  onChange,
  placeholder,
}: ClientSearchBarProps) {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={
          placeholder ?? t("dashboard.searchPlaceholder", "Search clients...")
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 min-h-[44px]"
      />
    </div>
  );
}
