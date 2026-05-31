/**
 * Notifications React Query Hooks
 * Provides hooks for notification management with real-time polling
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  notificationsService,
  type Notification,
  type NotificationPreferences,
  type NotificationsPagedResponse,
} from '@/services/api/notifications.service';

/** Query key factory for notifications */
export const notificationKeys = {
  all: ['notifications'] as const,
  list: (filters?: { isRead?: boolean; type?: string }) => 
    [...notificationKeys.all, 'list', filters] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
  stats: () => [...notificationKeys.all, 'stats'] as const,
  preferences: () => [...notificationKeys.all, 'preferences'] as const,
};

/**
 * Hook to fetch notifications with polling for real-time updates
 */
export function useNotifications(params?: {
  pageNumber?: number;
  pageSize?: number;
  isRead?: boolean;
  type?: string;
  pollingInterval?: number; // in milliseconds, default 30000 (30 seconds)
}) {
  const { pollingInterval = 30000, ...queryParams } = params || {};
  
  return useQuery<NotificationsPagedResponse>({
    queryKey: notificationKeys.list(queryParams),
    queryFn: () => notificationsService.getNotifications(queryParams),
    refetchInterval: pollingInterval, // Real-time polling
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}

/**
 * Hook to fetch unread notification count with frequent polling
 */
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsService.getUnreadCount(),
    refetchInterval: 15000, // Poll every 15 seconds for unread count
    staleTime: 5000,
  });
}

/**
 * Hook to fetch notification statistics
 */
export function useNotificationStats() {
  return useQuery({
    queryKey: notificationKeys.stats(),
    queryFn: () => notificationsService.getStats(),
    refetchInterval: 60000, // Poll every minute
  });
}

/**
 * Default notification preferences (used when API endpoint not available)
 */
const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  newLeadNotification: true,
  newConversationNotification: true,
  bookingNotification: true,
  systemAlerts: true,
  marketingEmails: false,
  dailyDigest: false,
  weeklyReport: false,
};

/**
 * Hook to fetch notification preferences
 * Returns default preferences if endpoint not available (404)
 */
export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: async () => {
      try {
        return await notificationsService.getPreferences();
      } catch (error: unknown) {
        // If endpoint doesn't exist, return default preferences
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          console.warn('[Notifications] Preferences endpoint not available, using defaults');
          return DEFAULT_PREFERENCES;
        }
        throw error;
      }
    },
    retry: false, // Don't retry 404s
  });
}

/**
 * Hook to mark a single notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onMutate: async (id: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      // Snapshot current data for rollback
      const previousData = queryClient.getQueriesData({ queryKey: notificationKeys.all });

      // Optimistically update notification to read
      queryClient.setQueriesData(
        { queryKey: notificationKeys.list() },
        (old: NotificationsPagedResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((n: Notification) =>
              n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
            ),
            unreadCount: Math.max(0, old.unreadCount - 1),
          };
        }
      );

      // Also update unread count
      queryClient.setQueryData(
        notificationKeys.unreadCount(),
        (old: number | undefined) => Math.max(0, (old ?? 0) - 1)
      );

      return { previousData };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Failed to mark as read');
    },
    onSettled: () => {
      // Refetch to ensure data is correct - use refetchType: 'all' to force refetch
      queryClient.invalidateQueries({ queryKey: notificationKeys.all, refetchType: 'all' });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      toast.success('All notifications marked as read');
      // Remove and invalidate for fresh data
      queryClient.removeQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.all, refetchType: 'all' });
    },
    onError: () => {
      toast.error('Failed to mark all as read');
    },
  });
}

/**
 * Hook to delete a notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsService.deleteNotification(id),
    onSuccess: () => {
      toast.success('Notification deleted');
      queryClient.removeQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.all, refetchType: 'all' });
    },
    onError: () => {
      toast.error('Failed to delete notification');
    },
  });
}

/**
 * Hook to clear all notifications
 */
export function useClearAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsService.clearAll(),
    onSuccess: () => {
      toast.success('All notifications cleared');
      queryClient.removeQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.all, refetchType: 'all' });
    },
    onError: () => {
      toast.error('Failed to clear notifications');
    },
  });
}

/**
 * Hook to update notification preferences
 * Gracefully handles 404 if endpoint not available
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferences>) => {
      try {
        return await notificationsService.updatePreferences(preferences);
      } catch (error: unknown) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          // Endpoint not available - just update local cache
          console.warn('[Notifications] Preferences endpoint not available, storing locally');
          return { ...DEFAULT_PREFERENCES, ...preferences };
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success('Preferences saved');
      // Update cache with new preferences
      queryClient.setQueryData(notificationKeys.preferences(), data);
    },
    onError: () => {
      toast.error('Failed to save preferences');
    },
  });
}
