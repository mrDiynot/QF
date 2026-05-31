'use client';

/**
 * Usage Meters Component
 * Displays subscription usage metrics with visual progress bars
 */

import { Zap, Phone, MessageSquare, Users, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useSubscriptionUsage } from '@/hooks/subscriptions/useSubscriptions';
import { Skeleton } from '@/components/ui/skeleton';

interface UsageMeterProps {
  label: string;
  used: number;
  limit: number;
  percentage: number;
  icon: React.ReactNode;
  unit?: string;
}

function UsageMeter({ label, used, limit, percentage, icon, unit = '' }: UsageMeterProps) {
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex size-8 items-center justify-center rounded-lg",
            isAtLimit ? "bg-red-100 text-red-600" :
            isNearLimit ? "bg-amber-100 text-amber-600" :
            "bg-primary/10 text-primary"
          )}>
            {icon}
          </div>
          <span className="text-sm font-medium text-foreground/80">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {used.toLocaleString()}{unit}
          </span>
          <span className="text-sm text-muted-foreground">
            / {limit === -1 ? '∞' : `${limit.toLocaleString()}${unit}`}
          </span>
          {isNearLimit && !isAtLimit && (
            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
              <AlertTriangle className="size-3 mr-1" />
              Near limit
            </Badge>
          )}
          {isAtLimit && (
            <Badge variant="destructive">
              Limit reached
            </Badge>
          )}
        </div>
      </div>
      <Progress 
        value={Math.min(percentage, 100)} 
        className={cn(
          "h-2",
          isAtLimit ? "[&>div]:bg-red-500" :
          isNearLimit ? "[&>div]:bg-amber-500" :
          "[&>div]:bg-primary/50"
        )}
      />
      <p className="text-xs text-muted-foreground text-right">
        {percentage.toFixed(1)}% used
      </p>
    </div>
  );
}

interface UsageMetersProps {
  className?: string;
  compact?: boolean;
}

export function UsageMeters({ className, compact = false }: UsageMetersProps) {
  const { data: usage, isLoading, error } = useSubscriptionUsage();

  if (isLoading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error || !usage) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center text-muted-foreground">
          <AlertTriangle className="size-8 mx-auto mb-2 text-amber-500" />
          <p className="text-sm">Unable to load usage data</p>
        </div>
      </Card>
    );
  }

  const meters: Array<{
    label: string;
    used: number;
    limit: number;
    percentage: number;
    icon: React.ReactNode;
    unit?: string;
  }> = [
    {
      label: 'AI Interactions',
      ...usage.aiInteractions,
      icon: <Zap className="size-4" />,
    },
    {
      label: 'Voice Minutes',
      ...usage.voiceMinutes,
      icon: <Phone className="size-4" />,
      unit: ' min',
    },
    {
      label: 'SMS Messages',
      ...usage.smsMessages,
      icon: <MessageSquare className="size-4" />,
    },
    {
      label: 'Team Members',
      ...usage.teamMembers,
      icon: <Users className="size-4" />,
    },
  ];

  if (compact) {
    return (
      <div className={cn("grid grid-cols-2 gap-4", className)}>
        {meters.map((meter) => (
          <div 
            key={meter.label}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/20"
          >
            <div className={cn(
              "flex size-8 items-center justify-center rounded-lg",
              meter.percentage >= 100 ? "bg-red-100 text-red-600" :
              meter.percentage >= 80 ? "bg-amber-100 text-amber-600" :
              "bg-primary/10 text-primary"
            )}>
              {meter.icon}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{meter.label}</p>
              <p className="text-sm font-semibold">
                {meter.used}{meter.unit || ''} / {meter.limit === -1 ? '∞' : meter.limit}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card className={cn("p-6", className)}>
      <h3 className="text-lg font-semibold text-foreground mb-6">Usage This Period</h3>
      <div className="space-y-6">
        {meters.map((meter) => (
          <UsageMeter
            key={meter.label}
            label={meter.label}
            used={meter.used}
            limit={meter.limit}
            percentage={meter.percentage}
            icon={meter.icon}
            unit={meter.unit}
          />
        ))}
      </div>
    </Card>
  );
}

export function UsageSummaryBadge() {
  const { data: usage } = useSubscriptionUsage();

  if (!usage) return null;

  const totalPercentage = Math.round(
    (usage.aiInteractions.percentage +
      usage.voiceMinutes.percentage +
      usage.smsMessages.percentage +
      usage.teamMembers.percentage) / 4
  );

  const isNearLimit = totalPercentage >= 80;

  return (
    <Badge 
      variant={isNearLimit ? "destructive" : "secondary"}
      className={cn(
        "text-xs",
        !isNearLimit && "bg-primary/10 text-primary"
      )}
    >
      {totalPercentage}% used
    </Badge>
  );
}
