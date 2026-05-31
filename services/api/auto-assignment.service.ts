import { apiClient } from '@/lib/axios';

// ============================================================================
// Auto-Assignment Rules Types
// ============================================================================

export interface AutoAssignmentRule {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  priority: number;
  channel?: string;
  minLeadScore?: number;
  maxLeadScore?: number;
  assignmentType: string;
  assignToUserId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAutoAssignmentRuleRequest {
  name: string;
  description?: string;
  isActive?: boolean;
  priority?: number;
  channel?: string;
  minLeadScore?: number;
  maxLeadScore?: number;
  assignmentType?: string;
  assignToUserId?: string;
}

export interface UpdateAutoAssignmentRuleRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
  priority?: number;
  channel?: string;
  minLeadScore?: number;
  maxLeadScore?: number;
  assignmentType?: string;
  assignToUserId?: string;
}

export interface ReorderRulesRequest {
  ruleIds: string[];
}

// ============================================================================
// Auto-Assignment Service
// ============================================================================

export const autoAssignmentService = {
  getRules: async (): Promise<AutoAssignmentRule[]> => {
    const { data } = await apiClient.get<AutoAssignmentRule[]>('/auto-assignment');
    return data;
  },

  getRule: async (id: string): Promise<AutoAssignmentRule> => {
    const { data } = await apiClient.get<AutoAssignmentRule>(`/auto-assignment/${id}`);
    return data;
  },

  createRule: async (request: CreateAutoAssignmentRuleRequest): Promise<AutoAssignmentRule> => {
    const { data } = await apiClient.post<AutoAssignmentRule>('/auto-assignment', request);
    return data;
  },

  updateRule: async (id: string, request: UpdateAutoAssignmentRuleRequest): Promise<AutoAssignmentRule> => {
    const { data } = await apiClient.put<AutoAssignmentRule>(`/auto-assignment/${id}`, request);
    return data;
  },

  deleteRule: async (id: string): Promise<void> => {
    await apiClient.delete(`/auto-assignment/${id}`);
  },

  reorderRules: async (request: ReorderRulesRequest): Promise<AutoAssignmentRule[]> => {
    const { data } = await apiClient.post<AutoAssignmentRule[]>('/auto-assignment/reorder', request);
    return data;
  },
};

export default autoAssignmentService;
