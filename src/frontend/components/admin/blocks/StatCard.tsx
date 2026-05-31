'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { brandColors, semanticColors } from '@/lib/design-tokens';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  loading?: boolean;
  className?: string;
  sparklineData?: number[];
  sparklineColor?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  iconColor = 'text-dashcode-info',
  loading = false,
  className,
  sparklineData = [800, 600, 1000, 800, 600, 1000, 800, 900],
  sparklineColor,
}: StatCardProps) {
  void iconColor; // Reserved for icon styling
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getTrendColor = () => {
    if (change === undefined || change === 0) return 'text-admin-muted-foreground';
    return change > 0 ? 'text-emerald-400' : 'text-red-400';
  };

  const getSparklineColor = () => {
    if (sparklineColor) return sparklineColor;
    if (iconColor?.includes('info')) return brandColors.accent[400];
    if (iconColor?.includes('warning')) return semanticColors.warning.main;
    if (iconColor?.includes('success')) return semanticColors.success.main;
    if (iconColor?.includes('primary')) return brandColors.primary[500];
    if (iconColor?.includes('blue')) return brandColors.primary[500];
    if (iconColor?.includes('emerald') || iconColor?.includes('green')) return semanticColors.success.main;
    if (iconColor?.includes('purple')) return brandColors.secondary[500];
    if (iconColor?.includes('orange')) return semanticColors.warning.main;
    return brandColors.accent[400];
  };

  const sparklineOptions: ApexCharts.ApexOptions = {
    chart: {
      sparkline: { enabled: true },
      toolbar: { show: false },
      background: 'transparent',
    },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'solid',
      opacity: 0.1,
    },
    colors: [getSparklineColor()],
    tooltip: {
      theme: isDark ? 'dark' : 'light',
    },
    grid: {
      show: false,
      padding: { left: 0, right: 0 },
    },
    yaxis: { show: false },
    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
    },
  };

  if (loading) {
    return (
      <Card className={cn('shadow-base', className)}>
        <CardContent className="py-[18px] px-4">
          <div className="flex gap-6">
            <Skeleton className="h-12 w-12 rounded bg-admin-muted" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-20 bg-admin-muted" />
              <Skeleton className="h-6 w-16 bg-admin-muted" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('shadow-base', className)}>
      <CardContent className="py-4 px-5">
        <div className="flex gap-4">
          {/* Sparkline chart on left like Dashcode */}
          <div className="flex-shrink-0">
            <Chart
              options={sparklineOptions}
              series={[{ data: sparklineData }]}
              type="area"
              height={60}
              width={80}
            />
          </div>
          
          {/* Text content - Dashcode style with larger fonts */}
          <div className="flex-1 min-w-0">
            <p className="text-admin-muted-foreground text-sm font-medium mb-1">
              {title}
            </p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <p className="text-admin-foreground text-2xl font-semibold">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {change !== undefined && (
                <span className={cn('text-sm font-medium', getTrendColor())}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
              )}
            </div>
            {changeLabel && (
              <p className="text-xs text-admin-muted-foreground mt-1">{changeLabel}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
