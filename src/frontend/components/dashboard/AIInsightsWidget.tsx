'use client';

/**
 * AI Insights Widget
 * Displays AI-generated business insights on the dashboard.
 * Shows 3-5 key insights with severity indicators, trend analysis, and actionable recommendations.
 */

import { RefreshCw, Loader2, Lightbulb, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info, ChevronRight, Activity } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAIInsights } from '@/hooks/api/useAIInsights';
import { Button } from '@/components/ui/button';
import type { InsightItem, InsightSeverity, InsightsTrendData, AnomalyDetection } from '@/types/ai-insights';
import { EmptyState } from '@/components/ui/empty-state';

interface AIInsightsWidgetProps {
  maxInsights?: number;
  className?: string;
}

/**
 * Get icon and colors for insight severity
 */
function getSeverityConfig(severity: InsightSeverity) {
  switch (severity) {
    case 'Critical':
      return {
        icon: <AlertTriangle className="size-4" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
      };
    case 'Warning':
      return {
        icon: <AlertTriangle className="size-4" />,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
      };
    case 'Positive':
      return {
        icon: <CheckCircle className="size-4" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      };
    case 'Info':
    default:
      return {
        icon: <Info className="size-4" />,
        color: 'text-info',
        bgColor: 'bg-muted/30',
        borderColor: 'border-border',
      };
  }
}

/**
 * Trend indicator component for week-over-week metrics
 */
function TrendIndicator({ value, label, isPositiveBetter = true }: { value: number; label: string; isPositiveBetter?: boolean }) {
  const isPositive = value > 0;
  const isGood = isPositiveBetter ? isPositive : !isPositive;

  return (
    <div className="flex flex-col items-center gap-1 rounded-lg bg-white/50 px-3 py-2">
      <div className={cn('flex items-center gap-1 text-sm font-bold', isGood ? 'text-green-600' : value === 0 ? 'text-muted-foreground' : 'text-red-600')}>
        {value !== 0 && (isPositive ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />)}
        <span>{value > 0 ? '+' : ''}{value.toFixed(1)}%</span>
      </div>
      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
    </div>
  );
}

/**
 * Trends summary section showing week-over-week comparison
 */
function TrendsSummary({ trends }: { trends: InsightsTrendData }) {
  const hasAnomalies = trends.anomalies && trends.anomalies.length > 0;

  return (
    <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="size-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Week-over-Week Trends</span>
      </div>

      {/* Trend indicators */}
      <div className="flex flex-wrap gap-2 mb-3">
        <TrendIndicator value={trends.leadCountChange} label="Leads" isPositiveBetter={true} />
        <TrendIndicator value={trends.conversionRateChange} label="Conversion" isPositiveBetter={true} />
        <TrendIndicator value={trends.averageScoreChange} label="Avg Score" isPositiveBetter={true} />
        {trends.responseTimeChange !== 0 && (
          <TrendIndicator value={trends.responseTimeChange} label="Response Time" isPositiveBetter={false} />
        )}
      </div>

      {/* Anomalies */}
      {hasAnomalies && (
        <div className="border-t border-indigo-100 pt-3 mt-1">
          <span className="text-xs font-medium text-amber-700 flex items-center gap-1 mb-2">
            <AlertTriangle className="size-3" />
            Detected Anomalies
          </span>
          <div className="space-y-1">
            {trends.anomalies.map((anomaly: AnomalyDetection, idx: number) => (
              <div key={idx} className="text-xs text-foreground/80 flex items-start gap-1.5">
                <span className={cn('shrink-0 mt-0.5', anomaly.isSpike ? 'text-green-500' : 'text-red-500')}>
                  {anomaly.isSpike ? '↑' : '↓'}
                </span>
                <span>
                  <strong>{anomaly.metric}:</strong> {anomaly.description} ({anomaly.deviationPercent}% deviation)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual insight card component
 */
function InsightCard({ insight }: { insight: InsightItem }) {
  const config = getSeverityConfig(insight.severity);
  const hasMetricChange = insight.metricChange !== undefined && insight.metricChange !== 0;
  const isPositiveChange = (insight.metricChange ?? 0) > 0;

  return (
    <div
      className={cn(
        'relative flex flex-col gap-2 rounded-xl border p-4 transition-all hover:shadow-md',
        config.borderColor,
        config.bgColor
      )}
    >
      {/* Header with severity icon and title */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <div className={cn('mt-0.5 shrink-0', config.color)}>{config.icon}</div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-foreground leading-tight">{insight.title}</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{insight.description}</p>
          </div>
        </div>
        {insight.metricValue && (
          <div className="text-right shrink-0">
            <span className="text-lg font-bold text-foreground">{insight.metricValue}</span>
            {hasMetricChange && (
              <div className={cn('flex items-center justify-end gap-0.5 text-xs font-medium', isPositiveChange ? 'text-green-600' : 'text-red-600')}>
                {isPositiveChange ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                <span>{Math.abs(insight.metricChange ?? 0).toFixed(1)}%</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recommendation */}
      {insight.recommendation && (
        <div className="mt-1 pt-2 border-t border-border/50">
          <p className="text-xs text-foreground/80">
            <span className="font-medium">💡 Action:</span> {insight.recommendation}
          </p>
        </div>
      )}

      {/* Action link */}
      {insight.actionLink && (
        <Link
          href={insight.actionLink}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-indigo-700 mt-1"
        >
          View Details
          <ChevronRight className="size-3" />
        </Link>
      )}
    </div>
  );
}

interface AIInsightsWidgetExtendedProps extends AIInsightsWidgetProps {
  /** Whether to show the trends summary section. Default: true */
  showTrends?: boolean;
}

export function AIInsightsWidget({ maxInsights = 4, showTrends = true, className }: AIInsightsWidgetExtendedProps) {
  const { insights, trends, isLoading, isRefreshing, refresh, isError } = useAIInsights();

  // Display only the requested number of insights
  const displayedInsights = insights.slice(0, maxInsights);

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Failed to load insights"
        description="Unable to generate AI insights at this time."
        className={className}
      />
    );
  }

  if (displayedInsights.length === 0) {
    return (
      <EmptyState
        icon={Lightbulb}
        title="No insights yet"
        description="AI insights will appear here once you have more lead and conversation data."
        className={className}
      />
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Trends Summary - Week-over-Week Comparison */}
      {showTrends && trends && <TrendsSummary trends={trends} />}

      {/* Insights grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {displayedInsights.map((insight: InsightItem, index: number) => (
          <InsightCard key={`${insight.category}-${index}`} insight={insight} />
        ))}
      </div>

      {/* Refresh button */}
      <div className="flex justify-end pt-2">
        <Button variant="ghost" size="sm" onClick={() => refresh()} disabled={isRefreshing} className="text-xs">
          {isRefreshing ? <Loader2 className="size-3 animate-spin mr-1.5" /> : <RefreshCw className="size-3 mr-1.5" />}
          Refresh Insights
        </Button>
      </div>
    </div>
  );
}

