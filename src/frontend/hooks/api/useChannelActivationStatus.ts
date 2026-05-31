/**
 * Hook to check if channel activation is complete
 * Used to determine if user should be redirected to channels page after login
 */

import { useQuery } from '@tanstack/react-query';
import { channelsService, type PendingChannel } from '@/services/api/channels.service';
import type { Channel } from '@/types/api';
import { queryConfig } from '@/lib/query-config';

// Channels that are coming soon (none currently - Meta API is now integrated)
const COMING_SOON_CHANNELS: string[] = [];

// Check if a channel type is coming soon
const isComingSoonChannel = (channelType: string): boolean => {
  return COMING_SOON_CHANNELS.includes(channelType.toLowerCase().replace('_', ''));
};

export interface ChannelActivationStatus {
  isComplete: boolean;
  isLoading: boolean;
  activeCount: number;
  pendingCount: number;
  comingSoonCount: number;
  completionPercent: number;
  hasPendingSetup: boolean;
}

/**
 * Hook to get channel activation status
 * Returns whether all selected channels have been activated
 */
export function useChannelActivationStatus(): ChannelActivationStatus {
  // Fetch active channels
  const { data: channels = [], isLoading: isLoadingChannels } = useQuery<Channel[], Error>({
    queryKey: ['channels', 'list'],
    queryFn: () => channelsService.getChannels(),
    ...queryConfig.standard,
  });

  // Fetch pending channels from onboarding
  const { data: pendingChannels = [], isLoading: isLoadingPending } = useQuery<PendingChannel[], Error>({
    queryKey: ['channels', 'pending'],
    queryFn: () => channelsService.getPendingChannels(),
    ...queryConfig.standard,
  });

  const isLoading = isLoadingChannels || isLoadingPending;

  // Get active channel types for cross-referencing
  const activeChannelTypes = new Set<string>();
  channels.forEach((c: Channel) => {
    if (c.isActive) {
      if (c.type) {
        const typeLower = c.type.toLowerCase();
        activeChannelTypes.add(typeLower);
        activeChannelTypes.add(typeLower.replace('_', ''));
        activeChannelTypes.add(c.type);
      }
      if (c.name) {
        const nameLower = c.name.toLowerCase();
        activeChannelTypes.add(nameLower);
        if (nameLower.includes('email')) {
          activeChannelTypes.add('email');
          activeChannelTypes.add('Email');
        }
      }
    }
  });

  // Categorize pending channels
  let pendingSetupCount = 0;
  let comingSoonCount = 0;

  pendingChannels.forEach((pc: PendingChannel) => {
    const channelTypeLower = pc.channelType.toLowerCase();
    const channelTypeNormalized = channelTypeLower.replace('_', '');

    // Check if already activated
    let isAlreadyActive =
      pc.isActivated ||
      activeChannelTypes.has(channelTypeLower) ||
      activeChannelTypes.has(channelTypeNormalized) ||
      activeChannelTypes.has(pc.channelType) ||
      (channelTypeLower === 'email' && activeChannelTypes.has('Email'));

    // Special case: SocialMessaging is satisfied by Facebook or Instagram channels
    if (!isAlreadyActive && (channelTypeNormalized === 'socialmessaging' || channelTypeNormalized === 'social')) {
      isAlreadyActive = activeChannelTypes.has('facebook') ||
        activeChannelTypes.has('instagram') ||
        activeChannelTypes.has('Facebook') ||
        activeChannelTypes.has('Instagram');
    }

    if (isAlreadyActive) return;

    // Categorize
    if (isComingSoonChannel(pc.channelType)) {
      comingSoonCount++;
    } else {
      pendingSetupCount++;
    }
  });

  const activeChannels = channels.filter((c: Channel) => c.isActive);
  const activeCount = activeChannels.length;

  // Calculate completion percentage
  // Only count channels that can actually be set up (not coming soon)
  const setupableTotal = activeCount + pendingSetupCount;
  const completionPercent =
    setupableTotal > 0
      ? Math.min(100, Math.round((activeCount / setupableTotal) * 100))
      : activeCount > 0
        ? 100
        : 0;

  // Channel activation is complete when:
  // 1. No pending channels that need setup (excluding coming soon)
  // 2. OR completion is 100%
  const isComplete = pendingSetupCount === 0 || completionPercent === 100;

  return {
    isComplete,
    isLoading,
    activeCount,
    pendingCount: pendingSetupCount,
    comingSoonCount,
    completionPercent,
    hasPendingSetup: pendingSetupCount > 0,
  };
}

