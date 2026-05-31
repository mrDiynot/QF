/**
 * Search Analytics API Service
 * Integrates with SearchAnalyticsController
 */

import { apiClient } from '@/lib/axios';

export interface TopSearchResult {
  query: string;
  count: number;
  averageResultsCount: number;
  averageExecutionTimeMs: number;
  lastSearchedAt: string;
}

export interface ZeroResultSearch {
  query: string;
  count: number;
  lastSearchedAt: string;
}

export interface SearchPerformanceMetrics {
  totalSearches: number;
  averageExecutionTimeMs: number;
  medianExecutionTimeMs: number;
  p95ExecutionTimeMs: number;
  p99ExecutionTimeMs: number;
  zeroResultsPercentage: number;
  averageResultsCount: number;
}

export interface SearchAnalyticsParams {
  days?: number;
  limit?: number;
}

export const searchAnalyticsService = {
  /**
   * Get top search queries
   */
  async getTopSearches(params: SearchAnalyticsParams = {}): Promise<TopSearchResult[]> {
    const queryParams = new URLSearchParams();
    if (params.days) queryParams.append('days', params.days.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await apiClient.get<TopSearchResult[]>(
      `/search/analytics/top-searches?${queryParams}`
    );
    return response.data;
  },

  /**
   * Get searches that returned zero results
   */
  async getZeroResultSearches(params: SearchAnalyticsParams = {}): Promise<ZeroResultSearch[]> {
    const queryParams = new URLSearchParams();
    if (params.days) queryParams.append('days', params.days.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await apiClient.get<ZeroResultSearch[]>(
      `/search/analytics/zero-results?${queryParams}`
    );
    return response.data;
  },

  /**
   * Get search performance metrics
   */
  async getPerformanceMetrics(days?: number): Promise<SearchPerformanceMetrics> {
    const queryParams = days ? `?days=${days}` : '';
    const response = await apiClient.get<SearchPerformanceMetrics>(
      `/search/analytics/performance${queryParams}`
    );
    return response.data;
  },
};

export default searchAnalyticsService;
