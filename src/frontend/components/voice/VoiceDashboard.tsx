'use client';

/**
 * AI Voice Dashboard Component
 * Displays call statistics, recent calls, and voice agent performance
 * Updated Sprint 37 - Connected to Voice Calls API
 */

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  Bot,
  Play,
  CheckCircle,
  AlertCircle,
  Download,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useVoiceCalls, useVoiceCallAnalytics } from '@/hooks/api/useVoiceCalls';

interface VoiceDashboardProps {
  className?: string;
}

export function VoiceDashboard({ className }: VoiceDashboardProps) {
  // Date range state reserved for filtering
  useState<'today' | 'week' | 'month'>('week');
  
  // Fetch data from API
  const { data: callsData, isLoading: loadingCalls, refetch: refetchCalls } = useVoiceCalls({ pageSize: 10 });
  const { data: analytics, isLoading: loadingAnalytics } = useVoiceCallAnalytics();
  
  const isLoading = loadingCalls || loadingAnalytics;

  // Calculate stats from analytics data
  const stats = useMemo(() => {
    if (!analytics) {
      return {
        totalCalls: 0,
        completedCalls: 0,
        successRate: 0,
        avgDuration: '0:00',
        aiHandled: 0,
        humanHandled: 0,
      };
    }
    
    const minutes = Math.floor(analytics.averageDurationSeconds / 60);
    const seconds = analytics.averageDurationSeconds % 60;
    
    return {
      totalCalls: analytics.totalCalls,
      completedCalls: analytics.completedCalls,
      successRate: analytics.successRate,
      avgDuration: `${minutes}m ${seconds}s`,
      aiHandled: Math.round(analytics.totalCalls * 0.7), // Estimate AI handled
      humanHandled: Math.round(analytics.totalCalls * 0.3),
    };
  }, [analytics]);

  // Get daily trend data for chart
  const chartData = useMemo(() => {
    if (!analytics?.dailyTrend) return [];
    return analytics.dailyTrend.slice(-9).map(d => ({
      hour: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
      calls: d.count,
    }));
  }, [analytics]);

  const maxCalls = Math.max(...(chartData.map(d => d.calls) || [1]), 1);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <Skeleton className="h-48 w-full" />
        </Card>
      </div>
    );
  }

  const recentCalls = callsData?.calls || [];
  const missedCalls = stats.totalCalls - stats.completedCalls;
  const aiHandledPercent = stats.totalCalls > 0 
    ? Math.round((stats.aiHandled / stats.totalCalls) * 100) 
    : 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Voice Call Analytics</h2>
        <Button variant="outline" size="sm" onClick={() => refetchCalls()} className="gap-2">
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      {/* Header Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Calls"
          value={stats.totalCalls.toLocaleString()}
          change="+12.5%"
          trend="up"
          icon={<Phone className="size-5" />}
          color="purple"
        />
        <StatCard
          title="Success Rate"
          value={`${stats.successRate.toFixed(1)}%`}
          change="+2.3%"
          trend="up"
          icon={<CheckCircle className="size-5" />}
          color="green"
        />
        <StatCard
          title="Avg Duration"
          value={stats.avgDuration}
          change="-0:15"
          trend="down"
          icon={<Clock className="size-5" />}
          color="blue"
        />
        <StatCard
          title="AI Handled"
          value={`${aiHandledPercent}%`}
          change="+5.2%"
          trend="up"
          icon={<Bot className="size-5" />}
          color="orange"
        />
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Call Activity Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Call Activity</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Today</Button>
              <Button variant="ghost" size="sm">Week</Button>
              <Button variant="ghost" size="sm">Month</Button>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="flex items-end justify-between h-48 gap-2">
            {chartData.length > 0 ? chartData.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg transition-all hover:opacity-80"
                  style={{ height: `${(data.calls / maxCalls) * 100}%`, minHeight: '4px' }}
                />
                <span className="text-[10px] text-muted-foreground">{data.hour}</span>
              </div>
            )) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground/60">
                No call data available
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
              <span className="text-sm text-muted-foreground">Calls per day</span>
            </div>
          </div>
        </Card>

        {/* Call Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Call Distribution</h3>
          
          <div className="space-y-4">
            <DistributionItem
              label="AI Handled"
              value={stats.aiHandled}
              total={stats.totalCalls || 1}
              color="from-purple-500 to-pink-500"
              icon={<Bot className="size-4" />}
            />
            <DistributionItem
              label="Human Handled"
              value={stats.humanHandled}
              total={stats.totalCalls || 1}
              color="from-blue-500 to-cyan-500"
              icon={<Users className="size-4" />}
            />
            <DistributionItem
              label="Missed"
              value={missedCalls}
              total={stats.totalCalls || 1}
              color="from-red-500 to-orange-500"
              icon={<PhoneMissed className="size-4" />}
            />
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completed Calls</span>
              <span className="font-semibold text-foreground">{stats.completedCalls}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Calls */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Recent Calls</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="size-4" />
              Export
            </Button>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Contact</th>
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Direction</th>
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Duration</th>
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Time</th>
                <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentCalls.length > 0 ? recentCalls.map((call) => (
                <tr key={call.id} className="border-b last:border-0">
                  <td className="py-4">
                    <div>
                      <p className="font-medium text-foreground">{call.contactName || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{call.phoneNumber}</p>
                    </div>
                  </td>
                  <td className="py-4">
                    <Badge variant="outline" className="gap-1">
                      {call.direction === 'inbound' ? (
                        <PhoneIncoming className="size-3" />
                      ) : (
                        <PhoneOutgoing className="size-3" />
                      )}
                      {call.direction}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <CallStatusBadge status={call.status} />
                  </td>
                  <td className="py-4 text-sm text-muted-foreground">
                    {call.durationSeconds ? `${Math.floor(call.durationSeconds / 60)}:${(call.durationSeconds % 60).toString().padStart(2, '0')}` : '0:00'}
                  </td>
                  <td className="py-4 text-sm text-muted-foreground">
                    {call.startedAt ? formatDistanceToNow(new Date(call.startedAt), { addSuffix: true }) : '—'}
                  </td>
                  <td className="py-4 text-right">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Play className="size-3" />
                      Play
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No recent calls
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  change,
  trend,
  icon,
  color,
}: {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: 'purple' | 'green' | 'blue' | 'orange';
}) {
  const colorClasses = {
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
    blue: 'from-blue-500 to-cyan-500',
    orange: 'from-orange-500 to-amber-500',
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          <div className="flex items-center gap-1 mt-2">
            {trend === 'up' ? (
              <TrendingUp className="size-4 text-green-500" />
            ) : (
              <TrendingDown className="size-4 text-red-500" />
            )}
            <span className={cn(
              "text-sm font-medium",
              trend === 'up' ? "text-green-600" : "text-red-600"
            )}>
              {change}
            </span>
            <span className="text-xs text-muted-foreground/60">vs last week</span>
          </div>
        </div>
        <div className={cn(
          "flex size-12 items-center justify-center rounded-xl text-white bg-gradient-to-br",
          colorClasses[color]
        )}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

// Distribution Item Component
function DistributionItem({
  label,
  value,
  total,
  color,
  icon,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  icon: React.ReactNode;
}) {
  const percentage = Math.round((value / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("flex size-6 items-center justify-center rounded text-white bg-gradient-to-br", color)}>
            {icon}
          </div>
          <span className="text-sm text-foreground/80">{label}</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-semibold text-foreground">{value}</span>
          <span className="text-xs text-muted-foreground ml-1">({percentage}%)</span>
        </div>
      </div>
      <Progress 
        value={percentage} 
        className={cn("h-1.5", `[&>div]:bg-gradient-to-r [&>div]:${color}`)}
      />
    </div>
  );
}

// Call Status Badge
function CallStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    completed: { label: 'Completed', color: 'text-green-600 bg-green-50', icon: <CheckCircle className="size-3" /> },
    missed: { label: 'Missed', color: 'text-red-600 bg-red-50', icon: <PhoneMissed className="size-3" /> },
    no_answer: { label: 'No Answer', color: 'text-orange-600 bg-orange-50', icon: <AlertCircle className="size-3" /> },
    in_progress: { label: 'In Progress', color: 'text-info bg-muted/30', icon: <Phone className="size-3" /> },
  };

  const { label, color, icon } = config[status] || config.completed;

  return (
    <Badge variant="outline" className={cn("gap-1", color)}>
      {icon}
      {label}
    </Badge>
  );
}

// Sentiment Badge - Reserved for future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SentimentBadge({ sentiment }: { sentiment: string | null }) {
  if (!sentiment) return <span className="text-muted-foreground/60">—</span>;

  const config: Record<string, { color: string; emoji: string }> = {
    positive: { color: 'bg-green-100 text-green-700', emoji: '😊' },
    neutral: { color: 'bg-muted/40 text-foreground/80', emoji: '😐' },
    negative: { color: 'bg-red-100 text-red-700', emoji: '😟' },
  };

  const { color, emoji } = config[sentiment] || config.neutral;

  return (
    <Badge variant="secondary" className={color}>
      {emoji} {sentiment}
    </Badge>
  );
}
