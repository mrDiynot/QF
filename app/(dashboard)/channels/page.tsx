'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCw,
  Trophy,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { channelsService, type PendingChannel } from '@/services/api/channels.service';
import { ImprovedChannelSetupWizard } from '@/components/channels/ImprovedChannelSetupWizard';
import { ChannelCard } from '@/components/channels/ChannelCard';
import { PendingChannelCard } from '@/components/channels/PendingChannelCard';
import { ComingSoonChannelCard } from '@/components/channels/ComingSoonChannelCard';
import type { Channel } from '@/types/api';

// Channels that are coming soon (none currently - Meta API is now integrated)
const COMING_SOON_CHANNELS: string[] = [];

// Check if a channel type is coming soon
const isComingSoonChannel = (channelType: string): boolean => {
  return COMING_SOON_CHANNELS.includes(channelType.toLowerCase().replace('_', ''));
};

export default function EnhancedChannelsPage() {
  const searchParams = useSearchParams();
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [selectedChannelType, setSelectedChannelType] = useState<string | null>(null);

  // Handle setup query parameter (e.g., /channels?setup=sms)
  useEffect(() => {
    const setupChannel = searchParams.get('setup');
    if (setupChannel) {
      setSelectedChannelType(setupChannel.toUpperCase());
      setSetupDialogOpen(true);
    }
  }, [searchParams]);

  // Fetch channels data
  const { data: channels = [], refetch } = useQuery({
    queryKey: ['channels'],
    queryFn: channelsService.getChannels,
  });

  const { data: allPendingChannels = [] } = useQuery({
    queryKey: ['channels', 'pending'],
    queryFn: channelsService.getPendingChannels,
  });

  // Get active channel types for cross-referencing
  const activeChannelTypes = useMemo(() => {
    const types = new Set<string>();
    channels.forEach((c: Channel) => {
      if (c.isActive) {
        // Add type variations
        if (c.type) {
          const typeLower = c.type.toLowerCase();
          types.add(typeLower);
          types.add(typeLower.replace('_', ''));
          types.add(c.type);
        }
        // Also check channel name for Email channels (type is 'None' for Email)
        if (c.name) {
          const nameLower = c.name.toLowerCase();
          types.add(nameLower);
          // Special handling for Email
          if (nameLower.includes('email')) {
            types.add('email');
            types.add('Email');
          }
        }
      }
    });
    return types;
  }, [channels]);

  // Categorize pending channels
  const { pendingChannels, comingSoonChannels, totalSelectedChannels } = useMemo(() => {
    const pending: PendingChannel[] = [];
    const comingSoon: PendingChannel[] = [];

    allPendingChannels.forEach((pc: PendingChannel) => {
      const channelTypeLower = pc.channelType.toLowerCase();
      const channelTypeNormalized = channelTypeLower.replace('_', '');

      // Check all variations for matching
      let isAlreadyActive = pc.isActivated ||
        activeChannelTypes.has(channelTypeLower) ||
        activeChannelTypes.has(channelTypeNormalized) ||
        activeChannelTypes.has(pc.channelType) ||
        // Special case for Email which may have different casing
        (channelTypeLower === 'email' && activeChannelTypes.has('Email'));

      // Special case: SocialMessaging is satisfied by Facebook or Instagram channels
      if (!isAlreadyActive && (channelTypeNormalized === 'socialmessaging' || channelTypeNormalized === 'social')) {
        isAlreadyActive = activeChannelTypes.has('facebook') ||
          activeChannelTypes.has('instagram') ||
          activeChannelTypes.has('Facebook') ||
          activeChannelTypes.has('Instagram');
      }

      // Skip if already activated
      if (isAlreadyActive) return;

      // Categorize as coming soon or pending setup
      if (isComingSoonChannel(pc.channelType)) {
        comingSoon.push(pc);
      } else {
        pending.push(pc);
      }
    });

    return {
      pendingChannels: pending,
      comingSoonChannels: comingSoon,
      totalSelectedChannels: allPendingChannels.length
    };
  }, [allPendingChannels, activeChannelTypes]);

  const activeChannels = channels.filter((c: Channel) => c.isActive);

  // Channels with failed verification that need attention
  const failedChannels = channels.filter((c: Channel) => c.verificationStatus === 'Failed');

  // Channels that are fully healthy (active AND verified or pending verification)
  const healthyActiveChannels = activeChannels.filter((c: Channel) => c.verificationStatus !== 'Failed');

  // Calculate accurate completion stats
  const completionStats = useMemo(() => {
    const activatedCount = healthyActiveChannels.length;
    const pendingCount = pendingChannels.length;
    const comingSoonCount = comingSoonChannels.length;
    const failedCount = failedChannels.length;

    // Completion = healthy activated / (healthy activated + pending that can be setup + failed)
    // Don't count coming soon in the denominator as they can't be setup yet
    const setupableTotal = activatedCount + pendingCount + failedCount;
    const completionPercent = setupableTotal > 0
      ? Math.min(100, Math.round((activatedCount / setupableTotal) * 100))
      : (activatedCount > 0 ? 100 : 0);

    return {
      selected: totalSelectedChannels,
      active: activatedCount,
      pending: pendingCount,
      comingSoon: comingSoonCount,
      failed: failedCount,
      completion: completionPercent
    };
  }, [totalSelectedChannels, healthyActiveChannels.length, pendingChannels.length, comingSoonChannels.length, failedChannels.length]);

  const handleSetupChannel = (channelType: string) => {
    setSelectedChannelType(channelType);
    setSetupDialogOpen(true);
  };

  const handleSetupComplete = () => {
    setSetupDialogOpen(false);
    setSelectedChannelType(null);
    refetch();
  };

  // Reset selectedChannelType when dialog closes without completing
  const handleDialogOpenChange = (open: boolean) => {
    setSetupDialogOpen(open);
    if (!open) {
      setSelectedChannelType(null);
    }
  };

  return (
    <div className="animate-fade-in pt-4 space-y-8">
      {/* Header - Activation Focus */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-orange/10 border-2 border-brand-orange/20 rounded-xl">
                <Zap className="size-7 text-brand-orange" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Activate Your Channels</h1>
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <Sparkles className="size-4 text-brand-orange" />
                  Complete setup for the channels you selected during onboarding
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="size-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Activation Progress Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-2 border-success/20 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-text-secondary flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-600" />
              Active Channels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {completionStats.active}
            </div>
          </CardContent>
        </Card>

        <Card className={completionStats.pending > 0 ? "border-2 border-amber-100 bg-amber-50/30" : ""}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-text-secondary flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-600" />
              Needs Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              {completionStats.pending}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-text-secondary flex items-center gap-2">
              <Clock className="size-4 text-slate-500" />
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-500">
              {completionStats.comingSoon}
            </div>
          </CardContent>
        </Card>

        <Card className={completionStats.completion === 100 ? "border-2 border-success/30 bg-white" : "border-2 border-gray-200 bg-white"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Setup Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`text-3xl font-bold ${completionStats.completion === 100 ? 'text-success' : 'text-gray-900'}`}>
                {completionStats.completion}%
              </div>
              {completionStats.completion === 100 && (
                <Badge className="bg-success-bg text-success-dark border border-success/20">
                  Complete!
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activation Guide - Only show if there are channels that need setup */}
      {pendingChannels.length > 0 && (
        <Card className="border-2 border-warning/30 bg-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 border border-warning/20 rounded-lg">
                <Zap className="size-5 text-warning" />
              </div>
              <div>
                <CardTitle className="text-xl">Complete Your Channel Setup</CardTitle>
                <p className="text-text-secondary">
                  {pendingChannels.length} channel{pendingChannels.length !== 1 ? 's' : ''} need{pendingChannels.length === 1 ? 's' : ''} configuration to start capturing leads.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-100">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium text-text-navy">Review Channels Below</p>
                  <p className="text-sm text-text-secondary">See which channels need to be configured</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-100">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium text-text-navy">Click &quot;Complete Setup&quot;</p>
                  <p className="text-sm text-text-secondary">Follow the setup wizard to configure each channel</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-100">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium text-text-navy">Start Capturing Leads</p>
                  <p className="text-sm text-text-secondary">Once configured, your channels will be ready to receive and qualify leads</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Channels Needing Setup */}
      {pendingChannels.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-600" />
            <h2 className="text-2xl font-bold text-text-navy">
              Channels Needing Setup
            </h2>
            <Badge className="bg-amber-100 text-amber-700 border-0">
              {pendingChannels.length} Pending
            </Badge>
          </div>
          <p className="text-text-secondary">
            Complete the setup for these channels to start capturing leads.
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingChannels.map((channel: PendingChannel) => (
              <PendingChannelCard
                key={channel.channelType}
                pending={channel}
                onSetup={() => handleSetupChannel(channel.channelType)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Coming Soon Channels */}
      {comingSoonChannels.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-slate-500" />
            <h2 className="text-2xl font-bold text-text-navy">
              Coming Soon
            </h2>
            <Badge className="bg-slate-100 text-slate-600 border-0">
              {comingSoonChannels.length} Channel{comingSoonChannels.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <p className="text-text-secondary">
            These channels will be available soon. We&apos;re working on integrating with Meta APIs.
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {comingSoonChannels.map((channel: PendingChannel) => (
              <ComingSoonChannelCard
                key={channel.channelType}
                channel={channel}
              />
            ))}
          </div>
        </div>
      )}

      {/* Already Active Channels */}
      {activeChannels.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-green-600" />
            <h2 className="text-2xl font-bold text-text-navy">
              Active Channels
            </h2>
            <Badge className="bg-green-100 text-green-700 border-0">
              {activeChannels.length} Active
            </Badge>
          </div>
          <p className="text-text-secondary">
            These channels are already set up and actively capturing leads for your business.
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeChannels.map((channel: Channel) => (
              <ChannelCard key={channel.id} channel={channel} onRefetch={refetch} />
            ))}
          </div>
        </div>
      )}

      {/* Failed Channels Warning */}
      {failedChannels.length > 0 && (
        <Card className="border-2 border-error/30 bg-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-error/10 border border-error/20 rounded-lg">
                <AlertTriangle className="size-5 text-error" />
              </div>
              <div>
                <CardTitle className="text-xl text-error">Channels Need Attention</CardTitle>
                <p className="text-text-secondary">
                  {failedChannels.length} channel{failedChannels.length !== 1 ? 's have' : ' has'} failed verification and may not be working properly.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {failedChannels.map((channel: Channel) => (
                <div key={channel.id} className="flex items-center justify-between p-3 bg-error/5 border border-error/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{channel.name}</span>
                    <Badge variant="destructive" className="text-xs">Failed</Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Find the channel type and open setup dialog
                      setSelectedChannelType(channel.type);
                      setSetupDialogOpen(true);
                    }}
                    className="text-error border-error/30 hover:bg-error/10"
                  >
                    Reconfigure
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success State - All Channels Activated (only show if no pending AND no failed channels) */}
      {pendingChannels.length === 0 && failedChannels.length === 0 && activeChannels.length > 0 && (
        <Card className="border-2 border-success/30 bg-white">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 bg-success rounded-full">
                <Trophy className="size-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  All Channels Activated! 🎉
                </h3>
                <p className="text-gray-600">
                  Congratulations! All your selected channels are now active and ready to capture leads.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-4">
                <Button
                  onClick={() => window.location.href = '/conversations'}
                  className="gap-2 bg-brand-purple text-white hover:bg-brand-purple/90"
                >
                  <MessageSquare className="size-4" />
                  View Conversations
                </Button>
                <Button
                  onClick={() => window.location.href = '/leads'}
                  variant="outline"
                  className="gap-2"
                >
                  View Leads
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Dialog */}
      <ImprovedChannelSetupWizard
        open={setupDialogOpen}
        onOpenChange={handleDialogOpenChange}
        onComplete={handleSetupComplete}
        preSelectedChannel={selectedChannelType}
      />

      {/* Celebration System - Temporarily disabled */}
      {/* {currentCelebration && (
        <CelebrationConfetti {...currentCelebration} />
      )} */}
    </div>
  );
}
