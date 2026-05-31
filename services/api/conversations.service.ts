/**
 * Conversations API Service
 * Handles all conversation and message-related API calls
 */

import { apiClient } from '@/lib/axios';
import type { 
  Conversation, 
  Message, 
  CreateMessageRequest, 
  ConversationNote,
  PaginatedResponse 
} from '@/types/api';

export const conversationsService = {
  /**
   * Get all conversations
   * GET /api/v1/Conversations
   * Supports filtering by status and channel
   */
  getConversations: async (params?: {
    pageNumber?: number;
    pageSize?: number;
    status?: string;
    channel?: string;
  }): Promise<PaginatedResponse<Conversation>> => {
    // Map frontend param names to backend param names
    const apiParams: Record<string, unknown> = {};
    if (params?.pageNumber) apiParams.page = params.pageNumber;
    if (params?.pageSize) apiParams.pageSize = params.pageSize;
    if (params?.status) apiParams.status = params.status;
    if (params?.channel && params.channel !== 'all') apiParams.channel = params.channel;
    
    const response = await apiClient.get<PaginatedResponse<Conversation>>('/Conversations', { params: apiParams });
    return response.data;
  },

  /**
   * Get conversation list (simplified)
   * GET /api/v1/Conversations/list
   */
  getConversationList: async (): Promise<Conversation[]> => {
    const response = await apiClient.get<Conversation[]>('/Conversations/list');
    return response.data;
  },

  /**
   * Get a single conversation by ID
   * GET /api/v1/Conversations/{id}
   */
  getConversationById: async (id: string): Promise<Conversation> => {
    const response = await apiClient.get<Conversation>(`/Conversations/${id}`);
    return response.data;
  },

  /**
   * Create a new conversation
   * POST /api/v1/Conversations
   */
  createConversation: async (data: Partial<Conversation>): Promise<Conversation> => {
    const response = await apiClient.post<Conversation>('/Conversations', data);
    return response.data;
  },

  /**
   * Update a conversation
   * PATCH /api/v1/Conversations/{id}
   */
  updateConversation: async (id: string, data: Partial<Conversation>): Promise<Conversation> => {
    const response = await apiClient.patch<Conversation>(`/Conversations/${id}`, data);
    return response.data;
  },

  /**
   * Delete a conversation
   * DELETE /api/v1/Conversations/{id}
   */
  deleteConversation: async (id: string): Promise<void> => {
    await apiClient.delete(`/Conversations/${id}`);
  },

  /**
   * Get unread count for a conversation
   * GET /api/v1/Conversations/{id}/unread-count
   */
  getUnreadCount: async (id: string): Promise<number> => {
    const response = await apiClient.get<number>(`/Conversations/${id}/unread-count`);
    return response.data;
  },

  /**
   * Get total unread count across all conversations
   * Sums unreadCount from all open conversations
   */
  getTotalUnreadCount: async (): Promise<number> => {
    try {
      const response = await apiClient.get<PaginatedResponse<Conversation>>('/Conversations', {
        params: { pageSize: 100 }
      });
      // Sum unread counts from all conversations
      return response.data.items?.reduce((sum: number, c: Conversation) => sum + (c.unreadCount || 0), 0) || 0;
    } catch {
      return 0;
    }
  },

  /**
   * Get conversation notes
   * GET /api/v1/conversations/{conversationId}/notes
   */
  getNotes: async (conversationId: string): Promise<ConversationNote[]> => {
    const response = await apiClient.get<ConversationNote[]>(`/conversations/${conversationId}/notes`);
    return response.data;
  },

  /**
   * Create a conversation note
   * POST /api/v1/conversations/{conversationId}/notes
   */
  createNote: async (conversationId: string, content: string): Promise<ConversationNote> => {
    const response = await apiClient.post<ConversationNote>(
      `/conversations/${conversationId}/notes`,
      { content }
    );
    return response.data;
  },

  /**
   * Toggle pin status of a note
   * POST /api/v1/conversations/{conversationId}/notes/{id}/toggle-pin
   */
  toggleNotePin: async (conversationId: string, noteId: string): Promise<ConversationNote> => {
    const response = await apiClient.post<ConversationNote>(
      `/conversations/${conversationId}/notes/${noteId}/toggle-pin`
    );
    return response.data;
  },

  /**
   * Takeover conversation from AI (or release back to AI)
   * POST /api/v1/Conversations/{id}/takeover
   */
  takeoverConversation: async (id: string, takeControl: boolean): Promise<Conversation> => {
    const response = await apiClient.post<Conversation>(`/Conversations/${id}/takeover`, {
      takeControl,
    });
    return response.data;
  },
};

export const messagesService = {
  /**
   * Get all messages
   * GET /api/v1/Messages
   */
  getMessages: async (params?: {
    conversationId?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Message>> => {
    const response = await apiClient.get<PaginatedResponse<Message>>('/Messages', { params });
    return response.data;
  },

  /**
   * Get a single message by ID
   * GET /api/v1/Messages/{id}
   */
  getMessageById: async (id: string): Promise<Message> => {
    const response = await apiClient.get<Message>(`/Messages/${id}`);
    return response.data;
  },

  /**
   * Send a new message
   * POST /api/v1/Messages
   */
  sendMessage: async (data: CreateMessageRequest): Promise<Message> => {
    const response = await apiClient.post<Message>('/Messages', data);
    return response.data;
  },

  /**
   * Update a message
   * PATCH /api/v1/Messages/{id}
   */
  updateMessage: async (id: string, data: Partial<Message>): Promise<Message> => {
    const response = await apiClient.patch<Message>(`/Messages/${id}`, data);
    return response.data;
  },

  /**
   * Delete a message
   * DELETE /api/v1/Messages/{id}
   */
  deleteMessage: async (id: string): Promise<void> => {
    await apiClient.delete(`/Messages/${id}`);
  },

  /**
   * Mark message as read
   * POST /api/v1/Messages/{id}/mark-as-read
   */
  markAsRead: async (id: string): Promise<void> => {
    await apiClient.post(`/Messages/${id}/mark-as-read`);
  },

  /**
   * Search messages
   * GET /api/v1/Messages/search
   */
  searchMessages: async (query: string): Promise<Message[]> => {
    const response = await apiClient.get<Message[]>('/Messages/search', {
      params: { query }
    });
    return response.data;
  },
};