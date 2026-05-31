/**
 * Support Ticket API Service
 * Handles customer-facing support ticket operations
 */

import { apiClient } from '@/lib/axios';
import type { PaginatedResponse } from '@/types/api';

// ============================================================================
// Types
// ============================================================================

export type TicketCategory =
  | 'None'
  | 'TechnicalSupport'
  | 'BillingInquiry'
  | 'FeatureRequest'
  | 'AccountIssue'
  | 'GeneralQuestion';

export type TicketPriority = 'None' | 'Low' | 'Medium' | 'High' | 'Critical';

export type TicketStatus =
  | 'None'
  | 'New'
  | 'Open'
  | 'AwaitingCustomer'
  | 'AwaitingInternal'
  | 'InProgress'
  | 'OnHold'
  | 'Resolved'
  | 'Closed';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  businessId: string | null;
  businessName: string | null;
  reporterEmail: string;
  reporterName: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  description: string;
  firstResponseDue: string | null;
  resolutionDue: string | null;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  slaBreached: boolean;
  assignedToAdminId: string | null;
  assignedToAdminName: string | null;
  createdAt: string;
  updatedAt: string | null;
  messageCount: number;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  content: string;
  isInternal: boolean;
  senderName: string;
  senderEmail: string;
  isSentByAdmin: boolean;
  createdAt: string;
  attachments: TicketAttachment[];
}

export interface TicketAttachment {
  id: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  createdAt: string;
}

export interface CreateTicketRequest {
  category: TicketCategory;
  priority: TicketPriority;
  subject: string;
  description: string;
}

export interface AddMessageRequest {
  content: string;
}

export interface TicketQuery {
  page?: number;
  pageSize?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
}

// ============================================================================
// Service
// ============================================================================

export const supportService = {
  /**
   * Create a new support ticket
   * POST /api/v1/support/tickets
   */
  createTicket: async (request: CreateTicketRequest): Promise<SupportTicket> => {
    const response = await apiClient.post<SupportTicket>('/support/tickets', request);
    return response.data;
  },

  /**
   * Get current user's tickets
   * GET /api/v1/support/tickets
   */
  getMyTickets: async (query?: TicketQuery): Promise<PaginatedResponse<SupportTicket>> => {
    const response = await apiClient.get<PaginatedResponse<SupportTicket>>('/support/tickets', {
      params: query,
    });
    return response.data;
  },

  /**
   * Get a specific ticket
   * GET /api/v1/support/tickets/{id}
   */
  getTicket: async (id: string): Promise<SupportTicket> => {
    const response = await apiClient.get<SupportTicket>(`/support/tickets/${id}`);
    return response.data;
  },

  /**
   * Get messages for a ticket (excludes internal notes)
   * GET /api/v1/support/tickets/{id}/messages
   */
  getTicketMessages: async (ticketId: string): Promise<TicketMessage[]> => {
    const response = await apiClient.get<TicketMessage[]>(`/support/tickets/${ticketId}/messages`);
    return response.data;
  },

  /**
   * Add a reply to a ticket
   * POST /api/v1/support/tickets/{id}/messages
   */
  addMessage: async (ticketId: string, request: AddMessageRequest): Promise<TicketMessage> => {
    const response = await apiClient.post<TicketMessage>(
      `/support/tickets/${ticketId}/messages`,
      request
    );
    return response.data;
  },
};
