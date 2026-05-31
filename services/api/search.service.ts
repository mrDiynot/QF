/**
 * Search API Service
 */

import { apiClient } from '@/lib/axios';

export interface SearchResult {
  id: string;
  type: 'lead' | 'contact' | 'conversation' | 'deal';
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  score: number;
  highlights: Record<string, string[]>;
  createdAt: string;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  facets: Record<string, Array<{ value: string; count: number }>>;
  suggestions: string[];
}

export interface SearchRequest {
  query: string;
  types?: ('lead' | 'contact' | 'conversation' | 'deal')[];
  filters?: Record<string, unknown>;
  pageNumber?: number;
  pageSize?: number;
}

export const searchService = {
  search: async (params: SearchRequest) => {
    const response = await apiClient.post<SearchResponse>('/Search', params);
    return response.data;
  },

  quickSearch: async (query: string) => {
    const response = await apiClient.get<SearchResult[]>('/Search/quick', { params: { query } });
    return response.data;
  },

  getSuggestions: async (query: string) => {
    const response = await apiClient.get<string[]>('/Search/suggestions', { params: { query } });
    return response.data;
  },

  getRecentSearches: async () => {
    const response = await apiClient.get<string[]>('/Search/recent');
    return response.data;
  },

  clearRecentSearches: async () => {
    await apiClient.delete('/Search/recent');
  },
};
