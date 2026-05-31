'use client';

/**
 * Stat Cards Collection
 * Reusable statistic display components
 */

import { Card } from '@/components/ui/card';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  icon,
  trend,
  className,
}: StatCardProps) {
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-muted-foreground';
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;

  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between">
        {icon && (
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        {change !== undefined && (
          <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
            <TrendIcon className="size-3" />
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className={cn("mt-3", !icon && "mt-0")}>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground/70 mt-1">{subtitle}</p>}
        {changeLabel && <p className="text-xs text-muted-foreground/70 mt-1">{changeLabel}</p>}
      </div>
    </Card>
  );
}

// Stat with progress bar
interface ProgressStatProps {
  title: string;
  value: number;
  max: number;
  unit?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export function ProgressStat({
  title,
  value,
  max,
  unit = '',
  color = 'primary',
  className,
}: ProgressStatProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const colors = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
    info: 'bg-info',
  };

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        <span className="text-sm font-medium text-foreground">
          {value.toLocaleString()}{unit} / {max.toLocaleString()}{unit}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground/70 mt-1">{percentage.toFixed(0)}% used</p>
    </Card>
  );
}

// Comparison stat (before/after)
interface ComparisonStatProps {
  title: string;
  current: number;
  previous: number;
  format?: (n: number) => string;
  className?: string;
}

export function ComparisonStat({
  title,
  current,
  previous,
  format = (n) => n.toLocaleString(),
  className,
}: ComparisonStatProps) {
  const change = previous ? ((current - previous) / previous) * 100 : 0;
  const isPositive = change >= 0;

  return (
    <Card className={cn("p-4", className)}>
      <p className="text-sm text-muted-foreground mb-2">{title}</p>
      <div className="flex items-end gap-3">
        <span className="text-2xl font-bold text-foreground">{format(current)}</span>
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium pb-1",
          isPositive ? "text-success" : "text-error"
        )}>
          {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {Math.abs(change).toFixed(1)}%
        </div>
      </div>
      <p className="text-xs text-muted-foreground/70 mt-1">
        Previous: {format(previous)}
      </p>
    </Card>
  );
}

// Mini inline stat
interface MiniStatProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export function MiniStat({ label, value, icon, className }: MiniStatProps) {
  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-lg bg-muted/50", className)}>
      {icon && (
        <div className="flex size-8 items-center justify-center rounded-lg bg-card text-muted-foreground shadow-sm">
          {icon}
        </div>
      )}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

// Stat row (horizontal layout)
interface StatRowProps {
  stats: Array<{ label: string; value: string | number }>;
  className?: string;
}

export function StatRow({ stats, className }: StatRowProps) {
  return (
    <div className={cn("flex items-center divide-x divide-border", className)}>
      {stats.map((stat, index) => (
        <div key={index} className="flex-1 px-4 first:pl-0 last:pr-0 text-center">
          <p className="text-xl font-bold text-foreground">{stat.value}</p>
          <p className="text-xs text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

// Stat grid
interface StatGridProps {
  stats: Array<{
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
  }>;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatGrid({ stats, columns = 4, className }: StatGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}

// Percentage circle stat
interface CircleStatProps {
  title: string;
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export function CircleStat({
  title,
  percentage,
  size = 'md',
  color = 'primary',
  className,
}: CircleStatProps) {
  const sizes = { sm: 60, md: 80, lg: 100 };
  const strokeWidths = { sm: 4, md: 6, lg: 8 };
  const s = sizes[size];
  const sw = strokeWidths[size];
  const radius = (s - sw) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colors: Record<string, string> = {
    primary: 'stroke-primary',
    success: 'stroke-success',
    warning: 'stroke-warning',
    error: 'stroke-error',
    info: 'stroke-info',
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative" style={{ width: s, height: s }}>
        <svg className="transform -rotate-90" width={s} height={s}>
          <circle
            cx={s / 2}
            cy={s / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={sw}
            className="text-muted/30"
          />
          <circle
            cx={s / 2}
            cy={s / 2}
            r={radius}
            fill="none"
            strokeWidth={sw}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={colors[color] || colors.primary}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold text-foreground", size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base')}>
            {percentage}%
          </span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-2">{title}</p>
    </div>
  );
}
