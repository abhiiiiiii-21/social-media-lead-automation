import { apiClient } from "./client";
import { PaginatedResponse } from "./campaigns";

export interface MessageTemplate {
  id: string;
  name: string;
  platform: string;
  category: string;
  template_body: string;
  created_at: string;
  updated_at: string;
}

export type MessageTemplateCreate = Omit<MessageTemplate, "id" | "created_at" | "updated_at">;
export type MessageTemplateUpdate = Partial<MessageTemplateCreate>;

export const templatesApi = {
  getTemplates: async (params?: { skip?: number; limit?: number; platform?: string; category?: string }) => {
    const { data } = await apiClient.get<PaginatedResponse<MessageTemplate>>("/templates", { params });
    return data;
  },
  
  getTemplate: async (id: string) => {
    const { data } = await apiClient.get<MessageTemplate>(`/templates/${id}`);
    return data;
  },
  
  createTemplate: async (template: MessageTemplateCreate) => {
    const { data } = await apiClient.post<MessageTemplate>("/templates", template);
    return data;
  },
  
  updateTemplate: async (id: string, updates: MessageTemplateUpdate) => {
    const { data } = await apiClient.patch<MessageTemplate>(`/templates/${id}`, updates);
    return data;
  },
  
  deleteTemplate: async (id: string) => {
    await apiClient.delete(`/templates/${id}`);
  },
};
