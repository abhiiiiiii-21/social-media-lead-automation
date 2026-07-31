import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../lib/api/dashboard";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  overview: () => [...dashboardKeys.all, "overview"] as const,
};

export function useDashboardOverview() {
  return useQuery({
    queryKey: dashboardKeys.overview(),
    queryFn: () => dashboardApi.getOverview(),
    refetchInterval: 15000, // Refresh dashboard every 15 seconds
  });
}
