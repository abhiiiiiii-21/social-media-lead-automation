import { apiClient } from "./client";

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: string;
  description?: string | null;
  config?: Record<string, any> | null;
  scraperType?: string | null;
  created_at: string;
  updated_at: string;
}

export type CampaignCreate = Omit<Campaign, "id" | "created_at" | "updated_at" | "status"> & { status?: string; config?: Record<string, any> };
export type CampaignUpdate = Partial<CampaignCreate>;

export const campaignsApi = {
  getCampaigns: async (params?: { skip?: number; limit?: number; status?: string; platform?: string }) => {
    const { data } = await apiClient.get<PaginatedResponse<Campaign>>("/campaigns", { params });
    return data;
  },
  
  getCampaign: async (id: string) => {
    const { data } = await apiClient.get<Campaign>(`/campaigns/${id}`);
    return data;
  },
  
  createCampaign: async (campaign: CampaignCreate) => {
    const { data } = await apiClient.post<Campaign>("/campaigns", campaign);
    return data;
  },
  
  updateCampaign: async (id: string, updates: CampaignUpdate) => {
    const { data } = await apiClient.patch<Campaign>(`/campaigns/${id}`, updates);
    return data;
  },
  
  deleteCampaign: async (id: string) => {
    await apiClient.delete(`/campaigns/${id}`);
  },
};
