'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MessageCircle,
  Users,
  AlertTriangle,
  Bot,
  CheckCircle2,
} from 'lucide-react';
import { useSocialChannelsSummary, useAtRiskConversations } from '@/hooks/api';
import { cn } from '@/lib/utils';

interface SocialAnalyticsCardProps {
  startDate?: string;
  endDate?: string;
  className?: string;
}

export function SocialAnalyticsCard({ startDate, endDate, className }: SocialAnalyticsCardProps) {
  const { data: summary, isLoading: summaryLoading } = useSocialChannelsSummary(startDate, endDate);
  const { data: atRisk, isLoading: atRiskLoading } = useAtRiskConversations();

  if (summaryLoading || atRiskLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="size-5" />
            Social Channel Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  const metrics = [
    {
      label: 'Total Messages',
      value: summary.totalMessaging?.totalMessages ?? 0,
      icon: MessageCircle,
      color: 'text-info',
    },
    {
      label: 'Conversations',
      value: summary.totalMessaging?.uniqueConversations ?? 0,
      icon: Users,
      color: 'text-green-500',
    },
    {
      label: 'AI Coverage',
      value: `${Math.round(summary.overallAICoverage ?? 0)}%`,
      icon: Bot,
      color: 'text-primary',
    },
    {
      label: 'Compliance Rate',
      value: `${Math.round(summary.overallComplianceRate ?? 0)}%`,
      icon: CheckCircle2,
      color: 'text-emerald-500',
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="size-5" />
            Social Channel Analytics
          </CardTitle>
          {(atRisk?.count ?? 0) > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="size-3" />
              {atRisk?.count} at risk
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="p-4 rounded-lg bg-muted/50 border"
            >
              <div className="flex items-center gap-2 mb-2">
                <metric.icon className={cn('size-4', metric.color)} />
                <span className="text-sm text-muted-foreground">{metric.label}</span>
              </div>
              <div className="text-2xl font-bold">{metric.value}</div>
            </div>
          ))}
        </div>

        {/* Channel Breakdown */}
        {summary.channelBreakdown && summary.channelBreakdown.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-3">Channel Breakdown</h4>
            <div className="space-y-2">
              {summary.channelBreakdown.map((channel) => (
                <div
                  key={channel.channelId}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {channel.channelType}
                    </Badge>
                    <span className="text-sm">{channel.pageName}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{channel.messaging?.totalMessages ?? 0} msgs</span>
                    <span>{channel.conversion?.qualifiedLeads ?? 0} qualified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

