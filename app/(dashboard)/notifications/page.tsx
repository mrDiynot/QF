'use client';

/**
 * Notifications Page
 * View and manage all notifications
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  RefreshCw,
  MessageSquare,
  Calendar,
  AlertCircle,
  Info,
  UserPlus,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from '@/hooks/api/useNotifications';
import type { Notification } from '@/services/api/notifications.service';

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  // General
  info: { icon: <Info className="size-4" />, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  success: { icon: <Check className="size-4" />, color: 'text-green-600', bgColor: 'bg-green-100' },
  warning: { icon: <AlertCircle className="size-4" />, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  error: { icon: <AlertCircle className="size-4" />, color: 'text-red-600', bgColor: 'bg-red-100' },
  // Subscription & Billing
  usagealert: { icon: <AlertCircle className="size-4" />, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  subscription: { icon: <Bell className="size-4" />, color: 'text-green-600', bgColor: 'bg-green-100' },
  billing: { icon: <Bell className="size-4" />, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  trial: { icon: <Bell className="size-4" />, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  // Leads & Conversations
  lead: { icon: <UserPlus className="size-4" />, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  conversation: { icon: <MessageSquare className="size-4" />, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  message: { icon: <MessageSquare className="size-4" />, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  mention: { icon: <MessageSquare className="size-4" />, color: 'text-pink-600', bgColor: 'bg-pink-100' },
  // Bookings
  booking: { icon: <Calendar className="size-4" />, color: 'text-teal-600', bgColor: 'bg-teal-100' },
  bookingreminder: { icon: <Calendar className="size-4" />, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  // Forms
  formsubmission: { icon: <Bell className="size-4" />, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  // Team
  teammember: { icon: <UserPlus className="size-4" />, color: 'text-green-600', bgColor: 'bg-green-100' },
  invitation: { icon: <UserPlus className="size-4" />, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  // Integrations
  webhook: { icon: <AlertCircle className="size-4" />, color: 'text-red-600', bgColor: 'bg-red-100' },
  channel: { icon: <Bell className="size-4" />, color: 'text-green-600', bgColor: 'bg-green-100' },
  crmsync: { icon: <Bell className="size-4" />, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  email: { icon: <MessageSquare className="size-4" />, color: 'text-red-600', bgColor: 'bg-red-100' },
  // System
  systemhealth: { icon: <AlertCircle className="size-4" />, color: 'text-red-600', bgColor: 'bg-red-100' },
  security: { icon: <AlertCircle className="size-4" />, color: 'text-red-600', bgColor: 'bg-red-100' },
  supportticket: { icon: <Bell className="size-4" />, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  system: { icon: <Bell className="size-4" />, color: 'text-gray-600', bgColor: 'bg-gray-100' },
};


export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const router = useRouter();

  // Fetch notifications with real-time polling (every 30 seconds)
  const { data: notificationsData, isLoading, refetch, isFetching } = useNotifications({
    pageSize: 50,
    pollingInterval: 30000,
  });

  // Fetch unread count with more frequent polling (every 15 seconds)
  const { data: unreadCountData } = useUnreadNotificationCount();

  // Mutations
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteMutation = useDeleteNotification();

  // Handle notification click - mark as read and navigate
  const handleNotificationClick = (notification: Notification) => {
    // Add to processing state for visual feedback
    setProcessingIds(prev => new Set(prev).add(notification.id));

    // Mark as read if unread (fire and forget - optimistic update handles UI)
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id, {
        onSettled: () => {
          setProcessingIds(prev => {
            const next = new Set(prev);
            next.delete(notification.id);
            return next;
          });
        },
      });
    } else {
      // Already read, just clear processing state
      setTimeout(() => {
        setProcessingIds(prev => {
          const next = new Set(prev);
          next.delete(notification.id);
          return next;
        });
      }, 300);
    }

    // Navigate to action URL if available (check both actionUrl and link for compatibility)
    const targetUrl = notification.actionUrl || notification.link;
    if (targetUrl) {
      router.push(targetUrl);
    } else {
      // Default navigation based on notification type
      const typeRoutes: Record<string, string> = {
        lead: '/leads',
        conversation: '/conversations',
        booking: '/calendar',
        system: '/settings',
      };
      const route = typeRoutes[notification.type?.toLowerCase()] || '/dashboard';
      router.push(route);
    }
  };

  // Handle mark as read without navigation
  const handleMarkAsRead = (e: React.MouseEvent, notification: Notification) => {
    e.stopPropagation();
    if (notification.isRead) return;

    setProcessingIds(prev => new Set(prev).add(notification.id));
    markAsReadMutation.mutate(notification.id, {
      onSettled: () => {
        setProcessingIds(prev => {
          const next = new Set(prev);
          next.delete(notification.id);
          return next;
        });
      },
    });
  };

  // Handle delete
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setProcessingIds(prev => new Set(prev).add(id));
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const notifications = notificationsData?.data || [];
  const unreadCount = unreadCountData ?? notificationsData?.unreadCount ?? notifications.filter((n: Notification) => !n.isRead).length;

  // Filter notifications
  const filteredNotifications = notifications.filter((n: Notification) => {
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'read') return n.isRead;
    return true;
  });

  // Safe date formatting helper
  const formatTime = (dateStr: string) => {
    try {
      const date = dateStr ? new Date(dateStr) : null;
      if (date && !isNaN(date.getTime())) {
        return formatDistanceToNow(date, { addSuffix: true });
      }
      return 'just now';
    } catch {
      return 'just now';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="size-7 text-purple-600" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">{unreadCount} new</Badge>
            )}
          </h1>
          <p className="text-gray-500 mt-1">
            Stay updated with your leads, conversations, and system alerts
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
          >
            <CheckCheck className="size-4 mr-2" />
            Mark All Read
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="size-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Bell className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{notifications.length}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cn(
          unreadCount > 0 && "ring-2 ring-purple-500 bg-purple-50"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                unreadCount > 0 ? "bg-purple-600" : "bg-gray-100"
              )}>
                <BellOff className={cn(
                  "size-5",
                  unreadCount > 0 ? "text-white" : "text-gray-500"
                )} />
              </div>
              <div>
                <p className={cn(
                  "text-2xl font-bold",
                  unreadCount > 0 ? "text-purple-700" : "text-gray-700"
                )}>
                  {unreadCount}
                </p>
                <p className="text-xs text-gray-500">Unread</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Check className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {notifications.filter((n: Notification) => n.isRead).length}
                </p>
                <p className="text-xs text-gray-500">Read</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <UserPlus className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{notifications.filter((n: Notification) => n.type?.toLowerCase() === 'lead').length}</p>
                <p className="text-xs text-gray-500">Lead Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>Click on a notification to mark it as read</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">{unreadCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="size-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No notifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notification: Notification) => {
                    const config = TYPE_CONFIG[notification.type?.toLowerCase()] || TYPE_CONFIG.info;
                    const isProcessing = processingIds.has(notification.id);
                    const isUnread = !notification.isRead;
                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={cn(
                          "relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all group",
                          "hover:shadow-lg",
                          isUnread 
                            ? "bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border-purple-300 shadow-md" 
                            : "bg-gray-50/50 border-gray-200 hover:border-gray-300",
                          isProcessing && "opacity-60 pointer-events-none"
                        )}
                      >
                        {/* Unread indicator bar */}
                        {isUnread && (
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-600 rounded-l-xl" />
                        )}
                        
                        {/* Status badge */}
                        <div className="absolute -top-2 -right-2">
                          {isUnread ? (
                            <Badge className="bg-purple-600 text-white text-[10px] px-2 py-0.5 shadow-sm">
                              NEW
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-white text-gray-500 text-[10px] px-2 py-0.5 border-gray-300">
                              <Check className="size-3 mr-1" />
                              Read
                            </Badge>
                          )}
                        </div>
                        
                        <div className={cn(
                          "p-3 rounded-xl transition-transform group-hover:scale-105",
                          isUnread ? "bg-purple-100 shadow-sm" : "bg-gray-100",
                        )}>
                          <span className={isUnread ? "text-purple-600" : "text-gray-500"}>
                            {config.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pr-16">
                          <div className="flex items-center gap-2">
                            <h4 className={cn(
                              "font-semibold",
                              isUnread ? "text-purple-900" : "text-gray-700"
                            )}>
                              {notification.title}
                            </h4>
                            {isUnread && (
                              <span className="size-2.5 rounded-full bg-purple-600 animate-pulse" />
                            )}
                          </div>
                          <p className={cn(
                            "text-sm mt-1 line-clamp-2",
                            isUnread ? "text-gray-700" : "text-gray-500"
                          )}>
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <p className="text-xs text-gray-400">
                              {formatTime(notification.createdAt)}
                            </p>
                            {notification.isRead && notification.readAt && (
                              <p className="text-xs text-green-600 flex items-center gap-1">
                                <Check className="size-3" />
                                Read {formatTime(notification.readAt)}
                              </p>
                            )}
                            {isUnread && (
                              <button
                                onClick={(e) => handleMarkAsRead(e, notification)}
                                className="text-xs bg-purple-600 text-white px-2 py-1 rounded-md hover:bg-purple-700 font-medium transition-colors"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 absolute top-4 right-4">
                          {isProcessing ? (
                            <Loader2 className="size-4 animate-spin text-purple-500" />
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => handleDelete(e, notification.id)}
                            >
                              <Trash2 className="size-4 text-gray-400 hover:text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

    </div>
  );
}
