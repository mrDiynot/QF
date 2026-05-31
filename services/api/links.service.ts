import { apiClient } from '@/lib/axios';

export interface TrackedLink {
  id: string;
  name: string;
  slug: string;
  shortUrl: string;
  destinationUrl: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
  isActive: boolean;
  createdAt: string;
}

export interface TrackedLinkStats {
  totalLinks: number;
  totalClicks: number;
  totalConversions: number;
  averageConversionRate: number;
}

export interface CreateLinkRequest {
  name: string;
  slug?: string;
  destinationUrl: string;
}

export interface UpdateLinkRequest {
  name?: string;
  destinationUrl?: string;
  isActive?: boolean;
}

export const linksService = {
  async getLinks(): Promise<TrackedLink[]> {
    const response = await apiClient.get<TrackedLink[]>('/links');
    return response.data;
  },

  async getStats(): Promise<TrackedLinkStats> {
    const response = await apiClient.get<TrackedLinkStats>('/links/stats');
    return response.data;
  },

  async createLink(request: CreateLinkRequest): Promise<TrackedLink> {
    const response = await apiClient.post<TrackedLink>('/links', request);
    return response.data;
  },

  async updateLink(id: string, request: UpdateLinkRequest): Promise<TrackedLink> {
    const response = await apiClient.patch<TrackedLink>(`/links/${id}`, request);
    return response.data;
  },

  async deleteLink(id: string): Promise<void> {
    await apiClient.delete(`/links/${id}`);
  },
};
