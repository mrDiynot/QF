/**
 * Emails API Service
 */

import { apiClient } from '@/lib/axios';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category?: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateEmailTemplateRequest {
  name: string;
  subject: string;
  body: string;
  category?: string;
}

export interface SendEmailRequest {
  to: string;
  templateId?: string;
  subject?: string;
  body?: string;
  variables?: Record<string, string>;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  status: 'sent' | 'delivered' | 'bounced' | 'failed';
  templateId?: string;
  sentAt: string;
  deliveredAt?: string;
  openedAt?: string;
}

export const emailsService = {
  getTemplates: async (params?: { category?: string }): Promise<EmailTemplate[]> => {
    try {
      const response = await apiClient.get<EmailTemplate[]>('/Emails/templates', { params });
      return response.data || [];
    } catch (error) {
      console.error('[Emails] Failed to get templates:', error);
      return [];
    }
  },

  getTemplateById: async (id: string): Promise<EmailTemplate> => {
    const response = await apiClient.get<EmailTemplate>(`/Emails/templates/${id}`);
    return response.data;
  },

  createTemplate: async (data: CreateEmailTemplateRequest): Promise<EmailTemplate> => {
    // Backend expects the full EmailTemplate object
    const payload = {
      name: data.name,
      subject: data.subject,
      body: data.body,
      category: data.category || 'general',
      variables: [],
      isActive: true,
    };
    console.log('[Emails] Creating template with payload:', payload);
    const response = await apiClient.post<EmailTemplate>('/Emails/templates', payload);
    return response.data;
  },

  updateTemplate: async (id: string, data: Partial<CreateEmailTemplateRequest>): Promise<EmailTemplate> => {
    const response = await apiClient.patch<EmailTemplate>(`/Emails/templates/${id}`, data);
    return response.data;
  },

  deleteTemplate: async (id: string): Promise<void> => {
    await apiClient.delete(`/Emails/templates/${id}`);
  },

  sendEmail: async (data: SendEmailRequest): Promise<{ messageId: string }> => {
    const response = await apiClient.post<{ messageId: string }>('/Emails/send', data);
    return response.data;
  },

  getEmailLogs: async (params?: { pageNumber?: number; pageSize?: number }) => {
    try {
      const response = await apiClient.get<{ items: EmailLog[]; totalCount: number }>('/Emails/logs', { params });
      return response.data || { items: [], totalCount: 0 };
    } catch (error) {
      console.error('[Emails] Failed to get logs:', error);
      return { items: [], totalCount: 0 };
    }
  },
};
