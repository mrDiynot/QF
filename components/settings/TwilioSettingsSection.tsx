'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Phone,
  MessageSquare,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  Loader2,
  TestTube,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { settingsService } from '@/services/api/settings.service';
import type { TwilioChannelSummary, TwilioUsageCategory } from '@/types/api';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Channel type icon mapping
const channelIcons: Record<string, React.ReactNode> = {
  SMS: <MessageSquare className="size-4" />,
  Voice: <Phone className="size-4" />,
  WhatsApp: <MessageCircle className="size-4" />,
};

// Channel status badge - reserved for future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ChannelStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; color: string }> = {
    Verified: { variant: 'default', label: 'Verified', color: 'bg-green-100 text-green-700 border-green-200' },
    Pending: { variant: 'secondary', label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    Failed: { variant: 'destructive', label: 'Failed', color: 'bg-red-100 text-red-700 border-red-200' },
  };
  const config = statusConfig[status] || { variant: 'outline', label: status, color: 'bg-muted/40 text-foreground/80 border-border' };
  return (
    <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full border", config.color)}>
      {config.label}
    </span>
  );
}

// Channel card component
function ChannelCard({ channel }: { channel: TwilioChannelSummary }) {
  // Determine the effective status - a channel cannot be both Pending and Active
  // Priority: Pending/Failed verification takes precedence over isActive flag
  const isPending = channel.verificationStatus === 'Pending';
  const isFailed = channel.verificationStatus === 'Failed';
  const isVerified = channel.verificationStatus === 'Verified';
  const isEffectivelyActive = isVerified && channel.isActive;

  return (
    <div className="flex items-center justify-between p-4 border rounded-xl bg-white hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex size-10 items-center justify-center rounded-xl",
          channel.type === 'SMS' && "bg-muted/50 text-info",
          channel.type === 'Voice' && "bg-green-100 text-green-600",
          channel.type === 'WhatsApp' && "bg-emerald-100 text-emerald-600",
        )}>
          {channelIcons[channel.type] || <Phone className="size-4" />}
        </div>
        <div>
          <p className="font-medium text-foreground">{channel.type}</p>
          <p className="text-sm text-muted-foreground font-mono">
            {channel.phoneNumber || 'No number assigned'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* Show only one status: Pending, Failed, Active, or Inactive */}
        {isPending ? (
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
            <Clock className="size-3.5" />
            <span className="text-xs font-medium">Pending</span>
          </div>
        ) : isFailed ? (
          <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full">
            <AlertCircle className="size-3.5" />
            <span className="text-xs font-medium">Failed</span>
          </div>
        ) : isEffectivelyActive ? (
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full">
            <CheckCircle2 className="size-3.5" />
            <span className="text-xs font-medium">Active</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 px-2 py-1 bg-muted/40 text-muted-foreground rounded-full">
            <AlertCircle className="size-3.5" />
            <span className="text-xs font-medium">Inactive</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Usage category card with detailed breakdown
function UsageCard({ 
  title, 
  icon, 
  usage,
  showMinutes = false,
}: { 
  title: string; 
  icon: React.ReactNode; 
  usage?: TwilioUsageCategory;
  showMinutes?: boolean;
}) {
  const inbound = usage?.inboundCount ?? 0;
  const outbound = usage?.outboundCount ?? 0;
  const total = usage?.totalCount ?? (inbound + outbound);
  const cost = usage?.cost ?? 0;
  const minutes = usage?.totalMinutes ?? 0;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-muted/40">
          {icon}
        </div>
        <span className="font-semibold text-foreground">{title}</span>
      </div>
      
      <div className="space-y-3">
        {/* Inbound/Outbound breakdown */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
            <ArrowDownLeft className="size-3.5 text-green-600" />
            <div>
              <p className="text-xs text-green-600 font-medium">Inbound</p>
              <p className="text-sm font-bold text-green-700">{inbound.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
            <ArrowUpRight className="size-3.5 text-info" />
            <div>
              <p className="text-xs text-info font-medium">Outbound</p>
              <p className="text-sm font-bold text-info">{outbound.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Total and Minutes */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold text-foreground">{total.toLocaleString()}</p>
          </div>
          {showMinutes && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                <Clock className="size-3" /> Minutes
              </p>
              <p className="text-lg font-bold text-foreground">{minutes.toFixed(1)}</p>
            </div>
          )}
        </div>

        {/* Cost */}
        <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
          <span className="text-sm text-orange-700 font-medium">Cost</span>
          <span className="text-lg font-bold text-orange-600">${cost.toFixed(2)}</span>
        </div>
      </div>
    </Card>
  );
}

export function TwilioSettingsSection() {
  // Fetch Twilio settings
  const { data: settings, isLoading: isLoadingSettings, error: settingsError } = useQuery({
    queryKey: ['twilio', 'settings'],
    queryFn: settingsService.getTwilioSettings,
  });

  // Fetch Twilio usage - only if settings indicate a sub-account exists
  const { data: usage, isLoading: isLoadingUsage, error: usageError, refetch: refetchUsage } = useQuery({
    queryKey: ['twilio', 'usage'],
    queryFn: settingsService.getTwilioUsage,
    enabled: settings?.isConfigured === true,
    retry: false,
  });

  const isLoading = isLoadingSettings;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="size-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading Twilio settings...</p>
      </div>
    );
  }

  if (settingsError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="size-12 text-red-500 mb-4" />
        <p className="text-lg font-medium text-foreground">Failed to load Twilio settings</p>
        <p className="text-sm text-muted-foreground mt-1">Please try again later</p>
      </div>
    );
  }

  // Format dates for display
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Mode Banner */}
      {settings?.isTestMode && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="p-2 bg-amber-100 rounded-lg">
            <TestTube className="size-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-800">Test Mode Active</p>
            <p className="text-sm text-amber-700">
              Using Twilio test credentials. No real charges will be incurred.
            </p>
          </div>
          {settings.testModePhoneNumber && (
            <div className="text-right">
              <p className="text-xs text-amber-600">Test Number</p>
              <p className="font-mono text-sm font-medium text-amber-800">{settings.testModePhoneNumber}</p>
            </div>
          )}
        </div>
      )}

      {/* Sub-Account Info */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Activity className="size-5 text-primary" />
            Twilio Sub-Account
          </h3>
          {settings?.isConfigured && (
            <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
              Configured
            </Badge>
          )}
        </div>
        
        {settings?.isConfigured ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 bg-muted/20 rounded-xl">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Account SID</p>
                <p className="font-mono text-sm truncate" title={settings.subAccountSid}>
                  {settings.subAccountSid}
                </p>
              </div>
              <div className="p-4 bg-muted/20 rounded-xl">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "size-2 rounded-full",
                    settings.subAccountStatus === 'active' ? "bg-green-500" : "bg-amber-500"
                  )} />
                  <p className="font-medium capitalize">{settings.subAccountStatus || 'Unknown'}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Phone className="size-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="font-medium text-foreground">No Twilio sub-account configured</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Activate a channel to provision your sub-account</p>
            <Link href="/channels">
              <Button variant="outline" size="sm">
                Go to Channels
              </Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Active Channels */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Phone className="size-5 text-green-600" />
            Active Channels
          </h3>
          <Badge variant="secondary">{settings?.channels?.length || settings?.totalChannels || 0} channels</Badge>
        </div>

        {settings?.channels && settings.channels.length > 0 ? (
          <div className="space-y-3">
            {settings.channels.map((channel, index) => (
              <ChannelCard key={channel.channelId || `channel-${index}`} channel={channel} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="size-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="font-medium text-foreground">No channels configured</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Activate SMS, Voice, or WhatsApp to get started</p>
            <Link href="/channels">
              <Button variant="outline" size="sm">
                Activate Channels
              </Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Usage & Billing */}
      {settings?.isConfigured && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="size-5 text-orange-600" />
              Current Period Usage
            </h3>
            <div className="flex items-center gap-3">
              {usage && (
                <span className="text-sm text-muted-foreground">
                  {formatDate(usage.startDate)} - {formatDate(usage.endDate)}
                </span>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="size-8"
                onClick={() => refetchUsage()}
                disabled={isLoadingUsage}
              >
                <RefreshCw className={cn("size-4", isLoadingUsage && "animate-spin")} />
              </Button>
            </div>
          </div>

          {isLoadingUsage ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : usageError ? (
            <div className="text-center py-8">
              <AlertCircle className="size-10 mx-auto mb-3 text-amber-500" />
              <p className="font-medium text-foreground">Unable to load usage data</p>
              <p className="text-sm text-muted-foreground mt-1">Usage data will be available once you have active channels</p>
            </div>
          ) : usage ? (
            <>
              <div className="grid gap-4 sm:grid-cols-3 mb-6">
                <UsageCard
                  title="SMS"
                  icon={<MessageSquare className="size-4 text-info" />}
                  usage={usage.sms}
                />
                <UsageCard
                  title="Voice"
                  icon={<Phone className="size-4 text-green-600" />}
                  usage={usage.voice}
                  showMinutes={true}
                />
                <UsageCard
                  title="WhatsApp"
                  icon={<MessageCircle className="size-4 text-emerald-600" />}
                  usage={usage.whatsApp}
                />
              </div>

              {/* Total Cost */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-orange-50 border border-primary/10 rounded-xl">
                <div>
                  <span className="text-sm text-muted-foreground">Total Twilio Cost</span>
                  <p className="text-xs text-muted-foreground">Current billing period</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-primary">
                    ${(usage.totalCost ?? 0).toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">{usage.currency || 'USD'}</span>
                </div>
              </div>

              {settings?.isTestMode && (
                <p className="text-xs text-muted-foreground mt-4 text-center italic">
                  * Test mode active - these are simulated usage numbers. No actual charges.
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="size-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="font-medium text-foreground">No usage data available</p>
              <p className="text-sm text-muted-foreground mt-1">Start using your channels to see usage statistics</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
