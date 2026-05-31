/**
 * Enhanced Notifications Hook
 * Integrates in-app notifications, browser push, and sound alerts
 */

'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import type { NotificationEvent } from '@/types/notifications';
import type { NotificationPreferences, NotificationCategory } from '@/types/notification-preferences';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '@/types/notification-preferences';
import { notificationHubManager } from '@/lib/signalr/notificationHubManager';
import {
  isPushNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  showBrowserNotification,
} from '@/lib/push-notifications';
import {
  playNotificationSound,
  getNotificationSoundType,
  preloadAllSounds,
} from '@/lib/notification-sounds';

interface UseEnhancedNotificationsOptions {
  onNotification?: (notification: NotificationEvent) => void;
  onHighPriorityNotification?: (notification: NotificationEvent) => void;
}

interface EnhancedNotificationsState {
  isConnected: boolean;
  unreadCount: number;
  highPriorityCount: number;
  pushPermission: NotificationPermission | 'unsupported';
  preferences: NotificationPreferences;
}

const LOCAL_STORAGE_KEY = 'qualiflow_notification_preferences';

// High priority notification types that should always alert
const HIGH_PRIORITY_TYPES = ['NewLead', 'LeadQualified', 'ConversationEscalated', 'BookingScheduled'];

/**
 * Map notification type to category
 */
function getNotificationCategory(type: string): NotificationCategory {
  if (['NewLead', 'LeadQualified', 'LeadAssigned', 'FormSubmission'].includes(type)) return 'leads';
  if (['NewMessage', 'ConversationAssigned', 'ConversationEscalated'].includes(type)) return 'messages';
  if (['BookingScheduled', 'BookingReminder', 'BookingCancelled'].includes(type)) return 'bookings';
  if (['PaymentFailed', 'SubscriptionSuspended', 'PlanUpgraded', 'UsageAlert'].includes(type)) return 'billing';
  if (['TeamMemberJoined', 'TeamMemberRemoved', 'InvitationAccepted'].includes(type)) return 'team';
  return 'system';
}

