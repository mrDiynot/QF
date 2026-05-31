/**
 * Deals API Service
 * Handles all deal pipeline-related API calls (CRM)
 */

import { apiClient } from '@/lib/axios';
import type { Deal, CreateDealRequest, PipelineStage, PaginatedResponse } from '@/types/api';

export const dealsService = {
  /**
   * Get all deals
   * GET /api/v1/deals
   */
  getDeals: async (params?: {
    pageNumber?: number;
    pageSize?: number;
    stage?: string;
  }): Promise<PaginatedResponse<Deal>> => {
    const response = await apiClient.get<PaginatedResponse<Deal>>('/deals', { params });
    return response.data;
  },

  /**
   * Get a single deal by ID
   * GET /api/v1/deals/{id}
   */
  getDealById: async (id: string): Promise<Deal> => {
    const response = await apiClient.get<Deal>(`/deals/${id}`);
    return response.data;
  },

  /**
   * Create a new deal
   * POST /api/v1/deals
   */
  createDeal: async (data: CreateDealRequest): Promise<Deal> => {
    const response = await apiClient.post<Deal>('/deals', data);
    return response.data;
  },

  /**
   * Update a deal
   * PUT /api/v1/deals/{id}
   */
  updateDeal: async (id: string, data: Partial<Deal>): Promise<Deal> => {
    const response = await apiClient.put<Deal>(`/deals/${id}`, data);
    return response.data;
  },

  /**
   * Delete a deal
   * DELETE /api/v1/deals/{id}
   */
  deleteDeal: async (id: string): Promise<void> => {
    await apiClient.delete(`/deals/${id}`);
  },

  /**
   * Get pipeline view
   * GET /api/v1/deals/pipeline
   */
  getPipeline: async (): Promise<PipelineStage[]> => {
    const response = await apiClient.get<PipelineStage[]>('/deals/pipeline');
    return response.data;
  },

  /**
   * Get deals by stage
   * GET /api/v1/deals/stage/{stage}
   */
  getDealsByStage: async (stage: string): Promise<Deal[]> => {
    const response = await apiClient.get<Deal[]>(`/deals/stage/${stage}`);
    return response.data;
  },

  /**
   * Move deal to different stage
   * PATCH /api/v1/deals/{id}/move
   */
  moveDeal: async (id: string, newStage: string): Promise<Deal> => {
    const response = await apiClient.patch<Deal>(`/deals/${id}/move`, { stage: newStage });
    return response.data;
  },

  /**
   * Get pipeline analytics
   * GET /api/v1/deals/analytics/pipeline
   */
  getPipelineAnalytics: async (): Promise<unknown> => {
    const response = await apiClient.get('/deals/analytics/pipeline');
    return response.data;
  },
};