'use client';

/**
 * Dashboard Metrics Cards Component
 * Displays key metrics with trends and sparklines
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  MessageSquare,
  Phone,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
  color: string;
  trend: 'up' | 'down' | 'neutral';
  sparklineData?: number[];
}

const DEFAULT_METRICS: MetricCard[] = [
  {
    id: 'leads',
    title: 'Total Leads',
    value: '1,247',
    change: 12.5,
    changeLabel: 'vs last month',
    icon: <Users className="size-5" />,
    color: 'neutral',
    trend: 'up',
    sparklineData: [30, 45, 35, 50, 40, 60, 55, 70, 65, 80, 75, 90],
  },
  {
    id: 'conversations',
    title: 'Active Conversations',
    value: '89',
    change: 8.3,
    changeLabel: 'vs last week',
    icon: <MessageSquare className="size-5" />,
    color: 'neutral',
    trend: 'up',
    sparklineData: [20, 25, 30, 28, 35, 32, 40, 38, 45, 50, 48, 55],
  },
  {
    id: 'calls',
    title: 'AI Calls Today',
    value: '34',
    change: -5.2,
    changeLabel: 'vs yesterday',
    icon: <Phone className="size-5" />,
    color: 'neutral',
    trend: 'down',
    sparklineData: [40, 35, 45, 40, 35, 30, 38, 35, 30, 28, 32, 34],
  },
  {
    id: 'revenue',
    title: 'Pipeline Value',
    value: '$124.5K',
    change: 23.1,
    changeLabel: 'vs last month',
    icon: <DollarSign className="size-5" />,
    color: 'neutral',
    trend: 'up',
    sparklineData: [50, 55, 60, 65, 70, 75, 80, 85, 95, 100, 110, 124],
  },
];

// All metrics use neutral colors - metric type identified by icon, not color
const COLOR_CLASSES: Record<string, { bg: string; text: string; light: string }> = {
  neutral: { bg: 'bg-primary', text: 'text-primary', light: 'bg-primary/10' },
};

interface MetricsCardsProps {
  metrics?: MetricCard[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function MetricsCards({ 
  metrics = DEFAULT_METRICS, 
  columns = 4,
  className 
}: MetricsCardsProps) {
  const gridCols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn(`grid gap-4 ${gridCols[columns]}`, className)}>
      {metrics.map((metric) => {
        const colors = COLOR_CLASSES[metric.color] || COLOR_CLASSES.purple;

        return (
          <Card key={metric.id} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className={cn("flex size-10 items-center justify-center rounded-xl", colors.light, colors.text)}>
                {metric.icon}
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium",
                metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
              )}>
                {metric.trend === 'up' ? (
                  <ArrowUpRight className="size-3" />
                ) : metric.trend === 'down' ? (
                  <ArrowDownRight className="size-3" />
                ) : null}
                {Math.abs(metric.change)}%
              </div>
            </div>

            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">{metric.value}</p>
              <p className="text-sm text-muted-foreground">{metric.title}</p>
            </div>

            {/* Sparkline */}
            {metric.sparklineData && (
              <div className="mt-4 h-8">
                <Sparkline data={metric.sparklineData} color={colors.bg} />
              </div>
            )}

            <p className="text-xs text-muted-foreground/60 mt-2">{metric.changeLabel}</p>
          </Card>
        );
      })}
    </div>
  );
}

// Simple Sparkline Component
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={cn("opacity-50", color.replace('bg-', 'text-'))}
      />
    </svg>
  );
}

// Detailed Metric Card with more info
interface DetailedMetricProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  target?: number;
  progress?: number;
  icon: React.ReactNode;
  color?: string;
  className?: string;
}

export function DetailedMetricCard({
  title,
  value,
  subtitle,
  change,
  target,
  progress,
  icon,
  color = 'purple',
  className,
}: DetailedMetricProps) {
  const colors = COLOR_CLASSES[color] || COLOR_CLASSES.purple;

  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn("flex size-10 items-center justify-center rounded-xl", colors.light, colors.text)}>
          {icon}
        </div>
        {change !== undefined && (
          <Badge 
            variant="secondary" 
            className={cn(
              "gap-1",
              change >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            )}
          >
            {change >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {Math.abs(change)}%
          </Badge>
        )}
      </div>

      <p className="text-3xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{title}</p>

      {subtitle && (
        <p className="text-xs text-muted-foreground/60 mt-2">{subtitle}</p>
      )}

      {progress !== undefined && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all", colors.bg)}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          {target && (
            <p className="text-xs text-muted-foreground/60 mt-1">Target: {target}</p>
          )}
        </div>
      )}
    </Card>
  );
}

// Mini Stat for inline use
interface MiniStatProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down';
  change?: number;
  className?: string;
}

export function MiniStat({ label, value, icon, trend, change, className }: MiniStatProps) {
  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-lg bg-muted/20", className)}>
      {icon && (
        <div className="flex size-8 items-center justify-center rounded-lg bg-white text-muted-foreground">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold text-foreground">{value}</p>
      </div>
      {trend && change !== undefined && (
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium",
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        )}>
          {trend === 'up' ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {change}%
        </div>
      )}
    </div>
  );
}
