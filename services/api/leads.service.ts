/**
 * Leads API Service
 * Handles all lead-related API calls
 */

import { apiClient } from '@/lib/axios';
import type { Lead, CreateLeadRequest, QualifyLeadRequest, PaginatedResponse } from '@/types/api';

export const leadsService = {
  /**
   * Get all leads with pagination
   * GET /api/v1/Leads
   */
  getLeads: async (params?: {
    pageNumber?: number;
    pageSize?: number;
    status?: string;
    source?: string;
  }): Promise<PaginatedResponse<Lead>> => {
    const response = await apiClient.get<PaginatedResponse<Lead>>('/Leads', { params });
    return response.data;
  },

  /**
   * Get a single lead by ID
   * GET /api/v1/Leads/{id}
   */
  getLeadById: async (id: string): Promise<Lead> => {
    const response = await apiClient.get<Lead>(`/Leads/${id}`);
    return response.data;
  },

  /**
   * Create a new lead
   * POST /api/v1/Leads
   */
  createLead: async (data: CreateLeadRequest): Promise<Lead> => {
    const response = await apiClient.post<Lead>('/Leads', data);
    return response.data;
  },

  /**
   * Update a lead
   * PATCH /api/v1/Leads/{id}
   */
  updateLead: async (id: string, data: Partial<Lead>): Promise<Lead> => {
    const response = await apiClient.patch<Lead>(`/Leads/${id}`, data);
    return response.data;
  },

  /**
   * Delete a lead
   * DELETE /api/v1/Leads/{id}
   */
  deleteLead: async (id: string): Promise<void> => {
    await apiClient.delete(`/Leads/${id}`);
  },

  /**
   * Qualify a lead
   * POST /api/v1/Leads/{id}/qualify
   */
  qualifyLead: async (data: QualifyLeadRequest): Promise<Lead> => {
    const response = await apiClient.post<Lead>(`/Leads/${data.leadId}/qualify`, data);
    return response.data;
  },
};