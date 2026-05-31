/**
 * Enhanced Notification Provider
 * Provides real-time notifications with push, sound, and high-priority banner support
 */

'use client';

import { useCallback, useState, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useEnhancedNotifications } from '@/hooks/notifications/useEnhancedNotifications';
import { HighPriorityNotificationBanner } from './HighPriorityNotificationBanner';
import type { NotificationEvent } from '@/types/notifications';
import type { NotificationPreferences } from '@/types/notification-preferences';

interface EnhancedNotificationContextValue {
  isConnected: boolean;
  unreadCount: number;
  highPriorityCount: number;
  pushPermission: NotificationPermission | 'unsupported';
  preferences: NotificationPreferences;
  isPushSupported: boolean;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  requestPushPermission: () => Promise<NotificationPermission | 'unsupported'>;
  markAsRead: (notificationId: string) => void;
  clearHighPriorityCount: () => void;
}

const EnhancedNotificationContext = createContext<EnhancedNotificationContextValue | null>(null);

export function useEnhancedNotificationContext() {
  const context = useContext(EnhancedNotificationContext);
  if (!context) {
    throw new Error('useEnhancedNotificationContext must be used within EnhancedNotificationProvider');
  }
  return context;
}

interface EnhancedNotificationProviderProps {
  children: ReactNode;
}

// High priority types that should show in the banner
const HIGH_PRIORITY_TYPES = ['NewLead', 'LeadQualified', 'ConversationEscalated', 'BookingScheduled'];

export function EnhancedNotificationProvider({ children }: EnhancedNotificationProviderProps) {
  const router = useRouter();
  const [highPriorityNotifications, setHighPriorityNotifications] = useState<NotificationEvent[]>([]);

  const handleHighPriorityNotification = useCallback((notification: NotificationEvent) => {
    if (HIGH_PRIORITY_TYPES.includes(notification.type)) {
      setHighPriorityNotifications(prev => {
        // Don't add duplicates
        if (prev.some(n => n.id === notification.id)) return prev;
        return [notification, ...prev].slice(0, 5); // Keep max 5
      });
    }
  }, []);

  const enhancedNotifications = useEnhancedNotifications({
    onHighPriorityNotification: handleHighPriorityNotification,
  });

  const handleDismiss = useCallback((id: string) => {
    setHighPriorityNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleDismissAll = useCallback(() => {
    setHighPriorityNotifications([]);
  }, []);

  const handleNavigate = useCallback((notification: NotificationEvent) => {
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  }, [router]);

  return (
    <EnhancedNotificationContext.Provider value={enhancedNotifications}>
      {/* High Priority Banner - Fixed at top */}
      <HighPriorityNotificationBanner
        notifications={highPriorityNotifications}
        onDismiss={handleDismiss}
        onDismissAll={handleDismissAll}
        onNavigate={handleNavigate}
      />

      {/* Add padding when banner is shown */}
      <div className={highPriorityNotifications.length > 0 ? 'pt-14' : ''}>
        {children}
      </div>
    </EnhancedNotificationContext.Provider>
  );
}

