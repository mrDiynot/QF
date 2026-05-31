'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatItem {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  subtitle?: string;
  trend?: number;
  className?: string;
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ stats, columns = 4, className }: StatsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-blue-400',
  iconBgColor = 'bg-muted/300/20',
  subtitle,
  trend,
  className,
}: StatItem) {
  const getTrendColor = () => {
    if (trend === undefined || trend === 0) return 'text-admin-muted-foreground';
    return trend > 0 ? 'text-emerald-400' : 'text-red-400';
  };

  return (
    <Card className={cn('shadow-base bg-admin-card border-admin-border transition-all hover:shadow-base2', className)}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={cn('p-2.5 rounded-xl', iconBgColor)}>
              <Icon className={cn('h-5 w-5', iconColor)} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-admin-muted-foreground truncate">{title}</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <p className="text-2xl font-bold text-admin-foreground">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {trend !== undefined && (
                <span className={cn('text-sm font-medium', getTrendColor())}>
                  {trend > 0 ? '+' : ''}{trend}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-admin-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
