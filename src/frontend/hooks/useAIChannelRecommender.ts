/**
 * React hook for AI Channel Recommender
 */

import { useQuery } from '@tanstack/react-query';
import { aiChannelRecommenderService } from '@/services/api/ai-channel-recommender.service';
import type { ChannelType } from '@/types/api';

export function useChannelRecommendations() {
  return useQuery({
    queryKey: ['channel-recommendations'],
    queryFn: () => aiChannelRecommenderService.getRecommendations(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useIndustryBundle(industry: string) {
  return useQuery({
    queryKey: ['industry-bundle', industry],
    queryFn: () => aiChannelRecommenderService.getIndustryBundle(industry),
    enabled: !!industry,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useChannelImpactPrediction(channelType: ChannelType | null) {
  return useQuery({
    queryKey: ['channel-impact', channelType],
    queryFn: () => channelType ? aiChannelRecommenderService.predictImpact(channelType) : null,
    enabled: !!channelType,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
