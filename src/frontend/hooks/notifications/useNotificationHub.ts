/**
 * Notification Hub Hook
 * Connects to SignalR NotificationHub for real-time notifications
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import type { NotificationEvent, UsageAlertEvent } from '@/types/notifications';
import { notificationHubManager } from '@/lib/signalr/notificationHubManager';

interface UseNotificationHubOptions {
  showToasts?: boolean;
  onNotification?: (notification: NotificationEvent) => void;
  onUsageAlert?: (alert: UsageAlertEvent) => void;
}

export function useNotificationHub(options: UseNotificationHubOptions = {}) {
  const { showToasts = true, onNotification, onUsageAlert } = options;
  const { data: session, status } = useSession();
  const subscriberIdRef = useRef<string>(`subscriber-${Math.random().toString(36).substr(2, 9)}`);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const queryClient = useQueryClient();

  // Get toast variant based on notification type
  const getToastVariant = useCallback((type: string): 'success' | 'error' | 'warning' | 'info' => {
    if (type.includes('Error') || type.includes('Failed') || type.includes('Expired') || type.includes('Suspended')) {
      return 'error';
    }
    if (type.includes('Warning') || type.includes('Expiring') || type.includes('Alert')) {
      return 'warning';
    }
    if (type.includes('Success') || type.includes('Qualified') || type.includes('Activated') || type.includes('Complete')) {
      return 'success';
    }
    return 'info';
  }, []);

  // Handle incoming notification
  const handleNotification = useCallback((data: unknown) => {
    const notification = data as NotificationEvent;
    // Invalidate notifications query to refresh list with refetchType: 'all'
    queryClient.invalidateQueries({ queryKey: ['notifications'], refetchType: 'all' });

    // Call custom handler
    onNotification?.(notification);

    // Show toast if enabled
    if (showToasts) {
      const variant = getToastVariant(notification.type);
      const toastFn = variant === 'error' ? toast.error
        : variant === 'warning' ? toast.warning
        : variant === 'success' ? toast.success
        : toast.info;

      toastFn(notification.title, {
        description: notification.message,
        action: notification.actionUrl ? {
          label: 'View',
          onClick: () => window.location.href = notification.actionUrl!,
        } : undefined,
      });
    }
  }, [queryClient, onNotification, showToasts, getToastVariant]);

  // Handle usage alert
  const handleUsageAlert = useCallback((data: unknown) => {
    const alert = data as UsageAlertEvent;
    onUsageAlert?.(alert);

    if (showToasts) {
      const isOverLimit = alert.thresholdPercent >= 100;
      const toastFn = isOverLimit ? toast.error : toast.warning;
      toastFn(`${alert.resourceName} Usage Alert`, {
        description: isOverLimit
          ? `You've reached your ${alert.resourceName.toLowerCase()} limit (${alert.currentUsage}/${alert.limit})`
          : `You've used ${alert.thresholdPercent}% of your ${alert.resourceName.toLowerCase()} limit`,
        action: {
          label: 'Upgrade',
          onClick: () => window.location.href = '/settings/subscription',
        },
      });
    }
  }, [onUsageAlert, showToasts]);

  // Handle notification count update
  const handleCountUpdate = useCallback((data: unknown) => {
    const count = data as number;
    setUnreadCount(count);
  }, []);

  // Handle notification marked as read (notificationId can be used for optimistic updates)
  const handleNotificationRead = useCallback((_data: unknown) => {
    // notificationId can be used for optimistic updates if needed
    // const notificationId = _data as string;
    queryClient.invalidateQueries({ queryKey: ['notifications'], refetchType: 'all' });
  }, [queryClient]);

  // Connect to hub
  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }

    const accessToken = session?.accessToken as string | undefined;
    if (!accessToken || !accessToken.trim()) {
      return;
    }

    const subscriberId = subscriberIdRef.current;

    // Register event handlers
    notificationHubManager.on(subscriberId, 'ReceiveNotification', handleNotification);
    notificationHubManager.on(subscriberId, 'ReceiveUsageAlert', handleUsageAlert);
    notificationHubManager.on(subscriberId, 'NotificationCountUpdate', handleCountUpdate);
    notificationHubManager.on(subscriberId, 'NotificationRead', handleNotificationRead);

    // Register state change callback
    notificationHubManager.onStateChange(subscriberId, setIsConnected);

    // Connect to hub
    notificationHubManager.connect(accessToken, subscriberId).catch((err) => {
      console.error('[NotificationHub] ❌ Connection failed:', err);
    });

    return () => {
      notificationHubManager.disconnect(subscriberId);
    };
  }, [status, session?.accessToken, handleNotification, handleUsageAlert, handleCountUpdate, handleNotificationRead]);

  // Mark notification as read via SignalR
  const markAsReadViaHub = useCallback(async (notificationId: string) => {
    try {
      await notificationHubManager.invoke('MarkAsReadAsync', notificationId);
    } catch (error) {
      console.error('[NotificationHub] Failed to mark as read:', error);
    }
  }, []);

  return {
    isConnected,
    unreadCount,
    markAsReadViaHub,
  };
}

