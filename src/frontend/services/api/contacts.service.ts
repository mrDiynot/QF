/**
 * Contacts API Service
 * Handles all contact-related API calls (CRM)
 */

import { apiClient } from '@/lib/axios';
import type { Contact, CreateContactRequest, PaginatedResponse } from '@/types/api';

export const contactsService = {
  /**
   * Get all contacts
   * GET /api/v1/contacts
   */
  getContacts: async (params?: {
    pageNumber?: number;
    pageSize?: number;
    status?: string;
  }): Promise<PaginatedResponse<Contact>> => {
    const response = await apiClient.get<PaginatedResponse<Contact>>('/contacts', { params });
    return response.data;
  },

  /**
   * Get a single contact by ID
   * GET /api/v1/contacts/{id}
   */
  getContactById: async (id: string): Promise<Contact> => {
    const response = await apiClient.get<Contact>(`/contacts/${id}`);
    return response.data;
  },

  /**
   * Create a new contact
   * POST /api/v1/contacts
   */
  createContact: async (data: CreateContactRequest): Promise<Contact> => {
    const response = await apiClient.post<Contact>('/contacts', data);
    return response.data;
  },

  /**
   * Update a contact
   * PUT /api/v1/contacts/{id}
   */
  updateContact: async (id: string, data: Partial<Contact>): Promise<Contact> => {
    const response = await apiClient.put<Contact>(`/contacts/${id}`, data);
    return response.data;
  },

  /**
   * Delete a contact
   * DELETE /api/v1/contacts/{id}
   */
  deleteContact: async (id: string): Promise<void> => {
    await apiClient.delete(`/contacts/${id}`);
  },

  /**
   * Search contacts
   * GET /api/v1/contacts/search
   */
  searchContacts: async (query: string): Promise<Contact[]> => {
    const response = await apiClient.get<Contact[]>('/contacts/search', {
      params: { query }
    });
    return response.data;
  },

  /**
   * Get contact count
   * GET /api/v1/contacts/count
   */
  getContactCount: async (): Promise<number> => {
    const response = await apiClient.get<number>('/contacts/count');
    return response.data;
  },
};