/**
 * React hooks for Gamification features
 */

import { useQuery } from '@tanstack/react-query';
import { gamificationService } from '@/services/api/gamification.service';
import type { ChannelType } from '@/types/api';
import { queryConfig } from '@/lib/query-config';

export function useAvailableAchievements() {
  return useQuery({
    queryKey: ['achievements', 'available'],
    queryFn: () => gamificationService.getAvailableAchievements(),
    ...queryConfig.static, // Available achievements rarely change
    staleTime: 1000 * 60 * 60, // Override: 1 hour
  });
}

export function useEarnedAchievements() {
  return useQuery({
    queryKey: ['achievements', 'earned'],
    queryFn: () => gamificationService.getEarnedAchievements(),
    ...queryConfig.standard, // Standard refresh rate for earned achievements
  });
}

export function useChannelMastery(channelType: ChannelType | null) {
  return useQuery({
    queryKey: ['channel-mastery', channelType],
    queryFn: () => channelType ? gamificationService.getChannelMastery(channelType) : null,
    enabled: !!channelType,
    ...queryConfig.standard,
  });
}

export function useLeaderboard(
  industry: string,
  metricType: 'response_time' | 'conversion_rate' | 'satisfaction',
  period: 'daily' | 'weekly' | 'monthly' | 'all_time'
) {
  return useQuery({
    queryKey: ['leaderboard', industry, metricType, period],
    queryFn: () => gamificationService.getLeaderboard(industry, metricType, period),
    enabled: !!industry,
    ...queryConfig.standard,
    staleTime: 1000 * 60 * 10, // Override: 10 minutes for leaderboard
  });
}

export function useStreak(streakType: 'fast_response' | 'daily_activity' | 'perfect_week') {
  return useQuery({
    queryKey: ['streak', streakType],
    queryFn: () => gamificationService.getStreak(streakType),
    ...queryConfig.standard,
  });
}

export function usePendingCelebrations() {
  return useQuery({
    queryKey: ['celebrations', 'pending'],
    queryFn: () => gamificationService.getPendingCelebrations(),
    ...queryConfig.realtime, // Need real-time updates for celebrations
    refetchInterval: 60 * 1000, // Override: refetch every minute
  });
}
