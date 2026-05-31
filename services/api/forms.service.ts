/**
 * Forms API Service
 * Handles all form-related API calls
 */

import { apiClient } from '@/lib/axios';
import type { Form, FormSubmission, CreateFormRequest, PaginatedResponse } from '@/types/api';

export const formsService = {
  /**
   * Get all forms
   * GET /api/v1/Forms
   */
  getForms: async (params?: {
    pageNumber?: number;
    pageSize?: number;
    status?: string;
  }): Promise<PaginatedResponse<Form>> => {
    // Backend expects 'page' not 'pageNumber'
    const apiParams = params ? {
      page: params.pageNumber,
      pageSize: params.pageSize,
      status: params.status,
    } : undefined;
    const response = await apiClient.get<PaginatedResponse<Form>>('/Forms', { params: apiParams });
    return response.data;
  },

  /**
   * Get a single form by ID
   * GET /api/v1/Forms/{id}
   */
  getFormById: async (id: string): Promise<Form> => {
    const response = await apiClient.get<Form>(`/Forms/${id}`);
    return response.data;
  },

  /**
   * Get form by slug
   * GET /api/v1/Forms/by-slug/{slug}
   */
  getFormBySlug: async (slug: string): Promise<Form> => {
    const response = await apiClient.get<Form>(`/Forms/by-slug/${slug}`);
    return response.data;
  },

  /**
   * Create a new form
   * POST /api/v1/Forms
   */
  createForm: async (data: CreateFormRequest): Promise<Form> => {
    const response = await apiClient.post<Form>('/Forms', data);
    return response.data;
  },

  /**
   * Update a form
   * PATCH /api/v1/Forms/{id}
   */
  updateForm: async (id: string, data: Partial<Form>): Promise<Form> => {
    const response = await apiClient.patch<Form>(`/Forms/${id}`, data);
    return response.data;
  },

  /**
   * Delete a form
   * DELETE /api/v1/Forms/{id}
   */
  deleteForm: async (id: string): Promise<void> => {
    await apiClient.delete(`/Forms/${id}`);
  },

  /**
   * Publish a form
   * POST /api/v1/Forms/{id}/publish
   */
  publishForm: async (id: string): Promise<Form> => {
    const response = await apiClient.post<Form>(`/Forms/${id}/publish`, {});
    return response.data;
  },

  /**
   * Archive a form
   * POST /api/v1/Forms/{id}/archive
   */
  archiveForm: async (id: string): Promise<Form> => {
    const response = await apiClient.post<Form>(`/Forms/${id}/archive`, {});
    return response.data;
  },

  /**
   * Get form submissions
   * GET /api/v1/Forms/{id}/submissions
   */
  getFormSubmissions: async (
    formId: string,
    params?: { pageNumber?: number; pageSize?: number }
  ): Promise<PaginatedResponse<FormSubmission>> => {
    const response = await apiClient.get<PaginatedResponse<FormSubmission>>(
      `/Forms/${formId}/submissions`,
      { params }
    );
    return response.data;
  },

  /**
   * Submit a form
   * POST /api/v1/Forms/{id}/submissions
   */
  submitForm: async (formId: string, data: Record<string, unknown>): Promise<FormSubmission> => {
    // Backend expects submittedData as a JSON string
    const response = await apiClient.post<FormSubmission>(`/Forms/${formId}/submissions`, {
      submittedData: JSON.stringify(data),
    });
    return response.data;
  },

  /**
   * Process a form submission
   * POST /api/v1/Forms/{id}/submissions/{submissionId}/process
   */
  processSubmission: async (formId: string, submissionId: string): Promise<void> => {
    await apiClient.post(`/Forms/${formId}/submissions/${submissionId}/process`);
  },

  /**
   * Get QR code data for a form
   * GET /api/v1/Forms/{id}/qr-code-data
   */
  getQrCodeData: async (formId: string): Promise<{ formId: string; formUrl: string; qrCodeUrl: string }> => {
    const response = await apiClient.get<{ formId: string; formUrl: string; qrCodeUrl: string }>(
      `/Forms/${formId}/qr-code-data`
    );
    return response.data;
  },

  /**
   * Get QR code image URL for a form
   */
  getQrCodeUrl: (formId: string, size: number = 256): string => {
    return `/api/v1/Forms/${formId}/qr-code?size=${size}`;
  },
};