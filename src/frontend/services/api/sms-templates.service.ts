/**
 * SMS Templates API Service
 * Integrates with SmsTemplatesController
 */

import { apiClient } from '@/lib/axios';

export interface SmsTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateSmsTemplateRequest {
  name: string;
  content: string;
  category: string;
}

export interface UpdateSmsTemplateRequest {
  name?: string;
  content?: string;
  category?: string;
  isActive?: boolean;
}

export const smsTemplatesService = {
  /**
   * Get all SMS templates for the current business
   */
  async getTemplates(category?: string, search?: string): Promise<SmsTemplate[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    
    const response = await apiClient.get<SmsTemplate[]>(
      `/sms-templates${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  /**
   * Get a specific SMS template by ID
   */
  async getTemplate(id: string): Promise<SmsTemplate> {
    const response = await apiClient.get<SmsTemplate>(`/sms-templates/${id}`);
    return response.data;
  },

  /**
   * Create a new SMS template
   */
  async createTemplate(request: CreateSmsTemplateRequest): Promise<SmsTemplate> {
    const response = await apiClient.post<SmsTemplate>('/sms-templates', request);
    return response.data;
  },

  /**
   * Update an existing SMS template
   */
  async updateTemplate(id: string, request: UpdateSmsTemplateRequest): Promise<SmsTemplate> {
    const response = await apiClient.patch<SmsTemplate>(`/sms-templates/${id}`, request);
    return response.data;
  },

  /**
   * Delete an SMS template
   */
  async deleteTemplate(id: string): Promise<void> {
    await apiClient.delete(`/sms-templates/${id}`);
  },

  /**
   * Mark a template as used (increments usage count)
   */
  async useTemplate(id: string): Promise<SmsTemplate> {
    const response = await apiClient.post<SmsTemplate>(`/sms-templates/${id}/use`);
    return response.data;
  },
};

export default smsTemplatesService;
