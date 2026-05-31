'use client';

/**
 * Timeline & Activity Components
 * Display chronological events and activity logs
 */

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

// Timeline Item Types
type TimelineStatus = 'complete' | 'current' | 'upcoming' | 'error';

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date;
  status?: TimelineStatus;
  icon?: React.ReactNode;
  user?: { name: string; avatar?: string };
  metadata?: Record<string, string | number>;
}

interface TimelineProps {
  items: TimelineItem[];
  variant?: 'default' | 'compact' | 'detailed';
  showConnector?: boolean;
  className?: string;
}

const STATUS_STYLES: Record<TimelineStatus, { dot: string; line: string; icon: React.ReactNode }> = {
  complete: { dot: 'bg-green-500', line: 'bg-green-200', icon: <CheckCircle className="size-4 text-white" /> },
  current: { dot: 'bg-primary/50', line: 'bg-purple-200', icon: <Circle className="size-4 text-white" /> },
  upcoming: { dot: 'bg-muted', line: 'bg-muted', icon: <Clock className="size-4 text-muted-foreground" /> },
  error: { dot: 'bg-red-500', line: 'bg-red-200', icon: <AlertCircle className="size-4 text-white" /> },
};

export function Timeline({ items, variant = 'default', showConnector = true, className }: TimelineProps) {
  return (
    <div className={cn("relative", className)}>
      {items.map((item, index) => {
        const status = item.status || 'complete';
        const styles = STATUS_STYLES[status];
        const isLast = index === items.length - 1;

        return (
          <div key={item.id} className="relative flex gap-4 pb-8 last:pb-0">
            {/* Connector Line */}
            {showConnector && !isLast && (
              <div className={cn("absolute left-3 top-6 w-0.5 h-full -ml-px", styles.line)} />
            )}

            {/* Dot */}
            <div className={cn(
              "relative flex size-6 items-center justify-center rounded-full flex-shrink-0 z-10",
              styles.dot
            )}>
              {item.icon || styles.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {variant === 'compact' ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <span className="text-xs text-muted-foreground/60">
                    {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">{item.title}</p>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground/60 whitespace-nowrap ml-4">
                      {format(item.timestamp, 'MMM d, h:mm a')}
                    </span>
                  </div>
                  {variant === 'detailed' && item.user && (
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar className="size-5">
                        <AvatarImage src={item.user.avatar} />
                        <AvatarFallback className="text-xs">
                          {item.user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{item.user.name}</span>
                    </div>
                  )}
                  {variant === 'detailed' && item.metadata && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(item.metadata).map(([key, value]) => (
                        <Badge key={key} variant="secondary" className="text-xs">
                          {key}: {value}
                        </Badge>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Activity Log Types
type ActivityType = 'create' | 'update' | 'delete' | 'view' | 'message' | 'call' | 'email' | 'appointment' | 'automation';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: Date;
  user?: { name: string; avatar?: string };
}

const ACTIVITY_ICONS: Record<ActivityType, { icon: React.ReactNode; color: string }> = {
  create: { icon: <UserPlus className="size-4" />, color: 'bg-green-100 text-green-600' },
  update: { icon: <Edit className="size-4" />, color: 'bg-muted/50 text-info' },
  delete: { icon: <Trash2 className="size-4" />, color: 'bg-red-100 text-red-600' },
  view: { icon: <Eye className="size-4" />, color: 'bg-muted/40 text-muted-foreground' },
  message: { icon: <MessageSquare className="size-4" />, color: 'bg-primary/10 text-primary' },
  call: { icon: <Phone className="size-4" />, color: 'bg-green-100 text-green-600' },
  email: { icon: <Mail className="size-4" />, color: 'bg-amber-100 text-amber-600' },
  appointment: { icon: <Calendar className="size-4" />, color: 'bg-primary/10 text-primary' },
  automation: { icon: <Zap className="size-4" />, color: 'bg-muted/50 text-muted-foreground' },
};

interface ActivityLogProps {
  activities: ActivityItem[];
  maxItems?: number;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

export function ActivityLog({
  activities,
  maxItems,
  showLoadMore = false,
  onLoadMore,
  className,
}: ActivityLogProps) {
  const displayedActivities = maxItems ? activities.slice(0, maxItems) : activities;

  return (
    <div className={cn("space-y-1", className)}>
      {displayedActivities.map((activity) => {
        const config = ACTIVITY_ICONS[activity.type];
        
        return (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/20 transition-colors"
          >
            <div className={cn("flex size-8 items-center justify-center rounded-lg flex-shrink-0", config.color)}>
              {config.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{activity.title}</p>
              {activity.description && (
                <p className="text-xs text-muted-foreground">{activity.description}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                {activity.user && (
                  <>
                    <Avatar className="size-4">
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback className="text-[8px]">
                        {activity.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground/60">{activity.user.name}</span>
                    <span className="text-xs text-muted-foreground/30">•</span>
                  </>
                )}
                <span className="text-xs text-muted-foreground/60">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        );
      })}
      
      {showLoadMore && maxItems && activities.length > maxItems && (
        <button
          onClick={onLoadMore}
          className="w-full py-2 text-sm text-primary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
        >
          Load more ({activities.length - maxItems} remaining)
        </button>
      )}
    </div>
  );
}

// Changelog Display
interface ChangelogEntry {
  id: string;
  version: string;
  date: Date;
  title: string;
  changes: Array<{
    type: 'added' | 'changed' | 'fixed' | 'removed';
    description: string;
  }>;
}

interface ChangelogProps {
  entries: ChangelogEntry[];
  className?: string;
}

const CHANGE_TYPES = {
  added: { label: 'Added', color: 'bg-green-100 text-green-700' },
  changed: { label: 'Changed', color: 'bg-muted/50 text-info' },
  fixed: { label: 'Fixed', color: 'bg-amber-100 text-amber-700' },
  removed: { label: 'Removed', color: 'bg-red-100 text-red-700' },
};

export function Changelog({ entries, className }: ChangelogProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {entries.map((entry) => (
        <div key={entry.id}>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="font-mono">{entry.version}</Badge>
            <h3 className="font-semibold text-foreground">{entry.title}</h3>
            <span className="text-sm text-muted-foreground/60">{format(entry.date, 'MMM d, yyyy')}</span>
          </div>
          <div className="space-y-2 ml-2">
            {entry.changes.map((change, index) => {
              const config = CHANGE_TYPES[change.type];
              return (
                <div key={index} className="flex items-start gap-2">
                  <Badge variant="secondary" className={cn("text-xs flex-shrink-0", config.color)}>
                    {config.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{change.description}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// Horizontal Steps Timeline
interface Step {
  id: string;
  title: string;
  description?: string;
  status: 'complete' | 'current' | 'upcoming';
}

interface StepsProps {
  steps: Step[];
  className?: string;
}

export function Steps({ steps, className }: StepsProps) {
  return (
    <div className={cn("flex items-center", className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        
        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={cn(
                "flex size-8 items-center justify-center rounded-full font-medium text-sm",
                step.status === 'complete' && "bg-green-500 text-white",
                step.status === 'current' && "bg-primary/50 text-white",
                step.status === 'upcoming' && "bg-muted text-muted-foreground"
              )}>
                {step.status === 'complete' ? (
                  <CheckCircle className="size-5" />
                ) : (
                  index + 1
                )}
              </div>
              <p className={cn(
                "text-xs mt-2 text-center",
                step.status === 'current' ? "font-medium text-foreground" : "text-muted-foreground"
              )}>
                {step.title}
              </p>
            </div>
            {!isLast && (
              <div className={cn(
                "flex-1 h-0.5 mx-2",
                step.status === 'complete' ? "bg-green-500" : "bg-muted"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
