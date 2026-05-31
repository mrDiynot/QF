'use client';

/**
 * Sidebar Notification Bell
 * Displays notification bell with real-time unread count in the sidebar
 */

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Loader2, Check, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/notifications/useNotifications';
import { useNotificationHub } from '@/hooks/notifications/useNotificationHub';
import type { Notification } from '@/types/notifications';

interface SidebarNotificationBellProps {
  collapsed: boolean;
}

export function SidebarNotificationBell({ collapsed }: SidebarNotificationBellProps) {
  const [open, setOpen] = useState(false);

  // Real-time SignalR connection
  const { isConnected } = useNotificationHub({ showToasts: true });

  // Fetch notifications from API
  const { data: notificationsData, isLoading } = useNotifications({ pageSize: 5 });
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
      setOpen(false);
      window.location.href = notification.actionUrl;
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const triggerContent = (
    <button
      className={cn(
        "relative flex items-center gap-2 rounded-lg border transition-all cursor-pointer",
        unreadCount > 0
          ? "bg-gradient-to-r from-orange-50 to-red-50 border-[#c23a00]/30 hover:border-[#c23a00]/50"
          : "bg-purple-50/50 border-purple-200 hover:border-purple-300 hover:bg-purple-50",
        collapsed ? "justify-center size-10 p-0" : "w-full px-2.5 py-2"
      )}
    >
      <div className="relative">
        <Bell className={cn(
          "transition-colors",
          unreadCount > 0 ? "text-[#c23a00]" : "text-[#1a0a2e]/60",
          collapsed ? "size-5" : "size-4"
        )} />
        {unreadCount > 0 && (
          <span className={cn(
            "absolute rounded-full bg-[#c23a00] text-white font-bold flex items-center justify-center animate-pulse",
            collapsed 
              ? "-top-2 -right-2 size-5 text-[10px]"
              : "-top-1.5 -right-1.5 size-4 text-[9px]"
          )}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>
      {!collapsed && (
        <>
          <div className="flex-1 min-w-0 text-left">
            <p className={cn(
              "text-xs font-medium truncate",
              unreadCount > 0 ? "text-[#c23a00]" : "text-[#1a0a2e]/60"
            )}>
              {unreadCount > 0 ? `${unreadCount} new notification${unreadCount > 1 ? 's' : ''}` : 'Notifications'}
            </p>
          </div>
          {isConnected && (
            <span className="size-2 rounded-full bg-green-500 shrink-0" title="Live updates active" />
          )}
        </>
      )}
    </button>
  );

  const popoverContent = (
    <div className="w-80">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell className="size-4 text-gray-600" />
          <span className="text-sm font-semibold text-gray-900">Notifications</span>
          {isConnected && (
            <span className="size-2 rounded-full bg-green-500" title="Live" />
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="h-7 text-xs text-purple-600 hover:text-purple-700"
          >
            <Check className="size-3 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-64">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-gray-400" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Bell className="size-8 mb-2 opacity-40" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleMarkAsRead(notification)}
                className={cn(
                  "w-full p-3 text-left hover:bg-gray-50 transition-colors",
                  !notification.isRead && "bg-orange-50/50"
                )}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm truncate",
                      !notification.isRead ? "font-semibold text-gray-900" : "text-gray-700"
                    )}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {notification.actionUrl && (
                    <ExternalLink className="size-3.5 text-gray-400 shrink-0 mt-0.5" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-2 border-t border-gray-100">
        <Link
          href="/notifications"
          onClick={() => setOpen(false)}
          className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
        >
          View all notifications
          <ExternalLink className="size-3" />
        </Link>
      </div>
    </div>
  );

  if (collapsed) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <PopoverTrigger asChild>
              <TooltipTrigger asChild>
                {triggerContent}
              </TooltipTrigger>
            </PopoverTrigger>
            <TooltipContent side="right" sideOffset={12}>
              <div>
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-1 text-xs opacity-70">({unreadCount} new)</span>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <PopoverContent side="right" align="end" sideOffset={12} className="p-0">
          {popoverContent}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {triggerContent}
      </PopoverTrigger>
      <PopoverContent side="right" align="end" sideOffset={12} className="p-0">
        {popoverContent}
      </PopoverContent>
    </Popover>
  );
}

