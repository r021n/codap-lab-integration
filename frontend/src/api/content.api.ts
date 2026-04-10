import { apiClient as client } from "./client";

export interface SiteContent {
  id?: number;
  slug: string;
  content: string;
  updatedAt?: string | null;
  updatedBy?: number;
}

export const getContent = async (slug: string): Promise<SiteContent> => {
  const response = await client.get(`/contents/${slug}`);
  return response.data;
};

export const updateContent = async (slug: string, content: string): Promise<{ message: string; data: SiteContent }> => {
  const response = await client.put(`/contents/${slug}`, { content });
  return response.data;
};
