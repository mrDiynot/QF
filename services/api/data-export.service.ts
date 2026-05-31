/**
 * Data Export API Service
 */

import { apiClient } from '@/lib/axios';

export interface ExportRequest {
  entityType: 'leads' | 'contacts' | 'conversations' | 'deals';
  format: 'csv' | 'xlsx' | 'json';
  filters?: Record<string, unknown>;
  fields?: string[];
}

export interface ExportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  entityType: string;
  format: string;
  downloadUrl?: string;
  errorMessage?: string;
  recordCount?: number;
  createdAt: string;
  completedAt?: string;
}

export const dataExportService = {
  createExport: async (data: ExportRequest) => {
    const response = await apiClient.post<ExportJob>('/DataExport', data);
    return response.data;
  },

  getExportStatus: async (id: string) => {
    const response = await apiClient.get<ExportJob>(`/DataExport/${id}`);
    return response.data;
  },

  getExportHistory: async () => {
    const response = await apiClient.get<ExportJob[]>('/DataExport/history');
    return response.data;
  },

  downloadExport: async (id: string) => {
    const response = await apiClient.get(`/DataExport/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
