'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePendingChannels, useActivateChannel } from '@/hooks/api/useChannels';
import {
  MessageSquare, Phone, Mail, MessageCircle, FileText, Share2,
  CheckCircle, Lock, Loader2, Sparkles, ArrowRight, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ReactNode> = {
  MessageSquare: <MessageSquare className="size-5" />,
  Phone: <Phone className="size-5" />,
  Mail: <Mail className="size-5" />,
  MessageCircle: <MessageCircle className="size-5" />,
  FileText: <FileText className="size-5" />,
  Share2: <Share2 className="size-5" />,
};

export function ChannelSetupCard() {
  const { data: pendingChannels, isLoading } = usePendingChannels();
  const activateChannel = useActivateChannel();
  const [activatingChannel, setActivatingChannel] = useState<string | null>(null);
  const [justActivated, setJustActivated] = useState<string | null>(null);

  const handleActivate = async (channelType: string) => {
    setActivatingChannel(channelType);
    try {
      const response = await activateChannel.mutateAsync({
        channelType,
        phoneNumberOption: 'new',
      });

      // Handle OAuth-required channels (Social Messaging)
      if (response.requiresOAuth && response.oAuthUrl) {
        window.location.href = response.oAuthUrl;
        return;
      }

      // Show success animation
      setJustActivated(channelType);
      setTimeout(() => setJustActivated(null), 3000);
    } finally {
      setActivatingChannel(null);
    }
  };

  // Filter to show only pending (not activated) channels
  const channelsToSetup = pendingChannels?.filter(c => !c.isActivated) || [];

  // Don't show anything if:
  // 1. Still loading initial data
  // 2. No pending channels returned (onboarding not complete, never started, or all channels activated)
  // 3. All channels are already activated
  if (isLoading) {
    // Return null during loading to avoid flash of loading skeleton
    // for operational businesses who have no pending channels
    return null;
  }

  if (channelsToSetup.length === 0) {
    return null; // Don't show if no pending channels or all activated
  }

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
      <Card className="relative p-6 bg-white/90 backdrop-blur-sm border-primary/10/50 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-orange shadow-lg">
            <Zap className="size-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-navy">Complete Your Setup</h3>
            <p className="text-sm text-text-secondary">
              Activate the channels you selected during onboarding
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {channelsToSetup.map((channel) => {
            const isActivating = activatingChannel === channel.channelType;
            const isLocked = !channel.isAvailableOnCurrentPlan;
            const wasJustActivated = justActivated === channel.channelType;

            return (
              <div
                key={channel.channelType}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border transition-all",
                  isLocked
                    ? "bg-muted/20 border-border"
                    : wasJustActivated
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 animate-pulse"
                    : "bg-gradient-to-r from-purple-50/50 to-orange-50/50 border-primary/10 hover:border-primary/20"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex size-10 items-center justify-center rounded-lg",
                    isLocked ? "bg-muted/40 text-muted-foreground/60" : "bg-white text-brand-purple shadow-sm"
                  )}>
                    {iconMap[channel.iconName] || <MessageSquare className="size-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-medium",
                        isLocked ? "text-muted-foreground" : "text-text-navy"
                      )}>
                        {channel.displayName}
                      </span>
                      {isLocked && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                          <Lock className="size-3" />
                          {channel.minimumPlan}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary">{channel.description}</p>
                  </div>
                </div>

                {isLocked ? (
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <Link href="/settings/billing">
                      Upgrade
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleActivate(channel.channelType)}
                    disabled={isActivating}
                    className="gap-2 bg-gradient-to-r from-brand-purple to-brand-orange hover:opacity-90"
                  >
                    {isActivating ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Activating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" />
                        Activate
                      </>
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Activated channels summary */}
        {pendingChannels && pendingChannels.filter(c => c.isActivated).length > 0 && (
          <div className="mt-4 pt-4 border-t border-primary/10">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="size-4" />
              <span>
                {pendingChannels.filter(c => c.isActivated).length} channel(s) already activated
              </span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

