/**
 * Audit Logs API Service
 */

import { apiClient } from '@/lib/axios';

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogFilters {
  pageNumber?: number;
  pageSize?: number;
  action?: string;
  entityType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export const auditLogsService = {
  getAuditLogs: async (filters?: AuditLogFilters) => {
    const response = await apiClient.get<{ items: AuditLogEntry[]; totalCount: number }>('/AuditLogs', { params: filters });
    return response.data;
  },

  getAuditLogById: async (id: string) => {
    const response = await apiClient.get<AuditLogEntry>(`/AuditLogs/${id}`);
    return response.data;
  },

  getEntityHistory: async (entityType: string, entityId: string) => {
    const response = await apiClient.get<AuditLogEntry[]>(`/AuditLogs/entity/${entityType}/${entityId}`);
    return response.data;
  },
};
