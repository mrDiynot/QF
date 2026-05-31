/**
 * Real-Time Activity Feed
 * Live feed showing incoming leads, messages, and events in real-time
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { 
  Activity, User, MessageSquare, Calendar, FileText, 
  Phone, Mail, ChevronDown, ChevronUp, ExternalLink,
  Sparkles, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { NotificationEvent } from '@/types/notifications';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: Date;
  actionUrl?: string;
  data?: Record<string, unknown>;
  isNew?: boolean;
}

interface RealTimeActivityFeedProps {
  className?: string;
  maxItems?: number;
  showHeader?: boolean;
  onItemClick?: (item: ActivityItem) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  NewLead: <User className="size-4" />,
  LeadQualified: <Sparkles className="size-4" />,
  NewMessage: <MessageSquare className="size-4" />,
  BookingScheduled: <Calendar className="size-4" />,
  FormSubmission: <FileText className="size-4" />,
  VoiceCall: <Phone className="size-4" />,
  EmailReceived: <Mail className="size-4" />,
  ConversationEscalated: <AlertCircle className="size-4" />,
};

const COLOR_MAP: Record<string, string> = {
  NewLead: 'bg-green-100 text-green-600 border-green-200',
  LeadQualified: 'bg-primary/10 text-primary border-primary/20',
  NewMessage: 'bg-muted/50 text-info border-border',
  BookingScheduled: 'bg-primary/10 text-primary border-indigo-200',
  FormSubmission: 'bg-amber-100 text-amber-600 border-amber-200',
  VoiceCall: 'bg-muted/50 text-muted-foreground border-teal-200',
  EmailReceived: 'bg-muted/50 text-muted-foreground border-border',
  ConversationEscalated: 'bg-red-100 text-red-600 border-red-200',
};

export function RealTimeActivityFeed({
  className,
  maxItems = 20,
  showHeader = true,
  onItemClick,
}: RealTimeActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Add new activity from notification
  const _addActivity = useCallback((notification: NotificationEvent) => {
    const newActivity: ActivityItem = {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      description: notification.message,
      timestamp: new Date(notification.createdAt),
      actionUrl: notification.actionUrl,
      data: notification.data as Record<string, unknown>,
      isNew: true,
    };

    setActivities(prev => {
      const filtered = prev.filter(a => a.id !== notification.id);
      const updated = [newActivity, ...filtered].slice(0, maxItems);
      return updated;
    });

    // Remove "new" flag after animation
    setTimeout(() => {
      setActivities(prev => prev.map(a => 
        a.id === notification.id ? { ...a, isNew: false } : a
      ));
    }, 3000);
  }, [maxItems]);

  // Clear new flags when pausing
  useEffect(() => {
    if (isPaused) {
      setActivities(prev => prev.map(a => ({ ...a, isNew: false })));
    }
  }, [isPaused]);

  const handleItemClick = useCallback((item: ActivityItem) => {
    if (item.actionUrl) {
      onItemClick?.(item);
    }
  }, [onItemClick]);

  return (
    <div className={cn('bg-white rounded-xl border shadow-sm overflow-hidden', className)}>
      {showHeader && (
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex items-center gap-2">
            <Activity className="size-5 text-primary" />
            <h3 className="font-semibold text-sm">Live Activity</h3>
            {activities.filter(a => a.isNew).length > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 animate-pulse">
                {activities.filter(a => a.isNew).length} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              className={cn('text-xs', isPaused && 'text-orange-600')}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </Button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <ScrollArea className="h-80" ref={scrollRef}>
              <div className="p-3 space-y-2">
                <AnimatePresence mode="popLayout">
                  {activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/60">
                      <Activity className="size-8 mb-2 opacity-50" />
                      <p className="text-sm">No recent activity</p>
                      <p className="text-xs">New events will appear here</p>
                    </div>
                  ) : (
                    activities.map((activity) => (
                      <motion.div
                        key={activity.id}
                        layout
                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      >
                        <button
                          onClick={() => handleItemClick(activity)}
                          disabled={!activity.actionUrl}
                          className={cn(
                            'w-full flex items-start gap-3 p-3 rounded-lg border transition-all text-left',
                            'hover:shadow-md hover:border-primary/20',
                            activity.isNew && 'ring-2 ring-green-400 ring-offset-1',
                            activity.actionUrl ? 'cursor-pointer' : 'cursor-default'
                          )}
                        >
                          <div className={cn('size-8 rounded-full flex items-center justify-center border flex-shrink-0', COLOR_MAP[activity.type] || 'bg-muted/40 text-muted-foreground')}>
                            {ICON_MAP[activity.type] || <Activity className="size-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                              {activity.isNew && <span className="size-2 rounded-full bg-green-500 animate-pulse" />}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">{activity.description}</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                              {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                            </p>
                          </div>
                          {activity.actionUrl && <ExternalLink className="size-4 text-muted-foreground/60 flex-shrink-0 mt-1" />}
                        </button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Export hook for adding activities from external sources
export function useActivityFeed() {
  const addActivityRef = useRef<((notification: NotificationEvent) => void) | null>(null);
  
  return {
    addActivity: (notification: NotificationEvent) => addActivityRef.current?.(notification),
    setAddActivityFn: (fn: (notification: NotificationEvent) => void) => {
      addActivityRef.current = fn;
    },
  };
}

