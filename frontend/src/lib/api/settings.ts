import { apiClient } from "./client";

export interface Settings {
  id: string;
  groq_model: string;
  temperature: number;
  max_tokens: number;
  retry_limit: number;
  delay_between_requests: number;
  created_at: string;
  updated_at: string;
}

export type SettingsUpdate = Partial<Omit<Settings, "id" | "created_at" | "updated_at">>;

export const settingsApi = {
  getSettings: async () => {
    const { data } = await apiClient.get<Settings>("/settings");
    return data;
  },
  
  updateSettings: async (updates: SettingsUpdate) => {
    const { data } = await apiClient.patch<Settings>("/settings", updates);
    return data;
  },
};
