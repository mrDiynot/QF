/**
 * High Priority Notification Banner
 * Persistent banner that stays visible until user acknowledges high-priority notifications
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, ChevronRight, AlertTriangle, User, MessageSquare, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { NotificationEvent } from '@/types/notifications';

interface HighPriorityNotificationBannerProps {
  notifications: NotificationEvent[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
  onNavigate: (notification: NotificationEvent) => void;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'NewLead':
    case 'LeadQualified':
      return <User className="size-4" />;
    case 'NewMessage':
    case 'ConversationEscalated':
      return <MessageSquare className="size-4" />;
    case 'BookingScheduled':
      return <Calendar className="size-4" />;
    default:
      return <AlertTriangle className="size-4" />;
  }
}

function getNotificationColor(type: string) {
  switch (type) {
    case 'NewLead':
    case 'LeadQualified':
      return 'bg-green-500';
    case 'NewMessage':
      return 'bg-muted/300';
    case 'ConversationEscalated':
      return 'bg-orange-500';
    case 'BookingScheduled':
      return 'bg-primary/50';
    default:
      return 'bg-red-500';
  }
}

export function HighPriorityNotificationBanner({
  notifications,
  onDismiss,
  onDismissAll,
  onNavigate,
}: HighPriorityNotificationBannerProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate through notifications
  useEffect(() => {
    if (notifications.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notifications.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [notifications.length]);

  // Reset index when notifications change
  useEffect(() => {
    if (currentIndex >= notifications.length) {
      setCurrentIndex(0);
    }
  }, [notifications.length, currentIndex]);

  const handleClick = useCallback((notification: NotificationEvent) => {
    onNavigate(notification);
    onDismiss(notification.id);
  }, [onNavigate, onDismiss]);

  if (notifications.length === 0) return null;

  const currentNotification = notifications[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className={cn(
          'fixed top-0 left-0 right-0 z-[100] shadow-lg',
          'bg-gradient-to-r from-red-600 via-red-500 to-orange-500',
          isMinimized ? 'h-8' : 'h-auto'
        )}
      >
        {isMinimized ? (
          <button
            onClick={() => setIsMinimized(false)}
            className="w-full h-full flex items-center justify-center gap-2 text-white text-sm font-medium hover:bg-white/10"
          >
            <Bell className="size-4 animate-bounce" />
            <span>{notifications.length} high-priority notification{notifications.length > 1 ? 's' : ''}</span>
            <Badge variant="secondary" className="bg-white/20 text-white">
              Click to expand
            </Badge>
          </button>
        ) : (
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Icon and counter */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="size-6 text-white animate-pulse" />
                  <span className="absolute -top-1 -right-1 size-4 rounded-full bg-white text-red-600 text-xs flex items-center justify-center font-bold">
                    {notifications.length}
                  </span>
                </div>
                <div className="hidden md:block text-white/80 text-sm">
                  Action Required
                </div>
              </div>

              {/* Center: Current notification */}
              <button
                onClick={() => handleClick(currentNotification)}
                className="flex-1 flex items-center gap-3 text-left hover:bg-white/10 rounded-lg p-2 transition-colors"
              >
                <div className={cn('size-8 rounded-full flex items-center justify-center text-white', getNotificationColor(currentNotification.type))}>
                  {getNotificationIcon(currentNotification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{currentNotification.title}</p>
                  <p className="text-white/80 text-xs truncate">{currentNotification.message}</p>
                </div>
                <ChevronRight className="size-5 text-white/60" />
              </button>

              {/* Pagination dots */}
              {notifications.length > 1 && (
                <div className="hidden md:flex items-center gap-1">
                  {notifications.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={cn(
                        'size-2 rounded-full transition-all',
                        idx === currentIndex ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/60'
                      )}
                    />
                  ))}
                </div>
              )}

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(true)}
                  className="text-white hover:bg-white/20 hover:text-white"
                >
                  Minimize
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDismissAll}
                  className="text-white hover:bg-white/20 hover:text-white"
                >
                  <X className="size-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

