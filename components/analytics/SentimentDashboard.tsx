'use client';

/**
 * Sentiment Analytics Dashboard Component
 * Displays sentiment distribution, trends, and channel breakdown
 * Sprint 36 Feature
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  SmilePlus,
  Meh,
  Frown,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Calendar,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { analyticsService, type SentimentAnalyticsDto } from '@/services/api/analytics.service';
import { cn } from '@/lib/utils';
import { format, subDays, startOfDay } from 'date-fns';

const DATE_RANGES = [
  { value: '7', label: 'Last 7 days' },
  { value: '14', label: 'Last 14 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

interface SentimentDashboardProps {
  className?: string;
}

export function SentimentDashboard({ className }: SentimentDashboardProps) {
  const [dateRange, setDateRange] = useState('30');

  const startDate = format(startOfDay(subDays(new Date(), parseInt(dateRange))), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['sentimentAnalytics', dateRange],
    queryFn: () => analyticsService.getSentimentAnalytics(startDate, endDate),
  });

  const getSentimentIcon = (type: 'positive' | 'neutral' | 'negative') => {
    switch (type) {
      case 'positive':
        return <SmilePlus className="size-5 text-green-500" />;
      case 'neutral':
        return <Meh className="size-5 text-amber-500" />;
      case 'negative':
        return <Frown className="size-5 text-red-500" />;
    }
  };

  const getSentimentColor = (score: number) => {
    if (score >= 0.3) return 'text-green-600';
    if (score <= -0.3) return 'text-red-600';
    return 'text-amber-600';
  };

  const getSentimentLabel = (score: number) => {
    if (score >= 0.3) return 'Positive';
    if (score <= -0.3) return 'Negative';
    return 'Neutral';
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Use mock data if API returns null
  const analytics: SentimentAnalyticsDto = data || {
    overall: {
      positive: 45,
      neutral: 35,
      negative: 20,
      positivePercent: 45,
      neutralPercent: 35,
      negativePercent: 20,
    },
    trend: [],
    byChannel: [],
    averageScore: 0.25,
    totalMessagesAnalyzed: 0,
    dateFrom: startDate,
    dateTo: endDate,
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Sentiment Analysis</h2>
          <p className="text-sm text-muted-foreground">
            Analyze customer sentiment across all conversations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="size-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGES.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={cn("size-4", isRefetching && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Average Score */}
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex size-12 items-center justify-center rounded-xl",
              analytics.averageScore >= 0.3 ? "bg-green-100" :
              analytics.averageScore <= -0.3 ? "bg-red-100" : "bg-amber-100"
            )}>
              {analytics.averageScore >= 0.3 ? (
                <TrendingUp className="size-6 text-green-600" />
              ) : analytics.averageScore <= -0.3 ? (
                <TrendingDown className="size-6 text-red-600" />
              ) : (
                <BarChart3 className="size-6 text-amber-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Sentiment</p>
              <p className={cn("text-2xl font-bold", getSentimentColor(analytics.averageScore))}>
                {getSentimentLabel(analytics.averageScore)}
              </p>
            </div>
          </div>
        </Card>

        {/* Total Messages */}
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
              <MessageSquare className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Messages Analyzed</p>
              <p className="text-2xl font-bold text-foreground">
                {analytics.totalMessagesAnalyzed.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        {/* Positive Rate */}
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-green-100">
              <SmilePlus className="size-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Positive Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {analytics.overall.positivePercent}%
              </p>
            </div>
          </div>
        </Card>

        {/* Negative Rate */}
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-red-100">
              <Frown className="size-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Negative Rate</p>
              <p className="text-2xl font-bold text-red-600">
                {analytics.overall.negativePercent}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Sentiment Distribution</h3>
        <div className="space-y-4">
          {/* Positive */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getSentimentIcon('positive')}
                <span className="text-sm font-medium text-foreground/80">Positive</span>
              </div>
              <span className="text-sm font-semibold text-green-600">
                {analytics.overall.positive} ({analytics.overall.positivePercent}%)
              </span>
            </div>
            <Progress 
              value={analytics.overall.positivePercent} 
              className="h-3 bg-muted/40"
            />
          </div>

          {/* Neutral */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getSentimentIcon('neutral')}
                <span className="text-sm font-medium text-foreground/80">Neutral</span>
              </div>
              <span className="text-sm font-semibold text-amber-600">
                {analytics.overall.neutral} ({analytics.overall.neutralPercent}%)
              </span>
            </div>
            <Progress 
              value={analytics.overall.neutralPercent} 
              className="h-3 bg-muted/40"
            />
          </div>

          {/* Negative */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getSentimentIcon('negative')}
                <span className="text-sm font-medium text-foreground/80">Negative</span>
              </div>
              <span className="text-sm font-semibold text-red-600">
                {analytics.overall.negative} ({analytics.overall.negativePercent}%)
              </span>
            </div>
            <Progress 
              value={analytics.overall.negativePercent} 
              className="h-3 bg-muted/40"
            />
          </div>
        </div>
      </Card>

      {/* Channel Breakdown */}
      {analytics.byChannel.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Sentiment by Channel</h3>
          <div className="space-y-4">
            {analytics.byChannel.map((channel) => (
              <div 
                key={channel.channel}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/20"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="size-5 text-muted-foreground/60" />
                  <div>
                    <p className="font-medium text-foreground">{channel.channel}</p>
                    <p className="text-xs text-muted-foreground">
                      {channel.totalMessages.toLocaleString()} messages
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {channel.distribution.positivePercent}% +
                    </Badge>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                      {channel.distribution.neutralPercent}% ~
                    </Badge>
                    <Badge variant="secondary" className="bg-red-100 text-red-700">
                      {channel.distribution.negativePercent}% -
                    </Badge>
                  </div>
                  <div className={cn(
                    "text-sm font-semibold",
                    getSentimentColor(channel.averageScore)
                  )}>
                    {channel.averageScore.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {analytics.totalMessagesAnalyzed === 0 && (
        <Card className="p-12 text-center">
          <MessageSquare className="size-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-foreground">No sentiment data yet</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Sentiment analysis will appear here once you have conversations with sentiment scores.
          </p>
        </Card>
      )}
    </div>
  );
}

export default SentimentDashboard;
