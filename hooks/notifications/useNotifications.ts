/**
 * Notifications Hooks
 * React Query hooks for notification API operations
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as notificationService from '@/services/notification.service';
import type { Notification, NotificationsResponse } from '@/types/notifications';
import { queryConfig, invalidateListQueries } from '@/lib/query-config';

const NOTIFICATIONS_KEY = ['notifications'];
const UNREAD_COUNT_KEY = ['notifications', 'unread-count'];

/**
 * Fetch notifications with pagination
 */
export function useNotifications(params?: {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
}) {
  return useQuery<NotificationsResponse>({
    queryKey: [...NOTIFICATIONS_KEY, params],
    queryFn: () => notificationService.getNotifications(params),
    ...queryConfig.realtime, // Notifications need real-time updates
    refetchInterval: 30 * 1000, // Refetch every 30 seconds as backup
  });
}

/**
 * Get unread notification count
 */
export function useUnreadCount() {
  return useQuery<number>({
    queryKey: UNREAD_COUNT_KEY,
    queryFn: notificationService.getUnreadCount,
    ...queryConfig.realtime,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

/**
 * Mark a single notification as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.markAsRead,
    onMutate: async (notificationId) => {
      // Optimistically update the cache
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });

      const previousData = queryClient.getQueriesData<NotificationsResponse>({ queryKey: NOTIFICATIONS_KEY });

      queryClient.setQueriesData<NotificationsResponse>({ queryKey: NOTIFICATIONS_KEY }, (old) => {
        if (!old) return old;
        return {
          ...old,
          unreadCount: Math.max(0, old.unreadCount - 1),
          data: old.data.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          ),
        };
      });

      return { previousData };
    },
    onError: (_err, _notificationId, context) => {
      // Rollback on error
      context?.previousData?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      invalidateListQueries(queryClient, NOTIFICATIONS_KEY, [UNREAD_COUNT_KEY]);
    },
  });
}

/**
 * Mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.markAllAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });

      const previousData = queryClient.getQueriesData<NotificationsResponse>({ queryKey: NOTIFICATIONS_KEY });

      queryClient.setQueriesData<NotificationsResponse>({ queryKey: NOTIFICATIONS_KEY }, (old) => {
        if (!old) return old;
        return {
          ...old,
          unreadCount: 0,
          data: old.data.map((n) => ({ ...n, isRead: true })),
        };
      });

      queryClient.setQueryData(UNREAD_COUNT_KEY, 0);

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      context?.previousData?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      invalidateListQueries(queryClient, NOTIFICATIONS_KEY, [UNREAD_COUNT_KEY]);
    },
  });
}

/**
 * Delete a notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => {
      invalidateListQueries(queryClient, NOTIFICATIONS_KEY, [UNREAD_COUNT_KEY]);
    },
  });
}

// Re-export types
export type { Notification, NotificationsResponse };

