import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: ReactNode;
  value: number | string;
  label: string;
  trend?: number;
  trendLabel?: string;
  isComingSoon?: boolean;
  className?: string;
}

export function StatCard({
  icon,
  value,
  label,
  trend,
  trendLabel,
  isComingSoon = false,
  className = '',
}: StatCardProps) {
  const isPositiveTrend = trend !== undefined && trend > 0;

  return (
    <Card className={cn(
      'group relative overflow-hidden p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-2 border-gray-200 hover:border-gray-300 bg-white',
      className
    )}>
      {/* Header with icon and trend */}
      <div className="relative flex items-start justify-between mb-6">
        <div className="flex size-12 items-center justify-center rounded-xl bg-gray-100">
          {icon}
        </div>
        
        {isComingSoon ? (
          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 border-gray-200">
            Soon
          </Badge>
        ) : trend !== undefined && (
          <div className={cn(
            'flex items-center gap-1 rounded-full px-2.5 py-1 border',
            isPositiveTrend 
              ? 'bg-success-bg border-success/20' 
              : 'bg-error-bg border-error/20'
          )}>
            {isPositiveTrend ? (
              <TrendingUp className="size-3 text-success" />
            ) : (
              <TrendingDown className="size-3 text-error" />
            )}
            <span className={cn(
              'text-xs font-semibold',
              isPositiveTrend ? 'text-success-dark' : 'text-error-dark'
            )}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="relative mb-2">
        <p className="text-3xl font-bold text-gray-900 leading-9">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>

      {/* Label */}
      <p className="relative text-sm text-gray-600 font-medium">
        {label}
      </p>

      {/* Trend label */}
      {trendLabel && !isComingSoon && (
        <p className="text-xs text-gray-500 mt-1">
          {trendLabel}
        </p>
      )}
    </Card>
  );
}
