'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Building2, User, CreditCard, Shield } from 'lucide-react';
import type { AdminActivityItem } from '@/types/admin';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  activities: AdminActivityItem[];
  loading?: boolean;
  maxHeight?: string;
}

const activityIcons: Record<AdminActivityItem['type'], React.ElementType> = {
  business_created: Building2,
  user_created: User,
  subscription_changed: CreditCard,
  admin_action: Shield,
};

const activityColors: Record<AdminActivityItem['type'], string> = {
  business_created: 'bg-muted/300/20 text-blue-400',
  user_created: 'bg-green-500/20 text-green-400',
  subscription_changed: 'bg-amber-500/20 text-amber-400',
  admin_action: 'bg-primary/50/20 text-purple-400',
};

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export function ActivityFeed({ activities, loading = false, maxHeight = '400px' }: ActivityFeedProps) {
  return (
    <Card className="bg-admin-card border-admin-border">
      <CardHeader>
        <CardTitle className="text-admin-foreground flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ maxHeight }}>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-admin-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-admin-muted animate-pulse rounded" />
                    <div className="h-3 w-1/4 bg-admin-muted animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-admin-muted-foreground">
              No recent activity
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = activityIcons[activity.type] || Activity;
                const colorClass = activityColors[activity.type] || 'bg-admin-muted text-admin-muted-foreground';

                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', colorClass)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-admin-foreground">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-admin-muted-foreground">{activity.entityType || 'system'}</span>
                        <span className="text-xs text-admin-muted-foreground">•</span>
                        <span className="text-xs text-admin-muted-foreground">{formatTimeAgo(activity.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

