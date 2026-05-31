/**
 * Saved Searches API Service
 */

import { apiClient } from '@/lib/axios';

export interface SavedSearch {
  id: string;
  name: string;
  entityType: 'leads' | 'contacts' | 'conversations' | 'deals';
  filters: Record<string, unknown>;
  isDefault: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateSavedSearchRequest {
  name: string;
  entityType: 'leads' | 'contacts' | 'conversations' | 'deals';
  filters: Record<string, unknown>;
  isDefault?: boolean;
}

export const savedSearchesService = {
  getSavedSearches: async (entityType?: string) => {
    const response = await apiClient.get<SavedSearch[]>('/SavedSearches', { params: { entityType } });
    return response.data;
  },

  getSavedSearchById: async (id: string) => {
    const response = await apiClient.get<SavedSearch>(`/SavedSearches/${id}`);
    return response.data;
  },

  createSavedSearch: async (data: CreateSavedSearchRequest) => {
    const response = await apiClient.post<SavedSearch>('/SavedSearches', data);
    return response.data;
  },

  updateSavedSearch: async (id: string, data: Partial<CreateSavedSearchRequest>) => {
    const response = await apiClient.patch<SavedSearch>(`/SavedSearches/${id}`, data);
    return response.data;
  },

  deleteSavedSearch: async (id: string) => {
    await apiClient.delete(`/SavedSearches/${id}`);
  },

  setDefault: async (id: string) => {
    const response = await apiClient.post<SavedSearch>(`/SavedSearches/${id}/default`);
    return response.data;
  },
};
