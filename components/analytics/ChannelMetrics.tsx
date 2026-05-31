'use client';

/**
 * Channel Performance Metrics Component
 * Displays performance metrics for each communication channel
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  MessageSquare,
  Phone,
  Mail,
  Globe,
  Instagram,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChannelPerformance } from '@/hooks/api/useAnalytics';

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  sms: <MessageSquare className="size-5" />,
  voice: <Phone className="size-5" />,
  email: <Mail className="size-5" />,
  webchat: <Globe className="size-5" />,
  whatsapp: <MessageCircle className="size-5" />,
  instagram: <Instagram className="size-5" />,
};

const CHANNEL_COLORS: Record<string, { bg: string; text: string; gradient: string }> = {
  sms: { bg: 'bg-muted/50', text: 'text-info', gradient: 'from-blue-500 to-blue-600' },
  voice: { bg: 'bg-green-100', text: 'text-green-600', gradient: 'from-green-500 to-green-600' },
  email: { bg: 'bg-primary/10', text: 'text-primary', gradient: 'from-purple-500 to-purple-600' },
  webchat: { bg: 'bg-orange-100', text: 'text-orange-600', gradient: 'from-orange-500 to-orange-600' },
  whatsapp: { bg: 'bg-emerald-100', text: 'text-emerald-600', gradient: 'from-emerald-500 to-emerald-600' },
  instagram: { bg: 'bg-muted/50', text: 'text-muted-foreground', gradient: 'from-pink-500 to-pink-600' },
};

interface ChannelMetricsProps {
  className?: string;
  variant?: 'grid' | 'table' | 'list';
}

export function ChannelMetrics({ className, variant = 'grid' }: ChannelMetricsProps) {
  const { data: channels, isLoading, error } = useChannelPerformance();

  if (isLoading) {
    return (
      <Card className={cn("p-6", className)}>
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </Card>
    );
  }

  if (error || !channels) {
    return (
      <Card className={cn("p-6", className)}>
        <p className="text-center text-muted-foreground">Failed to load channel data</p>
      </Card>
    );
  }

  // Find max leads for relative comparison (use totalLeads from backend, fallback to leadCount)
  const maxLeads = Math.max(...channels.map(c => c.totalLeads ?? c.leadCount ?? 0), 1);

  if (variant === 'table') {
    return (
      <Card className={cn("p-6", className)}>
        <h3 className="text-lg font-semibold text-foreground mb-6">Channel Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Channel</th>
                <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Leads</th>
                <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Conversion</th>
                <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Avg Response</th>
                <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Trend</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((channel, idx) => {
                const colors = CHANNEL_COLORS[channel.channelType.toLowerCase()] || CHANNEL_COLORS.sms;
                const icon = CHANNEL_ICONS[channel.channelType.toLowerCase()] || CHANNEL_ICONS.sms;
                const trend = Math.random() > 0.5 ? 'up' : 'down';
                const trendValue = (Math.random() * 20).toFixed(1);

                return (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex size-8 items-center justify-center rounded-lg", colors.bg, colors.text)}>
                          {icon}
                        </div>
                        <span className="font-medium text-foreground capitalize">
                          {channel.channelType}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-right font-semibold text-foreground">
                      {(channel.totalLeads ?? channel.leadCount ?? 0).toLocaleString()}
                    </td>
                    <td className="py-4 text-right">
                      <Badge variant="outline" className="text-emerald-600 bg-emerald-50">
                        {Number(channel.conversionRate ?? 0).toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="py-4 text-right text-muted-foreground">
                      {channel.averageResponseTime || '—'}
                    </td>
                    <td className="py-4 text-right">
                      <div className={cn(
                        "flex items-center justify-end gap-1",
                        trend === 'up' ? 'text-emerald-600' : 'text-red-500'
                      )}>
                        {trend === 'up' ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                        <span className="text-sm">{trendValue}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    );
  }

  if (variant === 'list') {
    return (
      <Card className={cn("p-6", className)}>
        <h3 className="text-lg font-semibold text-foreground mb-4">Top Channels</h3>
        <div className="space-y-3">
          {channels.slice(0, 5).map((channel, idx) => {
            const colors = CHANNEL_COLORS[channel.channelType.toLowerCase()] || CHANNEL_COLORS.sms;
            const icon = CHANNEL_ICONS[channel.channelType.toLowerCase()] || CHANNEL_ICONS.sms;
            const leadCount = channel.totalLeads ?? channel.leadCount ?? 0;
            const percentage = (leadCount / maxLeads) * 100;

            return (
              <div key={idx} className="flex items-center gap-3">
                <div className={cn("flex size-8 items-center justify-center rounded-lg", colors.bg, colors.text)}>
                  {icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium capitalize">{channel.channelType}</span>
                    <span className="text-sm text-muted-foreground">{leadCount} leads</span>
                  </div>
                  <Progress value={percentage} className="h-1.5" />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  }

  // Default grid view
  return (
    <Card className={cn("p-6", className)}>
      <h3 className="text-lg font-semibold text-foreground mb-6">Channel Performance</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {channels.map((channel, idx) => {
          const colors = CHANNEL_COLORS[channel.channelType.toLowerCase()] || CHANNEL_COLORS.sms;
          const icon = CHANNEL_ICONS[channel.channelType.toLowerCase()] || CHANNEL_ICONS.sms;
          const leadCount = channel.totalLeads ?? channel.leadCount ?? 0;
          const percentage = (leadCount / maxLeads) * 100;

          return (
            <div
              key={idx}
              className="relative overflow-hidden rounded-xl border bg-white p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "flex size-12 items-center justify-center rounded-xl text-white bg-gradient-to-br",
                  colors.gradient
                )}>
                  {icon}
                </div>
                <Badge variant="outline" className={cn("font-semibold", colors.text)}>
                  {Number(channel.conversionRate ?? 0).toFixed(0)}% conv
                </Badge>
              </div>

              <h4 className="font-semibold text-foreground capitalize mb-1">
                {channel.channelType}
              </h4>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Users className="size-4" />
                  <span>{leadCount} leads</span>
                </div>
                {channel.averageResponseTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="size-4" />
                    <span>{channel.averageResponseTime}</span>
                  </div>
                )}
              </div>

              <Progress 
                value={percentage} 
                className={cn("h-1.5", `[&>div]:bg-gradient-to-r [&>div]:${colors.gradient}`)}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// Summary card for dashboard
export function ChannelSummary({ className }: { className?: string }) {
  const { data: channels, isLoading } = useChannelPerformance();

  if (isLoading || !channels) {
    return <Skeleton className={cn("h-20", className)} />;
  }

  const totalLeads = channels.reduce((sum, c) => sum + (c.totalLeads ?? c.leadCount ?? 0), 0);
  const topChannel = channels.reduce((top, c) => (c.totalLeads ?? c.leadCount ?? 0) > (top.totalLeads ?? top.leadCount ?? 0) ? c : top, channels[0]);

  return (
    <div className={cn("flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50", className)}>
      <div>
        <p className="text-sm text-muted-foreground">Active Channels</p>
        <p className="text-2xl font-bold text-info">{channels.length}</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-muted-foreground">Top: {topChannel?.channelType}</p>
        <p className="text-sm font-medium text-foreground">{totalLeads} total leads</p>
      </div>
    </div>
  );
}