export function useEnhancedNotifications(options: UseEnhancedNotificationsOptions = {}) {
  const { onNotification, onHighPriorityNotification } = options;
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const subscriberIdRef = useRef(`enhanced-notifications-${Date.now()}`);

  const [state, setState] = useState<EnhancedNotificationsState>({
    isConnected: false,
    unreadCount: 0,
    highPriorityCount: 0,
    pushPermission: 'unsupported',
    preferences: DEFAULT_NOTIFICATION_PREFERENCES,
  });

  // Load preferences from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedPrefs = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        setState(prev => ({ ...prev, preferences: { ...DEFAULT_NOTIFICATION_PREFERENCES, ...parsed } }));
      } catch { /* ignore */ }
    }

    // Check push permission
    setState(prev => ({ ...prev, pushPermission: getNotificationPermission() }));
    
    // Preload sounds
    preloadAllSounds();
  }, []);

  // Save preferences to localStorage
  const updatePreferences = useCallback((newPrefs: Partial<NotificationPreferences>) => {
    setState(prev => {
      const updated = { ...prev.preferences, ...newPrefs };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return { ...prev, preferences: updated };
    });
  }, []);

  // Request push permission
  const requestPushPermission = useCallback(async () => {
    const permission = await requestNotificationPermission();
    setState(prev => ({ ...prev, pushPermission: permission }));
    return permission;
  }, []);

  // Check if we're in quiet hours
  const isInQuietHours = useCallback(() => {
    const { quietHoursEnabled, quietHoursStart, quietHoursEnd } = state.preferences;
    if (!quietHoursEnabled) return false;

    const now = new Date();
    const [startH, startM] = quietHoursStart.split(':').map(Number);
    const [endH, endM] = quietHoursEnd.split(':').map(Number);
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;

    if (startMins <= endMins) {
      return currentMins >= startMins && currentMins < endMins;
    }
    return currentMins >= startMins || currentMins < endMins;
  }, [state.preferences]);

  // Check if channel is enabled for category
  const isChannelEnabled = useCallback((category: NotificationCategory, channel: 'push' | 'sound') => {
    const { enabled, categories } = state.preferences;
    if (!enabled) return false;
    const catPrefs = categories.find(c => c.category === category);
    if (!catPrefs) return false;
    return catPrefs.channels[channel]?.enabled ?? false;
  }, [state.preferences]);

  // Handle incoming notification
  const handleNotification = useCallback(async (data: unknown) => {
    const notification = data as NotificationEvent;
    const isHighPriority = HIGH_PRIORITY_TYPES.includes(notification.type);
    const category = getNotificationCategory(notification.type);

    // Invalidate queries with refetchType: 'all' for real-time updates
    queryClient.invalidateQueries({ queryKey: ['notifications'], refetchType: 'all' });
    
    // Update counts
    setState(prev => ({
      ...prev,
      unreadCount: prev.unreadCount + 1,
      highPriorityCount: isHighPriority ? prev.highPriorityCount + 1 : prev.highPriorityCount,
    }));

    // Call custom handlers
    onNotification?.(notification);
    if (isHighPriority) onHighPriorityNotification?.(notification);

    // Skip alerts during quiet hours (except high priority)
    if (isInQuietHours() && !isHighPriority) return;

    // Show in-app toast
    const toastVariant = isHighPriority ? 'warning' : 'info';
    const toastFn = toastVariant === 'warning' ? toast.warning : toast.info;
    toastFn(notification.title, {
      description: notification.message,
      duration: isHighPriority ? 10000 : 5000,
      action: notification.actionUrl ? { label: 'View', onClick: () => window.location.href = notification.actionUrl! } : undefined,
    });

    // Browser push notification
    if (isChannelEnabled(category, 'push') && state.pushPermission === 'granted') {
      await showBrowserNotification({
        title: notification.title,
        body: notification.message,
        tag: notification.id,
        requireInteraction: isHighPriority,
        data: { actionUrl: notification.actionUrl },
      });
    }

    // Sound alert
    if (isChannelEnabled(category, 'sound')) {
      const soundType = getNotificationSoundType(notification.type);
      if (soundType) {
        const volume = state.preferences.soundVolume;
        await playNotificationSound(soundType, volume);
      }
    }
  }, [queryClient, onNotification, onHighPriorityNotification, isInQuietHours, isChannelEnabled, state.pushPermission, state.preferences.soundVolume]);

  // Handle count update
  const handleCountUpdate = useCallback((data: unknown) => {
    const count = data as number;
    setState(prev => ({ ...prev, unreadCount: count }));
  }, []);

  // Connect to SignalR
  useEffect(() => {
    if (status !== 'authenticated' || !session?.accessToken) return;

    const accessToken = session.accessToken;
    const subscriberId = subscriberIdRef.current;

    // Register event handlers
    notificationHubManager.on(subscriberId, 'ReceiveNotification', handleNotification);
    notificationHubManager.on(subscriberId, 'NotificationCountUpdate', handleCountUpdate);

    // State change handler
    notificationHubManager.onStateChange(subscriberId, (connected) => {
      setState(prev => ({ ...prev, isConnected: connected }));
    });

    // Connect
    notificationHubManager.connect(accessToken, subscriberId).catch(err => {
      console.error('[EnhancedNotifications] Connection failed:', err);
    });

    return () => {
      notificationHubManager.disconnect(subscriberId);
    };
  }, [status, session?.accessToken, handleNotification, handleCountUpdate]);

  // Mark notification as read and decrement count
  const markAsRead = useCallback((_notificationId: string) => {
    setState(prev => ({
      ...prev,
      unreadCount: Math.max(0, prev.unreadCount - 1),
    }));
    queryClient.invalidateQueries({ queryKey: ['notifications'], refetchType: 'all' });
  }, [queryClient]);

  // Clear high priority count
  const clearHighPriorityCount = useCallback(() => {
    setState(prev => ({ ...prev, highPriorityCount: 0 }));
  }, []);

  return {
    ...state,
    updatePreferences,
    requestPushPermission,
    markAsRead,
    clearHighPriorityCount,
    isPushSupported: isPushNotificationSupported(),
  };
}

