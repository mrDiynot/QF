/**
 * React Query hooks for channel management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { channelsService, type ActivateChannelRequest, type PendingChannel, type ActivateChannelResponse } from '@/services/api/channels.service';
import type { Channel } from '@/types/api';
import { toast } from 'sonner';
import { queryConfig, invalidateListQueries } from '@/lib/query-config';

// Query keys
export const channelKeys = {
  all: ['channels'] as const,
  lists: () => [...channelKeys.all, 'list'] as const,
  list: (filters: string) => [...channelKeys.lists(), { filters }] as const,
  details: () => [...channelKeys.all, 'detail'] as const,
  detail: (id: string) => [...channelKeys.details(), id] as const,
  pending: () => [...channelKeys.all, 'pending'] as const,
  active: () => [...channelKeys.all, 'active'] as const,
  byType: (type: string) => [...channelKeys.all, 'type', type] as const,
};

/**
 * Hook to fetch all channels
 */
export function useChannels() {
  return useQuery<Channel[], Error>({
    queryKey: channelKeys.lists(),
    queryFn: () => channelsService.getChannels(),
    ...queryConfig.standard,
  });
}

/**
 * Hook to fetch a single channel by ID
 */
export function useChannel(id: string) {
  return useQuery<Channel, Error>({
    queryKey: channelKeys.detail(id),
    queryFn: () => channelsService.getChannelById(id),
    enabled: !!id,
    ...queryConfig.detail,
  });
}

/**
 * Hook to fetch active channels
 */
export function useActiveChannels() {
  return useQuery<Channel[], Error>({
    queryKey: channelKeys.active(),
    queryFn: () => channelsService.getActiveChannels(),
    ...queryConfig.standard,
  });
}

/**
 * Hook to fetch channels by type
 */
export function useChannelsByType(type: string) {
  return useQuery<Channel[], Error>({
    queryKey: channelKeys.byType(type),
    queryFn: () => channelsService.getChannelsByType(type),
    enabled: !!type,
    ...queryConfig.standard,
  });
}

/**
 * Hook to fetch pending channels from onboarding
 */
export function usePendingChannels() {
  return useQuery<PendingChannel[], Error>({
    queryKey: channelKeys.pending(),
    queryFn: () => channelsService.getPendingChannels(),
    ...queryConfig.realtime,
  });
}

/**
 * Hook to activate a channel from onboarding
 */
export function useActivateChannel() {
  const queryClient = useQueryClient();

  return useMutation<ActivateChannelResponse, Error, ActivateChannelRequest>({
    mutationFn: (request) => channelsService.activateChannel(request),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`${data.channel?.name || 'Channel'} activated successfully!`);
        // Invalidate relevant queries with proper cache clearing
        invalidateListQueries(queryClient, channelKeys.all, [['ai-readiness'], ['analytics']]);
      } else {
        toast.error(data.errorMessage || 'Failed to activate channel');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to activate channel');
    },
  });
}

/**
 * Hook to verify a channel
 */
export function useVerifyChannel() {
  const queryClient = useQueryClient();

  return useMutation<Channel, Error, string>({
    mutationFn: (id) => channelsService.verifyChannel(id),
    onSuccess: (data) => {
      toast.success(`${data.name} verified successfully!`);
      invalidateListQueries(queryClient, channelKeys.all, [['ai-readiness']]);
      queryClient.invalidateQueries({ queryKey: channelKeys.detail(data.id), refetchType: 'all' });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to verify channel');
    },
  });
}

