'use client';

/**
 * Activity Feed Component
 * Displays recent activity across the platform
 */

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Activity,
  UserPlus,
  MessageSquare,
  Phone,
  Mail,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useRecentActivity, type ActivityItem as ApiActivityItem } from '@/hooks/api/useActivity';

interface DisplayActivityItem {
  id: string;
  type: 'lead' | 'message' | 'call' | 'email' | 'proposal' | 'appointment' | 'automation' | 'default';
  title: string;
  description: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
  };
  meta?: {
    status?: 'success' | 'pending' | 'failed';
    link?: string;
  };
}

// Map audit log actions to activity types
function mapEntityTypeToActivityType(entityType?: string, _action?: string): DisplayActivityItem['type'] {
  if (!entityType) return 'default';

  const type = entityType.toLowerCase();
  if (type.includes('lead')) return 'lead';
  if (type.includes('message')) return 'message';
  if (type.includes('call') || type.includes('voice')) return 'call';
  if (type.includes('email')) return 'email';
  if (type.includes('proposal')) return 'proposal';
  if (type.includes('appointment') || type.includes('booking')) return 'appointment';
  if (type.includes('workflow') || type.includes('automation')) return 'automation';

  return 'default';
}

// Transform API activity to display format
function transformActivity(item: ApiActivityItem): DisplayActivityItem {
  const activityType = mapEntityTypeToActivityType(item.entityType, item.action);

  return {
    id: item.id,
    type: activityType,
    title: `${item.action} ${item.entityType || 'Item'}`,
    description: item.username || 'System action',
    timestamp: new Date(item.createdAt),
    user: item.username ? { name: item.username } : undefined,
  };
}

const ACTIVITY_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  lead: { icon: <UserPlus className="size-4" />, color: 'bg-primary/10 text-primary' },
  message: { icon: <MessageSquare className="size-4" />, color: 'bg-muted/50 text-info' },
  call: { icon: <Phone className="size-4" />, color: 'bg-green-100 text-green-600' },
  email: { icon: <Mail className="size-4" />, color: 'bg-red-100 text-red-600' },
  proposal: { icon: <FileText className="size-4" />, color: 'bg-amber-100 text-amber-600' },
  appointment: { icon: <Calendar className="size-4" />, color: 'bg-primary/10 text-primary' },
  automation: { icon: <Activity className="size-4" />, color: 'bg-muted/50 text-muted-foreground' },
  default: { icon: <Activity className="size-4" />, color: 'bg-muted/40 text-muted-foreground' },
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  success: <CheckCircle className="size-3 text-green-500" />,
  pending: <Clock className="size-3 text-amber-500" />,
  failed: <XCircle className="size-3 text-red-500" />,
};


interface ActivityFeedProps {
  maxItems?: number;
  showFilters?: boolean;
  className?: string;
}

export function ActivityFeed({
  maxItems = 10,
  showFilters = true,
  className
}: ActivityFeedProps) {
  const [filter, setFilter] = useState<string>('all');
  const { data: activityData, isLoading, refetch, isRefetching } = useRecentActivity({ limit: 50 });

  // Transform and filter activities
  const filteredActivities = useMemo(() => {
    const transformed = (activityData || []).map(transformActivity);
    return transformed
      .filter(a => filter === 'all' || a.type === filter)
      .slice(0, maxItems);
  }, [activityData, filter, maxItems]);

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="size-5 text-primary" />
          <h3 className="font-semibold text-foreground">Recent Activity</h3>
        </div>
        <div className="flex items-center gap-2">
          {showFilters && (
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activity</SelectItem>
                <SelectItem value="lead">Leads</SelectItem>
                <SelectItem value="message">Messages</SelectItem>
                <SelectItem value="call">Calls</SelectItem>
                <SelectItem value="email">Emails</SelectItem>
                <SelectItem value="proposal">Proposals</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={cn("size-4", isRefetching && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-1">
        {filteredActivities.map((activity) => {
          const config = ACTIVITY_ICONS[activity.type];

          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/20 transition-colors cursor-pointer group"
            >
              <div className={cn(
                "flex size-8 items-center justify-center rounded-lg flex-shrink-0",
                config.color
              )}>
                {config.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-foreground truncate">
                    {activity.title}
                  </p>
                  {activity.meta?.status && STATUS_ICONS[activity.meta.status]}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-8">
          <Activity className="size-12 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">No activity found</p>
        </div>
      )}

      {/* View All */}
      <Button variant="ghost" className="w-full mt-4 text-primary hover:text-primary">
        View All Activity
        <ArrowRight className="size-4 ml-2" />
      </Button>
    </Card>
  );
}

// Compact version for smaller spaces
export function ActivityFeedCompact({ className }: { className?: string }) {
  const { data: activityData, isLoading } = useRecentActivity({ limit: 5 });

  const activities = useMemo(() => {
    return (activityData || []).map(transformActivity);
  }, [activityData]);

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        <Loader2 className="size-6 animate-spin text-primary mx-auto" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {activities.map((activity) => {
        const config = ACTIVITY_ICONS[activity.type];

        return (
          <div
            key={activity.id}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/20 transition-colors"
          >
            <div className={cn("size-6 rounded flex items-center justify-center", config.color)}>
              {config.icon}
            </div>
            <span className="text-xs text-muted-foreground truncate flex-1">{activity.title}</span>
            <span className="text-xs text-muted-foreground/60">
              {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
