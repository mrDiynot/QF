'use client';

/**
 * Activity Feed Widget
 * Shows recent activity on the dashboard
 */

import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import {
  UserPlus,
  MessageSquare,
  Phone,
  Calendar,
  FileText,
  Zap,
  Mail,
  CheckCircle,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/axios';
import { EmptyState } from '@/components/ui/empty-state';

interface AuditLogDto {
  id: string;
  userId: string;
  username: string;
  entityType: string;
  entityId: string;
  action: string;
  oldValues?: string;
  newValues?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

interface ActivityItem {
  id: string;
  type: 'lead_created' | 'message_received' | 'call_completed' | 'appointment_booked' | 'proposal_sent' | 'form_submitted' | 'email_opened' | 'lead_qualified';
  title: string;
  description: string;
  timestamp: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

const ACTIVITY_CONFIG: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  lead_created: { 
    icon: <UserPlus className="size-4" />, 
    color: 'text-primary', 
    bgColor: 'bg-primary/10' 
  },
  message_received: { 
    icon: <MessageSquare className="size-4" />, 
    color: 'text-info', 
    bgColor: 'bg-muted/50' 
  },
  call_completed: { 
    icon: <Phone className="size-4" />, 
    color: 'text-green-600', 
    bgColor: 'bg-green-100' 
  },
  appointment_booked: { 
    icon: <Calendar className="size-4" />, 
    color: 'text-primary', 
    bgColor: 'bg-primary/10' 
  },
  proposal_sent: { 
    icon: <FileText className="size-4" />, 
    color: 'text-amber-600', 
    bgColor: 'bg-amber-100' 
  },
  form_submitted: { 
    icon: <Zap className="size-4" />, 
    color: 'text-muted-foreground', 
    bgColor: 'bg-muted/50' 
  },
  email_opened: { 
    icon: <Mail className="size-4" />, 
    color: 'text-info', 
    bgColor: 'bg-muted/50' 
  },
  lead_qualified: { 
    icon: <CheckCircle className="size-4" />, 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-100' 
  },
};

/**
 * Determine activity type based on audit action and entity type
 */
function determineActivityType(action: string, entityType: string): ActivityItem['type'] {
  const actionLower = action.toLowerCase();
  const entityLower = entityType.toLowerCase();

  // Map based on entity type and action
  if (entityLower === 'lead') {
    if (actionLower.includes('create') || actionLower === 'created') return 'lead_created';
    if (actionLower.includes('qualify') || actionLower === 'qualified') return 'lead_qualified';
  }

  if (entityLower === 'conversation') {
    return 'message_received';
  }

  if (entityLower === 'voicecall') {
    return 'call_completed';
  }

  if (entityLower === 'appointment' || entityLower === 'calendar') {
    return 'appointment_booked';
  }

  if (entityLower === 'proposal') {
    return 'proposal_sent';
  }

  if (entityLower === 'form') {
    return 'form_submitted';
  }

  // Default based on action
  if (actionLower.includes('create') || actionLower === 'created') return 'lead_created';
  if (actionLower.includes('update') || actionLower === 'updated') return 'message_received';
  if (actionLower.includes('delete') || actionLower === 'deleted') return 'email_opened';

  return 'lead_created'; // default fallback
}

/**
 * Get human-readable action display text
 */
function getActionDisplay(action: string): string {
  const normalized = action.toLowerCase().replace(/_/g, ' ');
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

/**
 * Get URL for the activity item (for navigation when clicked)
 */
function getActionUrl(entityType: string, entityId: string): string | undefined {
  const entityLower = entityType.toLowerCase();

  if (entityLower === 'lead') {
    return `/leads/${entityId}`;
  }

  if (entityLower === 'conversation') {
    return `/conversations/${entityId}`;
  }

  if (entityLower === 'voicecall') {
    return `/calls/${entityId}`;
  }

  if (entityLower === 'proposal') {
    return `/proposals/${entityId}`;
  }

  // No navigation URL for unknown types
  return undefined;
}


interface ActivityFeedWidgetProps {
  limit?: number;
  showViewAll?: boolean;
  className?: string;
}

export function ActivityFeedWidget({ 
  limit = 5, 
  showViewAll = true,
  className 
}: ActivityFeedWidgetProps) {
  // Fetch activity from API and transform AuditLogDto to ActivityItem
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['activity', 'recent', limit],
    queryFn: async () => {
      const response = await apiClient.get<{ items: AuditLogDto[]; totalItems: number }>('/audit-logs', {
        params: { pageSize: limit, pageNumber: 1 }
      });
      
      // Transform AuditLogDto to ActivityItem format
      return (response.data.items || []).map((audit) => {
        // Determine activity type based on action and entityType
        const activityType = determineActivityType(audit.action, audit.entityType);
        
        return {
          id: audit.id,
          type: activityType,
          title: `${audit.username} ${getActionDisplay(audit.action)}`,
          description: `${audit.entityType} (${audit.action})`,
          timestamp: audit.createdAt,
          actionUrl: getActionUrl(audit.entityType, audit.entityId),
          metadata: {
            userId: audit.userId,
            entityType: audit.entityType,
            entityId: audit.entityId,
            oldValues: audit.oldValues,
            newValues: audit.newValues,
          }
        } as ActivityItem;
      });
    },
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 30, // Refresh every 30 seconds
    retry: false, // Don't retry on failure - show empty state instead
  });

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="size-9 rounded-lg bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted/40 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !activities || activities.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="No Recent Activity"
        description="Your recent leads and conversations will appear here once you start engaging with customers."
      />
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {activities.map((activity) => {
        const config = ACTIVITY_CONFIG[activity.type] || ACTIVITY_CONFIG.lead_created;
        
        return (
          <Link
            key={activity.id}
            href={activity.actionUrl || '#'}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/20 transition-colors group"
          >
            <div className={cn(
              "flex size-9 items-center justify-center rounded-lg flex-shrink-0",
              config.bgColor
            )}>
              <span className={config.color}>{config.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {activity.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {activity.description}
              </p>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
          </Link>
        );
      })}

      {showViewAll && activities.length > 0 && (
        <div className="pt-3 border-t mt-3">
          <Link
            href="/settings/audit-logs"
            className="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-indigo-700 py-2"
          >
            View All Activity
            <ArrowRight className="size-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
