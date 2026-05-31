'use client';

import { Card, CardContent } from '@/components/ui/card';
import { SparklineChart } from './SparklineChart';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatisticsBlockProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  sparklineData?: number[];
  sparklineColor?: string;
  className?: string;
  showSparkline?: boolean;
}

export function StatisticsBlock({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-white',
  iconBgColor = 'bg-muted/300',
  sparklineData = [800, 600, 1000, 800, 600, 1000, 800, 900],
  sparklineColor = '#00EBFF',
  className,
  showSparkline = true,
}: StatisticsBlockProps) {
  const changeColors = {
    positive: 'text-green-500',
    negative: 'text-red-500',
    neutral: 'text-admin-muted-foreground',
  };

  return (
    <Card className={cn('border-none shadow-sm', className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {showSparkline && (
            <div className="flex-shrink-0">
              <SparklineChart
                series={sparklineData}
                color={sparklineColor}
                height={48}
                width={80}
              />
            </div>
          )}
          {Icon && !showSparkline && (
            <div className={cn('flex-shrink-0 p-3 rounded-lg', iconBgColor)}>
              <Icon className={cn('h-6 w-6', iconColor)} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-admin-muted-foreground truncate">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-admin-foreground">
                {value}
              </p>
              {change && (
                <span className={cn('text-xs font-medium', changeColors[changeType])}>
                  {change}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
