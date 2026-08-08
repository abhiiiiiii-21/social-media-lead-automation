import { apiClient } from "./client";

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface BackendLead {
  id: string;
  campaign_id: string;
  platform: string;
  username: string;
  full_name?: string | null;
  business_name?: string | null;
  bio?: string | null;
  followers: number;
  following: number;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  category?: string | null;
  profile_url?: string | null;
  profile_image?: string | null;
  source: string;
  qualification_status: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: string;
  description?: string | null;
  config?: Record<string, any> | null;
  scraper_type?: string | null;
  scraperType?: string | null;
  lead_count?: number;
  created_at: string;
  updated_at: string;
}

export type CampaignCreate = Omit<Campaign, "id" | "created_at" | "updated_at" | "status" | "lead_count"> & { 
  status?: string; 
  config?: Record<string, any>;
};
export type CampaignUpdate = Partial<CampaignCreate>;

export interface LeadQueryParams {
  skip?: number;
  limit?: number;
  search?: string;
  qualification_status?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

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

  getCampaignLeads: async (campaignId: string, params?: LeadQueryParams) => {
    const { data } = await apiClient.get<PaginatedResponse<BackendLead>>(`/campaigns/${campaignId}/leads`, {
      params,
    });
    return data;
  },

  getExportUrl: (campaignId: string, format: "csv" | "json" = "csv") => {
    const baseURL = apiClient.defaults.baseURL || "http://localhost:8000/api";
    return `${baseURL}/campaigns/${campaignId}/leads/export?format=${format}`;
  },
};
