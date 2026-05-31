/**
 * Call Scripts API Service
 */

import { apiClient } from '@/lib/axios';

export interface CallScript {
  id: string;
  name: string;
  description?: string;
  content: string;
  category?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCallScriptRequest {
  name: string;
  description?: string;
  content: string;
  category?: string;
  isDefault?: boolean;
}

export const callScriptsService = {
  getCallScripts: async (params?: { category?: string }) => {
    const response = await apiClient.get<CallScript[]>('/CallScripts', { params });
    return response.data;
  },

  getCallScriptById: async (id: string) => {
    const response = await apiClient.get<CallScript>(`/CallScripts/${id}`);
    return response.data;
  },

  createCallScript: async (data: CreateCallScriptRequest) => {
    const response = await apiClient.post<CallScript>('/CallScripts', data);
    return response.data;
  },

  updateCallScript: async (id: string, data: Partial<CreateCallScriptRequest>) => {
    const response = await apiClient.patch<CallScript>(`/CallScripts/${id}`, data);
    return response.data;
  },

  deleteCallScript: async (id: string) => {
    await apiClient.delete(`/CallScripts/${id}`);
  },

  setDefaultScript: async (id: string) => {
    const response = await apiClient.post<CallScript>(`/CallScripts/${id}/default`);
    return response.data;
  },
};
