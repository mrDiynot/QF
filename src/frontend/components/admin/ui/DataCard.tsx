'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface DataCardProps {
  title?: string;
  icon?: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  noPadding?: boolean;
}

export function DataCard({
  title,
  icon: Icon,
  iconColor = 'text-admin-primary',
  children,
  className,
  headerAction,
  noPadding,
}: DataCardProps) {
  return (
    <Card className={cn('shadow-base bg-admin-card border-admin-border', className)}>
      {title && (
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-semibold text-admin-foreground flex items-center gap-2">
            {Icon && <Icon className={cn('h-5 w-5', iconColor)} />}
            {title}
          </CardTitle>
          {headerAction}
        </CardHeader>
      )}
      <CardContent className={cn(noPadding && 'p-0', !title && 'pt-6')}>
        {children}
      </CardContent>
    </Card>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  trend?: number;
  trendLabel?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-400',
  iconBgColor = 'bg-muted/300/20',
  trend,
  trendLabel,
  className,
}: MetricCardProps) {
  const getTrendColor = () => {
    if (trend === undefined || trend === 0) return 'text-admin-muted-foreground';
    return trend > 0 ? 'text-emerald-400' : 'text-red-400';
  };

  return (
    <Card className={cn('shadow-base bg-admin-card border-admin-border', className)}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={cn('p-2 rounded-lg', iconBgColor)}>
              <Icon className={cn('h-5 w-5', iconColor)} />
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm text-admin-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-admin-foreground">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {trend !== undefined && (
                <span className={cn('text-sm font-medium', getTrendColor())}>
                  {trend > 0 ? '+' : ''}{trend}%
                </span>
              )}
            </div>
            {(subtitle || trendLabel) && (
              <p className="text-xs text-admin-muted-foreground mt-1">
                {subtitle || trendLabel}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
