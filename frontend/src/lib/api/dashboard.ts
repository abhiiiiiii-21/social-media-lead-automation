import { apiClient } from "./client";

export interface DashboardOverview {
  total_campaigns: number;
  active_campaigns: number;
  completed_campaigns: number;
  total_leads: number;
  queue_size: number;
}

export const dashboardApi = {
  getOverview: async () => {
    const { data } = await apiClient.get<DashboardOverview>("/dashboard/overview");
    return data;
  },
};
