/**
 * Notification Service
 * API client for notification operations
 */

import { apiClient } from '@/lib/axios';
import type { Notification, NotificationsResponse } from '@/types/notifications';

const NOTIFICATIONS_BASE = '/notifications';

/**
 * Fetch notifications with pagination
 */
export async function getNotifications(params?: {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
}): Promise<NotificationsResponse> {
  const { data } = await apiClient.get<NotificationsResponse>(NOTIFICATIONS_BASE, {
    params: {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
      unreadOnly: params?.unreadOnly ?? false,
    },
  });
  return data;
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  const { data } = await apiClient.get<{ count: number }>(`${NOTIFICATIONS_BASE}/unread-count`);
  return data.count;
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  await apiClient.patch(`${NOTIFICATIONS_BASE}/${notificationId}/read`);
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<void> {
  await apiClient.patch(`${NOTIFICATIONS_BASE}/read-all`);
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  await apiClient.delete(`${NOTIFICATIONS_BASE}/${notificationId}`);
}

/**
 * Get a single notification by ID
 */
export async function getNotification(notificationId: string): Promise<Notification> {
  const { data } = await apiClient.get<Notification>(`${NOTIFICATIONS_BASE}/${notificationId}`);
  return data;
}

