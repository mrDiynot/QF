'use client';

import { WidgetAnalytics } from '@/types/widget-analytics';
import { Card } from '@/components/ui/card';
import { BarChart3, MessageSquare, Clock, Star, TrendingUp, Users } from 'lucide-react';

interface WidgetAnalyticsDashboardProps {
  analytics: WidgetAnalytics;
}

export function WidgetAnalyticsDashboard({ analytics }: WidgetAnalyticsDashboardProps) {
  const { metrics, conversationTrend, topTopics, timeDistribution, deviceBreakdown, sourceBreakdown } = analytics;

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const maxConversations = Math.max(...timeDistribution.map(t => t.conversations));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Conversations</p>
              <p className="text-2xl font-bold text-text-navy mt-1">{metrics.totalConversations.toLocaleString()}</p>
            </div>
            <MessageSquare className="size-8 text-brand-purple" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Avg Response Time</p>
              <p className="text-2xl font-bold text-text-navy mt-1">{metrics.avgResponseTime}s</p>
            </div>
            <Clock className="size-8 text-brand-orange" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Satisfaction Score</p>
              <p className="text-2xl font-bold text-text-navy mt-1">{metrics.satisfactionScore.toFixed(1)}/5</p>
            </div>
            <Star className="size-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Conversion Rate</p>
              <p className="text-2xl font-bold text-text-navy mt-1">{metrics.conversionRate}%</p>
            </div>
            <TrendingUp className="size-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Conversation Trend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text-navy mb-4 flex items-center gap-2">
          <BarChart3 className="size-5" />
          Conversation Trend (Last 7 Days)
        </h3>
        <div className="space-y-3">
          {conversationTrend.map((day) => (
            <div key={day.date} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">{new Date(day.date).toLocaleDateString()}</span>
                <span className="font-medium text-text-navy">{day.conversations} conversations</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-purple transition-all"
                  style={{ width: `${(day.conversations / 250) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Topics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-navy mb-4">Top Topics</h3>
          <div className="space-y-4">
            {topTopics.map((topic) => (
              <div key={topic.topic} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-navy">{topic.topic}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-secondary">{topic.count} conversations</span>
                    <span className="text-xs font-medium text-brand-purple">{topic.percentage}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-purple"
                      style={{ width: `${topic.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="size-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-text-secondary">{topic.avgSatisfaction.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Time Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-navy mb-4">Conversations by Hour</h3>
          <div className="flex items-end justify-between gap-1 h-48">
            {timeDistribution.map((time) => (
              <div key={time.hour} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-brand-purple rounded-t" style={{ height: `${(time.conversations / maxConversations) * 100}%` }} />
                {time.hour % 3 === 0 && (
                  <span className="text-xs text-text-secondary">{time.hour}h</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-navy mb-4">Device Breakdown</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Desktop</span>
                <span className="text-sm font-medium text-text-navy">{deviceBreakdown.desktop}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-muted/300" style={{ width: `${deviceBreakdown.desktop}%` }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Mobile</span>
                <span className="text-sm font-medium text-text-navy">{deviceBreakdown.mobile}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${deviceBreakdown.mobile}%` }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Tablet</span>
                <span className="text-sm font-medium text-text-navy">{deviceBreakdown.tablet}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary/50" style={{ width: `${deviceBreakdown.tablet}%` }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Traffic Source */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-navy mb-4">Traffic Source</h3>
          <div className="space-y-4">
            {Object.entries(sourceBreakdown).map(([source, percentage]) => (
              <div key={source} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary capitalize">{source}</span>
                  <span className="text-sm font-medium text-text-navy">{percentage}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-brand-orange" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="size-8 text-brand-purple" />
            <div>
              <p className="text-sm text-text-secondary">Unique Visitors</p>
              <p className="text-xl font-bold text-text-navy">{metrics.uniqueVisitors.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="size-8 text-brand-orange" />
            <div>
              <p className="text-sm text-text-secondary">Total Messages</p>
              <p className="text-xl font-bold text-text-navy">{metrics.totalMessages.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="size-8 text-green-500" />
            <div>
              <p className="text-sm text-text-secondary">Avg Duration</p>
              <p className="text-xl font-bold text-text-navy">{formatDuration(metrics.avgConversationDuration)}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
