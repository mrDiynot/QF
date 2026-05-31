/**
 * Conversation Notes API Service
 * Integrates with ConversationNotesController
 */

import { apiClient } from '@/lib/axios';

export interface ConversationNote {
  id: string;
  conversationId: string;
  content: string;
  isPinned: boolean;
  createdByUserId: string;
  createdByUserName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateConversationNoteRequest {
  content: string;
}

export interface UpdateConversationNoteRequest {
  content?: string;
}

export const conversationNotesService = {
  /**
   * Get all notes for a conversation
   */
  async getNotes(conversationId: string): Promise<ConversationNote[]> {
    const response = await apiClient.get<ConversationNote[]>(
      `/conversations/${conversationId}/notes`
    );
    return response.data;
  },

  /**
   * Get a specific note by ID
   */
  async getNote(conversationId: string, noteId: string): Promise<ConversationNote> {
    const response = await apiClient.get<ConversationNote>(
      `/conversations/${conversationId}/notes/${noteId}`
    );
    return response.data;
  },

  /**
   * Create a new note for a conversation
   */
  async createNote(
    conversationId: string,
    request: CreateConversationNoteRequest
  ): Promise<ConversationNote> {
    const response = await apiClient.post<ConversationNote>(
      `/conversations/${conversationId}/notes`,
      request
    );
    return response.data;
  },

  /**
   * Update an existing note
   */
  async updateNote(
    conversationId: string,
    noteId: string,
    request: UpdateConversationNoteRequest
  ): Promise<ConversationNote> {
    const response = await apiClient.patch<ConversationNote>(
      `/conversations/${conversationId}/notes/${noteId}`,
      request
    );
    return response.data;
  },

  /**
   * Delete a note
   */
  async deleteNote(conversationId: string, noteId: string): Promise<void> {
    await apiClient.delete(`/conversations/${conversationId}/notes/${noteId}`);
  },

  /**
   * Toggle pin status of a note
   */
  async togglePin(conversationId: string, noteId: string): Promise<ConversationNote> {
    const response = await apiClient.post<ConversationNote>(
      `/conversations/${conversationId}/notes/${noteId}/toggle-pin`
    );
    return response.data;
  },
};

export default conversationNotesService;
