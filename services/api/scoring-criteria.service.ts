/**
 * Scoring Criteria API Service
 */

import { apiClient } from '@/lib/axios';

export interface ScoringCriterion {
  id: string;
  name: string;
  description?: string;
  weight: number;
  category: string;
  rules: ScoringRule[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ScoringRule {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'in' | 'notIn';
  value: string | number | string[];
  points: number;
}

export interface CreateScoringCriterionRequest {
  name: string;
  description?: string;
  weight: number;
  category: string;
  rules: ScoringRule[];
}

export const scoringCriteriaService = {
  getScoringCriteria: async () => {
    const response = await apiClient.get<ScoringCriterion[]>('/ScoringCriteria');
    return response.data;
  },

  getScoringCriterionById: async (id: string) => {
    const response = await apiClient.get<ScoringCriterion>(`/ScoringCriteria/${id}`);
    return response.data;
  },

  createScoringCriterion: async (data: CreateScoringCriterionRequest) => {
    const response = await apiClient.post<ScoringCriterion>('/ScoringCriteria', data);
    return response.data;
  },

  updateScoringCriterion: async (id: string, data: Partial<CreateScoringCriterionRequest>) => {
    const response = await apiClient.patch<ScoringCriterion>(`/ScoringCriteria/${id}`, data);
    return response.data;
  },

  deleteScoringCriterion: async (id: string) => {
    await apiClient.delete(`/ScoringCriteria/${id}`);
  },

  toggleActive: async (id: string, isActive: boolean) => {
    const response = await apiClient.patch<ScoringCriterion>(`/ScoringCriteria/${id}/toggle`, { isActive });
    return response.data;
  },

  recalculateScores: async () => {
    const response = await apiClient.post<{ processedCount: number }>('/ScoringCriteria/recalculate');
    return response.data;
  },
};
