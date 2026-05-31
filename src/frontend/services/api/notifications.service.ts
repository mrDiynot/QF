/**
 * Notifications Service
 * API service for managing in-app notifications
 */

import { apiClient } from '@/lib/axios';

export interface Notification {
  id: string;
  businessId?: string;
  userId?: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  link?: string; // Alias for actionUrl for backward compatibility
  data?: Record<string, unknown>;
  priority?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  newLeadNotification: boolean;
  newConversationNotification: boolean;
  bookingNotification: boolean;
  systemAlerts: boolean;
  marketingEmails: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  today: number;
  thisWeek: number;
}

export interface NotificationsPagedResponse {
  data: Notification[];
  totalCount: number;
  unreadCount: number;
}

export const notificationsService = {
  // Get all notifications with pagination
  getNotifications: async (params?: {
    pageNumber?: number;
    pageSize?: number;
    isRead?: boolean;
    type?: string;
  }): Promise<NotificationsPagedResponse> => {
    const response = await apiClient.get<NotificationsPagedResponse>('/notifications', { 
      params: {
        page: params?.pageNumber ?? 1,
        pageSize: params?.pageSize ?? 20,
        unreadOnly: params?.isRead === false,
      }
    });
    return response.data;
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
    return response.data.count;
  },

  // Get notification stats
  getStats: async (): Promise<NotificationStats> => {
    const response = await apiClient.get<NotificationStats>('/notifications/stats');
    return response.data;
  },

  // Mark single notification as read
  markAsRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/read-all');
  },

  // Delete a notification
  deleteNotification: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },

  // Clear all notifications
  clearAll: async (): Promise<void> => {
    await apiClient.delete('/notifications/clear-all');
  },

  // Get notification preferences
  getPreferences: async (): Promise<NotificationPreferences> => {
    const response = await apiClient.get<NotificationPreferences>('/notifications/preferences');
    return response.data;
  },

  // Update notification preferences
  updatePreferences: async (preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
    const response = await apiClient.put<NotificationPreferences>('/notifications/preferences', preferences);
    return response.data;
  },
};
