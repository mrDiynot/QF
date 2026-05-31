/**
 * Chat Widgets API Service
 */

import { apiClient } from '@/lib/axios';

export interface ChatWidget {
  id: string;
  name: string;
  primaryColor: string;
  position: 'bottom-right' | 'bottom-left';
  welcomeMessage: string;
  offlineMessage?: string;
  isActive: boolean;
  showBranding: boolean;
  allowAttachments: boolean;
  requireEmail: boolean;
  embedCode: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateChatWidgetRequest {
  name: string;
  primaryColor?: string;
  position?: 'bottom-right' | 'bottom-left';
  welcomeMessage?: string;
  offlineMessage?: string;
  showBranding?: boolean;
  allowAttachments?: boolean;
  requireEmail?: boolean;
}

export const chatWidgetsService = {
  getChatWidgets: async () => {
    const response = await apiClient.get<ChatWidget[]>('/ChatWidgets');
    return response.data;
  },

  getChatWidgetById: async (id: string) => {
    const response = await apiClient.get<ChatWidget>(`/ChatWidgets/${id}`);
    return response.data;
  },

  createChatWidget: async (data: CreateChatWidgetRequest) => {
    const response = await apiClient.post<ChatWidget>('/ChatWidgets', data);
    return response.data;
  },

  updateChatWidget: async (id: string, data: Partial<CreateChatWidgetRequest>) => {
    const response = await apiClient.patch<ChatWidget>(`/ChatWidgets/${id}`, data);
    return response.data;
  },

  deleteChatWidget: async (id: string) => {
    await apiClient.delete(`/ChatWidgets/${id}`);
  },

  toggleActive: async (id: string, isActive: boolean) => {
    const response = await apiClient.patch<ChatWidget>(`/ChatWidgets/${id}/toggle`, { isActive });
    return response.data;
  },

  getEmbedCode: async (id: string) => {
    const response = await apiClient.get<{ embedCode: string }>(`/ChatWidgets/${id}/embed`);
    return response.data;
  },
};
