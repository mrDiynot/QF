'use client';

/**
 * Charts & Data Visualization Components
 * Sparklines, progress rings, mini charts
 */

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Sparkline Chart (simple SVG line)
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
  showArea?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  width = 100,
  height = 30,
  color = '#8b5cf6',
  fillColor,
  strokeWidth = 2,
  showArea = false,
  className,
}: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = showArea
    ? `0,${height} ${points} ${width},${height}`
    : '';

  return (
    <svg width={width} height={height} className={className}>
      {showArea && (
        <polygon
          points={areaPoints}
          fill={fillColor || `${color}20`}
        />
      )}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Progress Ring (circular progress)
interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  showValue?: boolean;
  label?: string;
  className?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  color = '#8b5cf6',
  bgColor = '#e5e7eb',
  showValue = true,
  label,
  className,
}: ProgressRingProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold">{Math.round(percentage)}%</span>
          {label && <span className="text-xs text-muted-foreground">{label}</span>}
        </div>
      )}
    </div>
  );
}

// Multi Progress Ring (multiple segments)
interface ProgressSegment {
  value: number;
  color: string;
  label?: string;
}

interface MultiProgressRingProps {
  segments: ProgressSegment[];
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function MultiProgressRing({
  segments,
  size = 100,
  strokeWidth = 10,
  className,
}: MultiProgressRingProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  let currentOffset = 0;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Segments */}
        {segments.map((segment, index) => {
          const percentage = (segment.value / total) * 100;
          const dashLength = (percentage / 100) * circumference;
          const offset = currentOffset;
          currentOffset += dashLength;

          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold">{total}</span>
      </div>
    </div>
  );
}

// Bar Chart (simple horizontal bars)
interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  maxValue?: number;
  showValues?: boolean;
  className?: string;
}

export function BarChart({ data, maxValue, showValues = true, className }: BarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value));

  return (
    <div className={cn("space-y-3", className)}>
      {data.map((item, index) => {
        const percentage = (item.value / max) * 100;
        return (
          <div key={index}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              {showValues && <span className="text-sm font-medium">{item.value}</span>}
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: item.color || 'hsl(var(--primary))',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Mini Donut Chart
interface DonutData {
  value: number;
  color: string;
  label?: string;
}

interface DonutChartProps {
  data: DonutData[];
  size?: number;
  strokeWidth?: number;
  showLegend?: boolean;
  className?: string;
}

export function DonutChart({
  data,
  size = 120,
  strokeWidth = 20,
  showLegend = true,
  className,
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  let currentOffset = 0;

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const dashLength = (percentage / 100) * circumference;
            const offset = currentOffset;
            currentOffset += dashLength;

            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={-offset}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{total}</span>
        </div>
      </div>

      {showLegend && (
        <div className="space-y-1">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-muted-foreground">{item.label || `Item ${index + 1}`}</span>
              <span className="text-sm font-medium ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Stat with Sparkline
interface StatWithSparklineProps {
  label: string;
  value: string | number;
  data: number[];
  trend?: 'up' | 'down';
  trendValue?: string;
  className?: string;
}

export function StatWithSparkline({
  label,
  value,
  data,
  trend,
  trendValue,
  className,
}: StatWithSparklineProps) {
  const color = trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#8b5cf6';

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trendValue && (
            <p className={cn(
              "text-sm mt-1",
              trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-muted-foreground'
            )}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {trendValue}
            </p>
          )}
        </div>
        <Sparkline data={data} color={color} showArea />
      </div>
    </Card>
  );
}

// Comparison Bar
interface ComparisonBarProps {
  label: string;
  value1: number;
  value2: number;
  label1?: string;
  label2?: string;
  color1?: string;
  color2?: string;
  className?: string;
}

export function ComparisonBar({
  label,
  value1,
  value2,
  label1 = 'Previous',
  label2 = 'Current',
  color1 = '#e5e7eb',
  color2 = '#8b5cf6',
  className,
}: ComparisonBarProps) {
  const max = Math.max(value1, value2);
  const percent1 = (value1 / max) * 100;
  const percent2 = (value2 / max) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium text-foreground/80">{label}</p>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-16">{label1}</span>
          <div className="flex-1 h-4 bg-muted/40 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${percent1}%`, backgroundColor: color1 }}
            />
          </div>
          <span className="text-sm font-medium w-12 text-right">{value1}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-16">{label2}</span>
          <div className="flex-1 h-4 bg-muted/40 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${percent2}%`, backgroundColor: color2 }}
            />
          </div>
          <span className="text-sm font-medium w-12 text-right">{value2}</span>
        </div>
      </div>
    </div>
  );
}

// Gauge Chart
interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  size?: number;
  label?: string;
  thresholds?: Array<{ value: number; color: string }>;
  className?: string;
}

export function GaugeChart({
  value,
  min = 0,
  max = 100,
  size = 120,
  label,
  thresholds = [
    { value: 33, color: '#ef4444' },
    { value: 66, color: '#f59e0b' },
    { value: 100, color: '#22c55e' },
  ],
  className,
}: GaugeChartProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  const getColor = () => {
    for (const threshold of thresholds) {
      if (percentage <= threshold.value) return threshold.color;
    }
    return thresholds[thresholds.length - 1]?.color || '#8b5cf6';
  };

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        {/* Background arc */}
        <path
          d={`M ${size * 0.1} ${size / 2} A ${size * 0.4} ${size * 0.4} 0 0 1 ${size * 0.9} ${size / 2}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={size * 0.1}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M ${size * 0.1} ${size / 2} A ${size * 0.4} ${size * 0.4} 0 0 1 ${size * 0.9} ${size / 2}`}
          fill="none"
          stroke={getColor()}
          strokeWidth={size * 0.1}
          strokeLinecap="round"
          strokeDasharray={`${(percentage / 100) * size * 1.26} ${size * 1.26}`}
        />
      </svg>
      <div className="absolute bottom-0 text-center">
        <span className="text-xl font-bold">{value}</span>
        {label && <p className="text-xs text-muted-foreground">{label}</p>}
      </div>
    </div>
  );
}

// Trend Indicator
interface TrendIndicatorProps {
  value: number;
  previousValue: number;
  format?: 'percent' | 'number';
  className?: string;
}

export function TrendIndicator({ value, previousValue, format = 'percent', className }: TrendIndicatorProps) {
  const diff = value - previousValue;
  const percentChange = previousValue !== 0 ? ((diff / previousValue) * 100) : 0;
  const isUp = diff > 0;
  const isDown = diff < 0;

  const displayValue = format === 'percent'
    ? `${Math.abs(percentChange).toFixed(1)}%`
    : Math.abs(diff).toLocaleString();

  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-sm font-medium",
      isUp && "text-green-600",
      isDown && "text-red-600",
      !isUp && !isDown && "text-muted-foreground",
      className
    )}>
      {isUp && '↑'}
      {isDown && '↓'}
      {displayValue}
    </span>
  );
}
