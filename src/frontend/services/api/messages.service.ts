import { apiClient } from '@/lib/axios';
import type { Message, CreateMessageRequest, PaginatedResponse } from '@/types/api';

export const messagesService = {
  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await apiClient.get<PaginatedResponse<Message>>(
      `/messages?conversationId=${conversationId}`
    );
    return response.data.items || [];
  },

  /**
   * Send a new message
   */
  async sendMessage(data: CreateMessageRequest): Promise<Message> {
    const response = await apiClient.post<Message>('/messages', data);
    return response.data;
  },

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    await apiClient.post(`/messages/${messageId}/read`);
  },

  /**
   * Get message by ID
   */
  async getMessageById(messageId: string): Promise<Message> {
    const response = await apiClient.get<Message>(`/messages/${messageId}`);
    return response.data;
  },

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<void> {
    await apiClient.delete(`/messages/${messageId}`);
  },
};
