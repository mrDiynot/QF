/**
 * Bulk Operations API Service
 */

import { apiClient } from '@/lib/axios';

export interface BulkOperationResult {
  successCount: number;
  failureCount: number;
  errors: Array<{ id: string; error: string }>;
}

export const bulkOperationsService = {
  bulkDeleteLeads: async (ids: string[]) => {
    const response = await apiClient.post<BulkOperationResult>('/BulkOperations/leads/delete', { ids });
    return response.data;
  },

  bulkUpdateLeadStatus: async (ids: string[], status: string) => {
    const response = await apiClient.post<BulkOperationResult>('/BulkOperations/leads/status', { ids, status });
    return response.data;
  },

  bulkAssignLeads: async (ids: string[], assigneeId: string) => {
    const response = await apiClient.post<BulkOperationResult>('/BulkOperations/leads/assign', { ids, assigneeId });
    return response.data;
  },

  bulkDeleteContacts: async (ids: string[]) => {
    const response = await apiClient.post<BulkOperationResult>('/BulkOperations/contacts/delete', { ids });
    return response.data;
  },

  bulkTagContacts: async (ids: string[], tags: string[]) => {
    const response = await apiClient.post<BulkOperationResult>('/BulkOperations/contacts/tag', { ids, tags });
    return response.data;
  },
};
