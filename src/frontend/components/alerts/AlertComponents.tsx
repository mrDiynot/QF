/* eslint-disable @next/next/no-img-element */
'use client';

/**
 * Notification & Alert Components
 * Toast notifications, in-app alerts, push notification cards
 * Note: Uses <img> for dynamic notification images
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  X,
  Check,
  AlertTriangle,
  Info,
  AlertCircle,
  Bell,
  MessageSquare,
  Users,
  Calendar,
  Zap,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

// Toast Notification (custom styled)
type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
  action?: { label: string; onClick: () => void };
  onClose?: () => void;
  duration?: number;
  className?: string;
}

const TOAST_CONFIG: Record<ToastVariant, { icon: React.ReactNode; styles: string }> = {
  success: {
    icon: <Check className="size-5" />,
    styles: 'bg-green-50 border-green-200 text-green-800',
  },
  error: {
    icon: <AlertCircle className="size-5" />,
    styles: 'bg-red-50 border-red-200 text-red-800',
  },
  warning: {
    icon: <AlertTriangle className="size-5" />,
    styles: 'bg-amber-50 border-amber-200 text-amber-800',
  },
  info: {
    icon: <Info className="size-5" />,
    styles: 'bg-muted/30 border-border text-info',
  },
};

export function Toast({
  title,
  description,
  variant = 'info',
  action,
  onClose,
  duration = 5000,
  className,
}: ToastProps) {
  const [visible, setVisible] = useState(true);
  const config = TOAST_CONFIG[variant];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-sm",
      config.styles,
      className
    )}>
      <div className="flex-shrink-0">{config.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{title}</p>
        {description && <p className="text-sm opacity-90 mt-1">{description}</p>}
        {action && (
          <Button
            variant="link"
            size="sm"
            className="p-0 h-auto mt-2"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </div>
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="size-6 -mt-1 -mr-1 opacity-60 hover:opacity-100"
          onClick={() => { setVisible(false); onClose(); }}
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}

// In-App Alert Banner
interface InAppAlertProps {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function InAppAlert({
  type,
  title,
  message,
  action,
  dismissible = true,
  onDismiss,
  className,
}: InAppAlertProps) {
  const [dismissed, setDismissed] = useState(false);
  const config = TOAST_CONFIG[type];

  if (dismissed) return null;

  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-lg border",
      config.styles,
      className
    )}>
      <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        {message && <p className="text-sm opacity-90 mt-1">{message}</p>}
        {action && (
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </div>
      {dismissible && (
        <Button
          variant="ghost"
          size="icon"
          className="size-6 opacity-60 hover:opacity-100"
          onClick={() => { setDismissed(true); onDismiss?.(); }}
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}

// Push Notification Card
interface PushNotificationCardProps {
  appName: string;
  appIcon?: string;
  title: string;
  message: string;
  time?: Date;
  onClick?: () => void;
  onClose?: () => void;
  className?: string;
}

export function PushNotificationCard({
  appName,
  appIcon,
  title,
  message,
  time,
  onClick,
  onClose,
  className,
}: PushNotificationCardProps) {
  return (
    <Card
      className={cn(
        "p-3 cursor-pointer hover:shadow-md transition-shadow max-w-sm",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {appIcon ? (
          <img src={appIcon} alt={appName} className="size-8 rounded-lg" />
        ) : (
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bell className="size-4 text-primary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">{appName}</span>
            {time && (
              <span className="text-xs text-muted-foreground/60">
                {formatDistanceToNow(time, { addSuffix: true })}
              </span>
            )}
          </div>
          <p className="font-medium text-foreground mt-1">{title}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">{message}</p>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="size-6 -mt-1 -mr-1"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}

// Notification Item (for lists)
type NotificationType = 'message' | 'lead' | 'calendar' | 'system' | 'mention';

interface NotificationItemProps {
  type: NotificationType;
  title: string;
  message?: string;
  time: Date;
  read?: boolean;
  avatar?: { src?: string; name: string };
  onClick?: () => void;
  onMarkAsRead?: () => void;
  className?: string;
}

const NOTIFICATION_ICONS: Record<NotificationType, React.ReactNode> = {
  message: <MessageSquare className="size-4" />,
  lead: <Users className="size-4" />,
  calendar: <Calendar className="size-4" />,
  system: <Zap className="size-4" />,
  mention: <Bell className="size-4" />,
};

export function AlertNotificationItem({
  type,
  title,
  message,
  time,
  read = false,
  avatar,
  onClick,
  className,
}: NotificationItemProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
        read ? "bg-white" : "bg-primary/5",
        "hover:bg-muted/20",
        className
      )}
      onClick={onClick}
    >
      {avatar ? (
        <Avatar className="size-10">
          <AvatarImage src={avatar.src} />
          <AvatarFallback>
            {avatar.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="size-10 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground">
          {NOTIFICATION_ICONS[type]}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm", !read && "font-medium")}>{title}</p>
          {!read && <span className="size-2 rounded-full bg-primary/50 flex-shrink-0 mt-1.5" />}
        </div>
        {message && <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{message}</p>}
        <p className="text-xs text-muted-foreground/60 mt-1">
          {formatDistanceToNow(time, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

// Floating Action Notification
interface FloatingNotificationProps {
  message: string;
  action?: { label: string; onClick: () => void };
  onClose?: () => void;
  position?: 'bottom-left' | 'bottom-right' | 'bottom-center';
  className?: string;
}

export function FloatingNotification({
  message,
  action,
  onClose,
  position = 'bottom-center',
  className,
}: FloatingNotificationProps) {
  const [visible, setVisible] = useState(true);

  const positions = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  if (!visible) return null;

  return (
    <div className={cn(
      "fixed z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3",
      positions[position],
      className
    )}>
      <p className="text-sm">{message}</p>
      {action && (
        <Button
          variant="link"
          size="sm"
          className="text-purple-400 hover:text-purple-300 p-0 h-auto"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-white hover:bg-white/20"
          onClick={() => { setVisible(false); onClose(); }}
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}

// Unread Count Badge
interface UnreadBadgeProps {
  count: number;
  max?: number;
  className?: string;
}

export function UnreadBadge({ count, max = 99, className }: UnreadBadgeProps) {
  if (count === 0) return null;

  return (
    <span className={cn(
      "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-xs font-medium",
      className
    )}>
      {count > max ? `${max}+` : count}
    </span>
  );
}

// Activity Notification
interface ActivityNotificationProps {
  user: { name: string; avatar?: string };
  action: string;
  target?: string;
  time: Date;
  link?: string;
  className?: string;
}

export function ActivityNotification({
  user,
  action,
  target,
  time,
  link,
  className,
}: ActivityNotificationProps) {
  const content = (
    <div className={cn("flex items-start gap-3 py-2", className)}>
      <Avatar className="size-8">
        <AvatarImage src={user.avatar} />
        <AvatarFallback className="text-xs">
          {user.name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium">{user.name}</span>
          {' '}{action}
          {target && <span className="font-medium"> {target}</span>}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">
          {formatDistanceToNow(time, { addSuffix: true })}
        </p>
      </div>
      {link && <ExternalLink className="size-4 text-muted-foreground/60" />}
    </div>
  );

  if (link) {
    return <a href={link} className="block hover:bg-muted/20 rounded-lg px-2 -mx-2">{content}</a>;
  }

  return content;
}

// Notification Empty State
export function NotificationEmptyState({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-8 text-center", className)}>
      <div className="size-12 rounded-full bg-muted/40 flex items-center justify-center mb-3">
        <Bell className="size-6 text-muted-foreground/60" />
      </div>
      <p className="font-medium text-foreground">All caught up!</p>
      <p className="text-sm text-muted-foreground mt-1">No new notifications</p>
    </div>
  );
}
