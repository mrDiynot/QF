/**
 * React Query hooks for Meta (Facebook/Instagram) channel management
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { channelsService, type MetaConnectionStatus } from '@/services/api/channels.service';
import { useChannels } from './useChannels';
import { queryConfig } from '@/lib/query-config';

// Query keys
export const metaChannelKeys = {
  all: ['meta-channels'] as const,
  status: () => [...metaChannelKeys.all, 'status'] as const,
};

/**
 * Hook to fetch Meta connection status from the backend API
 */
export function useMetaConnectionStatus() {
  return useQuery<MetaConnectionStatus, Error>({
    queryKey: metaChannelKeys.status(),
    queryFn: () => channelsService.getMetaConnectionStatus(),
    ...queryConfig.standard,
  });
}

/**
 * Hook to check if Meta channels (Facebook/Instagram) are connected
 * This uses the existing channels data to determine connection status
 * without making an additional API call
 */
export function useMetaChannels() {
  const { data: channels, isLoading, error } = useChannels();

  return useMemo(() => {
    if (!channels) {
      return {
        isLoading,
        error,
        hasMetaChannels: false,
        hasFacebookChannel: false,
        hasInstagramChannel: false,
        facebookChannel: null,
        instagramChannel: null,
        metaChannels: [],
        isConnected: false,
      };
    }

    // Find Facebook and Instagram channels
    // Note: Using string comparison to handle both PascalCase and lowercase formats
    const facebookChannel = channels.find(
      c => (c.type as string) === 'Facebook' || (c.type as string) === 'facebook'
    );
    const instagramChannel = channels.find(
      c => (c.type as string) === 'Instagram' || (c.type as string) === 'instagram'
    );

    // Get all Meta channels (Facebook, Instagram, or SocialMessaging)
    const metaChannels = channels.filter(
      c => {
        const type = c.type as string;
        return type === 'Facebook' || type === 'Instagram' ||
               type === 'facebook' || type === 'instagram' ||
               type === 'SocialMessaging';
      }
    );

    const hasFacebookChannel = !!facebookChannel;
    const hasInstagramChannel = !!instagramChannel;
    const hasMetaChannels = hasFacebookChannel || hasInstagramChannel || metaChannels.length > 0;

    // Check if any Meta channel is active
    const isConnected = metaChannels.some(c => c.isActive);

    return {
      isLoading,
      error,
      hasMetaChannels,
      hasFacebookChannel,
      hasInstagramChannel,
      facebookChannel: facebookChannel || null,
      instagramChannel: instagramChannel || null,
      metaChannels,
      isConnected,
    };
  }, [channels, isLoading, error]);
}

/**
 * Hook to check if Social Messaging (Meta) channels are available
 * Used by the channel wizard to determine if SocialMessaging should show as "Active"
 */
export function useHasSocialMessagingChannels() {
  const { hasMetaChannels, isConnected, isLoading } = useMetaChannels();
  
  return {
    hasSocialMessaging: hasMetaChannels,
    isActive: isConnected,
    isLoading,
  };
}

