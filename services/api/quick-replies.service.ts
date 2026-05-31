/**
 * Quick Replies API Service
 * Handles all quick reply-related API calls
 */

import { apiClient } from '@/lib/axios';
import type { QuickReply, CreateQuickReplyRequest, PaginatedResponse } from '@/types/api';

export const quickRepliesService = {
  /**
   * Get all quick replies
   * GET /api/v1/QuickReplies
   */
  getQuickReplies: async (params?: {
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<QuickReply>> => {
    const response = await apiClient.get<PaginatedResponse<QuickReply>>('/QuickReplies', { params });
    return response.data;
  },

  /**
   * Get a single quick reply by ID
   * GET /api/v1/QuickReplies/{id}
   */
  getQuickReplyById: async (id: string): Promise<QuickReply> => {
    const response = await apiClient.get<QuickReply>(`/QuickReplies/${id}`);
    return response.data;
  },

  /**
   * Create a new quick reply
   * POST /api/v1/QuickReplies
   */
  createQuickReply: async (data: CreateQuickReplyRequest): Promise<QuickReply> => {
    const response = await apiClient.post<QuickReply>('/QuickReplies', data);
    return response.data;
  },

  /**
   * Update a quick reply
   * PATCH /api/v1/QuickReplies/{id}
   */
  updateQuickReply: async (id: string, data: Partial<QuickReply>): Promise<QuickReply> => {
    const response = await apiClient.patch<QuickReply>(`/QuickReplies/${id}`, data);
    return response.data;
  },

  /**
   * Delete a quick reply
   * DELETE /api/v1/QuickReplies/{id}
   */
  deleteQuickReply: async (id: string): Promise<void> => {
    await apiClient.delete(`/QuickReplies/${id}`);
  },

  /**
   * Get quick reply by shortcut
   * GET /api/v1/QuickReplies/shortcut/{shortcut}
   */
  getQuickReplyByShortcut: async (shortcut: string): Promise<QuickReply> => {
    const response = await apiClient.get<QuickReply>(`/QuickReplies/shortcut/${shortcut}`);
    return response.data;
  },

  /**
   * Track quick reply usage
   * POST /api/v1/QuickReplies/{id}/usage
   */
  trackUsage: async (id: string): Promise<void> => {
    await apiClient.post(`/QuickReplies/${id}/usage`);
  },
};