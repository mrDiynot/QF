import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EnhancedStatCardProps {
  icon: ReactNode;
  value: number | string;
  label: string;
  trend?: number;
  trendLabel?: string;
  isComingSoon?: boolean;
  sparkline?: number[];
  className?: string;
  variant?: 'default' | 'gradient' | 'glass';
}

export function EnhancedStatCard({
  icon,
  value,
  label,
  trend,
  trendLabel,
  isComingSoon = false,
  sparkline,
  className = '',
  variant = 'default',
}: EnhancedStatCardProps) {
  const isPositiveTrend = trend !== undefined && trend > 0;

  return (
    <Card 
      className={cn(
        'group relative overflow-hidden p-6 transition-all duration-300',
        variant === 'default' && 'hover:shadow-md hover:-translate-y-1 border-2 border-gray-200 hover:border-gray-300 bg-white',
        variant === 'gradient' && 'bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md',
        variant === 'glass' && 'bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md',
        className
      )}
    >
      {/* Header with icon and trend */}
      <div className="relative flex items-start justify-between mb-6">
        <div className={cn(
          'flex size-12 items-center justify-center rounded-xl',
          variant === 'gradient' 
            ? 'bg-gray-100' 
            : 'bg-gray-100'
        )}>
          {icon}
        </div>
        
        {isComingSoon ? (
          <Badge 
            variant="secondary" 
            className="text-xs bg-gray-100 text-gray-700 border-gray-200"
          >
            <Sparkles className="size-3 mr-1" />
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
      <p className="relative text-sm font-medium text-gray-600">
        {label}
      </p>

      {/* Trend label */}
      {trendLabel && !isComingSoon && (
        <p className="text-xs mt-1 text-gray-500">
          {trendLabel}
        </p>
      )}

      {/* Sparkline visualization */}
      {sparkline && sparkline.length > 0 && (
        <div className="relative mt-4 h-8 flex items-end gap-1">
          {sparkline.map((val, i) => (
            <div
              key={i}
              className="flex-1 rounded-t transition-all bg-gray-200"
              style={{ height: `${(val / Math.max(...sparkline)) * 100}%` }}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