/**
 * Function to check channel activation status without hooks (for use in login flow)
 * Returns a promise that resolves to the activation status
 */
export async function checkChannelActivationStatus(): Promise<ChannelActivationStatus> {
  try {
    const [channels, pendingChannels] = await Promise.all([
      channelsService.getChannels(),
      channelsService.getPendingChannels(),
    ]);

    // Get active channel types
    const activeChannelTypes = new Set<string>();
    channels.forEach((c: Channel) => {
      if (c.isActive) {
        if (c.type) {
          const typeLower = c.type.toLowerCase();
          activeChannelTypes.add(typeLower);
          activeChannelTypes.add(typeLower.replace('_', ''));
          activeChannelTypes.add(c.type);
        }
        if (c.name) {
          const nameLower = c.name.toLowerCase();
          activeChannelTypes.add(nameLower);
          if (nameLower.includes('email')) {
            activeChannelTypes.add('email');
            activeChannelTypes.add('Email');
          }
        }
      }
    });

    // Categorize pending channels
    let pendingSetupCount = 0;
    let comingSoonCount = 0;

    pendingChannels.forEach((pc: PendingChannel) => {
      const channelTypeLower = pc.channelType.toLowerCase();
      const channelTypeNormalized = channelTypeLower.replace('_', '');

      let isAlreadyActive =
        pc.isActivated ||
        activeChannelTypes.has(channelTypeLower) ||
        activeChannelTypes.has(channelTypeNormalized) ||
        activeChannelTypes.has(pc.channelType) ||
        (channelTypeLower === 'email' && activeChannelTypes.has('Email'));

      // Special case: SocialMessaging is satisfied by Facebook or Instagram channels
      if (!isAlreadyActive && (channelTypeNormalized === 'socialmessaging' || channelTypeNormalized === 'social')) {
        isAlreadyActive = activeChannelTypes.has('facebook') ||
          activeChannelTypes.has('instagram') ||
          activeChannelTypes.has('Facebook') ||
          activeChannelTypes.has('Instagram');
      }

      if (isAlreadyActive) return;

      if (isComingSoonChannel(pc.channelType)) {
        comingSoonCount++;
      } else {
        pendingSetupCount++;
      }
    });

    const activeChannels = channels.filter((c: Channel) => c.isActive);
    const activeCount = activeChannels.length;

    const setupableTotal = activeCount + pendingSetupCount;
    const completionPercent =
      setupableTotal > 0
        ? Math.min(100, Math.round((activeCount / setupableTotal) * 100))
        : activeCount > 0
          ? 100
          : 0;

    const isComplete = pendingSetupCount === 0 || completionPercent === 100;

    return {
      isComplete,
      isLoading: false,
      activeCount,
      pendingCount: pendingSetupCount,
      comingSoonCount,
      completionPercent,
      hasPendingSetup: pendingSetupCount > 0,
    };
  } catch (error) {
    console.error('[checkChannelActivationStatus] Error:', error);
    // On error, assume complete to avoid blocking user
    return {
      isComplete: true,
      isLoading: false,
      activeCount: 0,
      pendingCount: 0,
      comingSoonCount: 0,
      completionPercent: 100,
      hasPendingSetup: false,
    };
  }
}
