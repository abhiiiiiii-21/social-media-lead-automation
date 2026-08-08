import { apiClient } from "./client";

export interface ScraperStartPayload {
  campaign_id: string;
  account_name?: string;
  search_mode: string;
  source_query?: string;
  post_urls?: string[];
  keyword_filter?: string | null;
  max_profiles?: number;
  max_scrolls?: number;
  include_replies?: boolean;
  skip_duplicates?: boolean;
  profile_enrichment?: boolean;
  min_followers?: number | null;
  max_followers?: number | null;
  min_posts?: number | null;
  max_posts?: number | null;
  language?: string | null;
  country?: string | null;
  business_category?: string | null;
  is_business_required?: boolean;
  is_verified_required?: boolean;
  is_email_required?: boolean;
  is_phone_required?: boolean;
  is_website_required?: boolean;
}

export interface ScraperJobStats {
  profiles_discovered: number;
  profiles_processed: number;
  profiles_inserted: number;
  duplicates_skipped: number;
  errors: number;
  start_time: number;
  elapsed_time_sec: number;
  status: string;
  stage: string;
  current_username?: string | null;
  current_url?: string | null;
  target_count: number;
}

export interface ScraperStatusResponse {
  campaign_id: string;
  is_running: boolean;
  status: string;
  stage: string;
  current_username?: string | null;
  current_url?: string | null;
  stats?: ScraperJobStats | null;
}

export interface ScraperLogEntry {
  id: string;
  level: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  message: string;
  created_at: string;
}

export const scraperApi = {
  startScraper: async (payload: ScraperStartPayload) => {
    const { data } = await apiClient.post("/scraper/start", payload);
    return data;
  },

  stopScraper: async (campaignId: string) => {
    const { data } = await apiClient.post(`/scraper/stop/${campaignId}`);
    return data;
  },

  getStatus: async (campaignId: string): Promise<ScraperStatusResponse> => {
    const { data } = await apiClient.get<ScraperStatusResponse>(`/scraper/status/${campaignId}`);
    return data;
  },

  getLogs: async (campaignId: string, limit: number = 100): Promise<ScraperLogEntry[]> => {
    const { data } = await apiClient.get<ScraperLogEntry[]>(`/scraper/logs/${campaignId}`, {
      params: { limit },
    });
    return data;
  },
};
