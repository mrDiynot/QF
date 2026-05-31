'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  loading?: boolean;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon: Icon,
  iconColor = 'text-admin-primary',
  loading = false,
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (change === undefined || change === 0) return Minus;
    return change > 0 ? TrendingUp : TrendingDown;
  };

  const getTrendColor = () => {
    if (change === undefined || change === 0) return 'text-admin-muted-foreground';
    return change > 0 ? 'text-green-500' : 'text-red-500';
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card className="bg-admin-card border-admin-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-admin-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn('h-5 w-5', iconColor)} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 w-24 bg-admin-muted animate-pulse rounded" />
            <div className="h-4 w-32 bg-admin-muted animate-pulse rounded" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold text-admin-foreground">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            {change !== undefined && (
              <div className={cn('flex items-center gap-1 text-xs mt-1', getTrendColor())}>
                <TrendIcon className="h-3 w-3" />
                <span>
                  {change > 0 ? '+' : ''}{change}% {changeLabel}
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

