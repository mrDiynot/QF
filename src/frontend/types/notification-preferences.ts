/**
 * Notification Preferences Types
 * User preferences for notification channels and settings
 */

export type NotificationChannel = 'inApp' | 'push' | 'sound' | 'email' | 'sms';

export type NotificationCategory =
  | 'leads'
  | 'messages'
  | 'bookings'
  | 'billing'
  | 'team'
  | 'system';

export interface NotificationChannelSettings {
  enabled: boolean;
  volume?: number; // For sound channel only (0-1)
}

export interface NotificationCategoryPreferences {
  category: NotificationCategory;
  channels: Record<NotificationChannel, NotificationChannelSettings>;
}

export interface NotificationPreferences {
  // Global settings
  enabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:mm format
  quietHoursEnd: string; // HH:mm format
  
  // Desktop notifications
  browserPushEnabled: boolean;
  
  // Sound settings
  soundEnabled: boolean;
  soundVolume: number; // 0-1
  
  // Per-category preferences
  categories: NotificationCategoryPreferences[];
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  browserPushEnabled: true,
  soundEnabled: true,
  soundVolume: 0.7,
  categories: [
    {
      category: 'leads',
      channels: {
        inApp: { enabled: true },
        push: { enabled: true },
        sound: { enabled: true, volume: 0.8 },
        email: { enabled: false },
        sms: { enabled: false },
      },
    },
    {
      category: 'messages',
      channels: {
        inApp: { enabled: true },
        push: { enabled: true },
        sound: { enabled: true, volume: 0.7 },
        email: { enabled: false },
        sms: { enabled: false },
      },
    },
    {
      category: 'bookings',
      channels: {
        inApp: { enabled: true },
        push: { enabled: true },
        sound: { enabled: true, volume: 0.6 },
        email: { enabled: true },
        sms: { enabled: false },
      },
    },
    {
      category: 'billing',
      channels: {
        inApp: { enabled: true },
        push: { enabled: true },
        sound: { enabled: false },
        email: { enabled: true },
        sms: { enabled: false },
      },
    },
    {
      category: 'team',
      channels: {
        inApp: { enabled: true },
        push: { enabled: false },
        sound: { enabled: false },
        email: { enabled: true },
        sms: { enabled: false },
      },
    },
    {
      category: 'system',
      channels: {
        inApp: { enabled: true },
        push: { enabled: false },
        sound: { enabled: false },
        email: { enabled: false },
        sms: { enabled: false },
      },
    },
  ],
};

