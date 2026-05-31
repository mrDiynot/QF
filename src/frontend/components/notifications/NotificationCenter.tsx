'use client';

/**
 * Notification Center Component
 * Central hub for all user notifications with real-time SignalR updates
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bell,
  CheckCheck,
  UserPlus,
  MessageSquare,
  Phone,
  Calendar,
  FileText,
  Zap,
  Info,
  Loader2,
  X,
  CreditCard,
  AlertTriangle,
  Users,
  Link2,
  Mail,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/notifications/useNotifications';
import { useNotificationHub } from '@/hooks/notifications/useNotificationHub';
import type { Notification } from '@/types/notifications';

// Icon and color config for each notification type
const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  // General
  Info: { icon: <Info className="size-4" />, color: 'bg-muted/50 text-info' },
  Warning: { icon: <AlertTriangle className="size-4" />, color: 'bg-amber-100 text-amber-600' },
  Error: { icon: <XCircle className="size-4" />, color: 'bg-red-100 text-red-600' },
  Success: { icon: <CheckCircle className="size-4" />, color: 'bg-green-100 text-green-600' },
  // Subscription
  UsageAlert: { icon: <AlertTriangle className="size-4" />, color: 'bg-orange-100 text-orange-600' },
  TrialExpiring: { icon: <CreditCard className="size-4" />, color: 'bg-amber-100 text-amber-600' },
  TrialExpired: { icon: <CreditCard className="size-4" />, color: 'bg-red-100 text-red-600' },
  PaymentFailed: { icon: <CreditCard className="size-4" />, color: 'bg-red-100 text-red-600' },
  SubscriptionSuspended: { icon: <CreditCard className="size-4" />, color: 'bg-red-100 text-red-600' },
  SubscriptionActivated: { icon: <CreditCard className="size-4" />, color: 'bg-green-100 text-green-600' },
  PlanUpgraded: { icon: <CreditCard className="size-4" />, color: 'bg-green-100 text-green-600' },
  PlanDowngraded: { icon: <CreditCard className="size-4" />, color: 'bg-muted/50 text-info' },
  // Leads
  NewLead: { icon: <UserPlus className="size-4" />, color: 'bg-primary/10 text-primary' },
  LeadQualified: { icon: <CheckCircle className="size-4" />, color: 'bg-green-100 text-green-600' },
  LeadAssigned: { icon: <Users className="size-4" />, color: 'bg-primary/10 text-primary' },
  NewMessage: { icon: <MessageSquare className="size-4" />, color: 'bg-muted/50 text-info' },
  ConversationAssigned: { icon: <MessageSquare className="size-4" />, color: 'bg-primary/10 text-primary' },
  ConversationEscalated: { icon: <AlertTriangle className="size-4" />, color: 'bg-red-100 text-red-600' },
  // Bookings
  BookingScheduled: { icon: <Calendar className="size-4" />, color: 'bg-primary/10 text-primary' },
  BookingReminder: { icon: <Calendar className="size-4" />, color: 'bg-amber-100 text-amber-600' },
  BookingCancelled: { icon: <Calendar className="size-4" />, color: 'bg-red-100 text-red-600' },
  BookingRescheduled: { icon: <Calendar className="size-4" />, color: 'bg-muted/50 text-info' },
  // Forms
  FormSubmission: { icon: <FileText className="size-4" />, color: 'bg-primary/10 text-primary' },
  // Team
  TeamMemberJoined: { icon: <Users className="size-4" />, color: 'bg-green-100 text-green-600' },
  TeamMemberRemoved: { icon: <Users className="size-4" />, color: 'bg-red-100 text-red-600' },
  InvitationAccepted: { icon: <Users className="size-4" />, color: 'bg-green-100 text-green-600' },
  // Integrations
  WebhookFailed: { icon: <Link2 className="size-4" />, color: 'bg-red-100 text-red-600' },
  ChannelConnected: { icon: <Phone className="size-4" />, color: 'bg-green-100 text-green-600' },
  ChannelDisconnected: { icon: <Phone className="size-4" />, color: 'bg-red-100 text-red-600' },
  CrmSyncComplete: { icon: <Zap className="size-4" />, color: 'bg-green-100 text-green-600' },
  CrmSyncFailed: { icon: <Zap className="size-4" />, color: 'bg-red-100 text-red-600' },
  EmailBounced: { icon: <Mail className="size-4" />, color: 'bg-red-100 text-red-600' },
  // System
  SystemMaintenance: { icon: <Info className="size-4" />, color: 'bg-muted/40 text-muted-foreground' },
  FeatureAnnouncement: { icon: <Zap className="size-4" />, color: 'bg-primary/10 text-primary' },
};

// Default config for unknown types
const DEFAULT_CONFIG = { icon: <Info className="size-4" />, color: 'bg-muted/40 text-muted-foreground' };

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  // Real-time SignalR connection
  const { isConnected } = useNotificationHub({ showToasts: true });

  // Fetch notifications from API
  const { data: notificationsData, isLoading } = useNotifications({ pageSize: 10 });
  const notifications = notificationsData?.data ?? [];
  const unreadCount = notificationsData?.unreadCount ?? 0;

  // Mutations
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const handleMarkAsRead = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("relative", className)}>
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 size-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          {/* Connection indicator */}
          <span className={cn(
            "absolute bottom-0 right-0 size-2 rounded-full border border-white",
            isConnected ? "bg-green-500" : "bg-gray-400"
          )} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-primary" />
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs h-7 text-primary hover:text-primary"
              disabled={markAllAsReadMutation.isPending}
            >
              <CheckCheck className="size-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-purple-400" />
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => {
                const config = TYPE_CONFIG[notification.type] || DEFAULT_CONFIG;
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex gap-3 p-3 hover:bg-muted/20 cursor-pointer transition-all group",
                      !notification.isRead && "bg-primary/5/60 hover:bg-primary/5"
                    )}
                    onClick={() => handleMarkAsRead(notification)}
                  >
                    <div className={cn(
                      "flex size-9 items-center justify-center rounded-lg flex-shrink-0 transition-transform group-hover:scale-105",
                      config.color
                    )}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm", !notification.isRead && "font-semibold text-foreground")}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="size-2.5 rounded-full bg-primary/50 flex-shrink-0 mt-1 animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center py-12">
              <div className="size-12 rounded-full bg-muted/40 flex items-center justify-center mb-3">
                <Bell className="size-6 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">All caught up!</p>
              <p className="text-xs text-muted-foreground/60 mt-1">No new notifications</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-2 border-t bg-muted/20">
            <Button variant="ghost" className="w-full text-xs text-primary hover:text-primary h-8" asChild>
              <a href="/notifications">View all notifications</a>
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Notification Badge (standalone)
export function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="inline-flex items-center justify-center size-5 rounded-full bg-red-500 text-white text-xs font-medium animate-pulse">
      {count > 99 ? '99+' : count}
    </span>
  );
}

// Notification Item for lists (full page view)
export function NotificationItem({ notification, onRead, onDelete }: {
  notification: Notification;
  onRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const config = TYPE_CONFIG[notification.type] || DEFAULT_CONFIG;

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-lg border transition-all cursor-pointer group",
        !notification.isRead ? "bg-primary/5/50 border-primary/20" : "hover:bg-muted/20 border-border/50"
      )}
      onClick={() => onRead?.(notification.id)}
    >
      <div className={cn("flex size-10 items-center justify-center rounded-lg transition-transform group-hover:scale-105", config.color)}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm", !notification.isRead && "font-semibold")}>{notification.title}</p>
        <p className="text-sm text-muted-foreground">{notification.message}</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
      {!notification.isRead && (
        <div className="size-2.5 rounded-full bg-primary/50 flex-shrink-0 mt-1" />
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="size-8 opacity-0 group-hover:opacity-100"
          onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
