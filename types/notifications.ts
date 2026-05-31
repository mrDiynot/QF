/**
 * Notification Types
 * Matches the backend Notification entity and SignalR events
 */

/**
 * Notification type enum matching backend NotificationType
 */
export type NotificationType =
  // General (0-9)
  | 'Info'
  | 'Warning'
  | 'Error'
  | 'Success'
  // Usage & Subscription (10-19)
  | 'UsageAlert'
  | 'TrialExpiring'
  | 'TrialExpired'
  | 'PaymentFailed'
  | 'SubscriptionSuspended'
  | 'SubscriptionActivated'
  | 'PlanUpgraded'
  | 'PlanDowngraded'
  // Leads & Conversations (20-29)
  | 'NewLead'
  | 'LeadQualified'
  | 'LeadAssigned'
  | 'NewMessage'
  | 'ConversationAssigned'
  | 'ConversationEscalated'
  // Bookings (30-39)
  | 'BookingScheduled'
  | 'BookingReminder'
  | 'BookingCancelled'
  | 'BookingRescheduled'
  // Forms (40-49)
  | 'FormSubmission'
  // Team (50-59)
  | 'TeamMemberJoined'
  | 'TeamMemberRemoved'
  | 'InvitationAccepted'
  // Integrations (60-69)
  | 'WebhookFailed'
  | 'ChannelConnected'
  | 'ChannelDisconnected'
  | 'CrmSyncComplete'
  | 'CrmSyncFailed'
  | 'EmailBounced'
  // System (90-99)
  | 'SystemMaintenance'
  | 'FeatureAnnouncement';

/**
 * Notification priority
 */
export type NotificationPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

/**
 * Notification category for UI grouping
 */
export type NotificationCategory =
  | 'All'
  | 'Billing'
  | 'Leads'
  | 'Bookings'
  | 'Team'
  | 'Integrations'
  | 'System';

/**
 * Notification from API
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  data?: Record<string, unknown>;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: string;
}

/**
 * SignalR notification event (matches NotificationEvent on backend)
 */
export interface NotificationEvent {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  data?: unknown;
  priority: string;
  createdAt: string;
}

/**
 * SignalR usage alert event (matches UsageAlertEvent on backend)
 */
export interface UsageAlertEvent {
  resourceName: string;
  thresholdPercent: number;
  currentUsage: number;
  limit: number;
  createdAt: string;
}

/**
 * API response for paginated notifications
 */
export interface NotificationsResponse {
  data: Notification[];
  totalCount: number;
  unreadCount: number;
}

/**
 * Notification settings per type
 */
export interface NotificationSettings {
  type: NotificationType;
  enabled: boolean;
  showToast: boolean;
  playSound: boolean;
}

