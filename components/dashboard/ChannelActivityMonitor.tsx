'use client';

/**
 * Channel Activity Monitor
 * Displays real-time activity across all communication channels
 */

import { useRouter } from 'next/navigation';
import { useChannelPerformance } from '@/hooks/api';
import type { ChannelPerformance } from '@/types/api';
import { 
  MessageSquare, 
  Phone, 
  Mail,
  Instagram,
  Facebook,
  Radio,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
// WhatsApp icon will use MessageSquare as fallback

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  SMS: <MessageSquare className="size-5" />,
  Voice: <Phone className="size-5" />,
  Email: <Mail className="size-5" />,
  WhatsApp: <MessageSquare className="size-5" />,
  Instagram: <Instagram className="size-5" />,
  Facebook: <Facebook className="size-5" />,
  WebChat: <Radio className="size-5" />,
  Chat: <Radio className="size-5" />,
};

const CHANNEL_COLORS: Record<string, string> = {
  SMS: 'from-blue-500 to-cyan-500',
  Voice: 'from-green-500 to-emerald-500',
  Email: 'from-purple-500 to-pink-500',
  WhatsApp: 'from-green-600 to-teal-600',
  Instagram: 'from-pink-500 to-rose-500',
  Facebook: 'from-blue-600 to-indigo-600',
  WebChat: 'from-orange-500 to-amber-500',
  Chat: 'from-orange-500 to-amber-500',
};

// Map channel types to URL filter values
const CHANNEL_URL_MAP: Record<string, string> = {
  SMS: 'sms',
  Voice: 'voice',
  Email: 'email',
  WhatsApp: 'whatsapp',
  Instagram: 'instagram',
  Facebook: 'facebook',
  WebChat: 'webchat',
  Chat: 'webchat',
  ChatWidget: 'webchat',
};

// Helper to format response time (backend returns seconds)
function formatResponseTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}min`;
  return `${(seconds / 3600).toFixed(1)}h`;
}

interface ChannelActivityMonitorProps {
  startDate?: string;
  endDate?: string;
}

export function ChannelActivityMonitor({ startDate, endDate }: ChannelActivityMonitorProps = {}) {
  const router = useRouter();
  
  // Fetch channel performance using standardized hook with date filtering
  const { data: channelData, isLoading, error } = useChannelPerformance(startDate, endDate);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Radio className="size-12 mx-auto text-amber-400 mb-3" />
        <p className="text-sm text-muted-foreground">Unable to load channel metrics</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Data will refresh automatically</p>
      </div>
    );
  }

  if (!channelData || channelData.length === 0) {
    return (
      <div className="text-center py-8">
        <Radio className="size-12 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">No Quick Actions in the last 30 days</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Set up channels to start receiving messages</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <div className="flex gap-4 min-w-max pb-2">
        {channelData.map((channel: ChannelPerformance, index: number) => {
          const channelType = channel.channelType || 'Chat';
          // Use channelName from backend for display, fallback to channelType
          const displayName = channel.channelName || (channelType === 'None' ? 'Other' : channelType);
          const icon = CHANNEL_ICONS[channelType] || CHANNEL_ICONS.Chat;
          const colorGradient = CHANNEL_COLORS[channelType] || CHANNEL_COLORS.Chat;
          // Use totalLeads from backend (leadCount is legacy field name)
          const leadCount = channel.totalLeads ?? channel.leadCount ?? 0;
          const isActive = leadCount > 0;
          const channelUrlParam = CHANNEL_URL_MAP[channelType] || 'webchat';

          const handleClick = () => {
            router.push(`/conversations?channel=${channelUrlParam}`);
          };

          return (
            <div
              key={`channel-${index}`}
              onClick={handleClick}
              className={cn(
                "relative flex-shrink-0 w-64 rounded-2xl p-5 border transition-all cursor-pointer group",
                isActive 
                  ? "bg-white border-border shadow-md hover:shadow-lg hover:border-indigo-300" 
                  : "bg-muted/20 border-border/50 hover:bg-white hover:border-border"
              )}
            >
              {/* Status indicator */}
              <div className="absolute top-3 right-3">
                <div className={cn(
                  "size-2.5 rounded-full",
                  isActive ? "bg-green-500 animate-pulse" : "bg-muted"
                )} />
              </div>

              {/* Channel header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "flex size-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
                  colorGradient
                )}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {displayName}
                  </h3>
                  <p className="text-xs text-muted-foreground">Channel</p>
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Leads</span>
                  <span className="text-sm font-bold text-foreground">
                    {leadCount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Conversion</span>
                  <span className="text-sm font-bold text-foreground">
                    {(Number(channel.conversionRate) || 0).toFixed(1)}%
                  </span>
                </div>
                {channel.averageResponseTime !== undefined && channel.averageResponseTime > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">Avg Response</span>
                    <span className="text-xs font-semibold text-primary">
                      {formatResponseTime(channel.averageResponseTime)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Click hint */}
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="size-4 text-primary" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
