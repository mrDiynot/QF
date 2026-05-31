/**
 * Gamification Service
 * Manages achievements, badges, leaderboards, and channel mastery
 */

import { apiClient } from '@/lib/axios';
import type { ChannelType } from '@/types/api';

export interface Achievement {
  id: string;
  achievementKey: string;
  title: string;
  description: string;
  icon: string;
  category: 'volume' | 'speed' | 'quality' | 'mastery' | 'streak';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  points: number;
  requirementType: string;
  requirementValue: number;
  rewardDescription: string;
  isActive: boolean;
}

export interface BusinessAchievement {
  id: string;
  achievementId: string;
  achievement: Achievement;
  earnedAt: string;
  progress: number; // 0-100
  isClaimed: boolean;
  claimedAt?: string;
}

export interface ChannelMastery {
  id: string;
  businessId: string;
  channelType: ChannelType;
  masteryLevel: number; // 1-5
  masteryLevelName: string; // Novice, Apprentice, Expert, Master, Grandmaster
  totalMessages: number;
  totalConversions: number;
  averageResponseRate: number;
  experiencePoints: number;
  levelProgress: number; // 0-100
  nextLevelRequirements: {
    messages: number;
    conversions: number;
    responseRate: number;
  };
  unlocks: string[];
}

export interface LeaderboardEntry {
  rank: number;
  businessId: string;
  businessName: string;
  score: number;
  previousRank?: number;
  trend: 'up' | 'down' | 'stable';
  badge?: string;
}

export interface Leaderboard {
  industry: string;
  metricType: 'response_time' | 'conversion_rate' | 'satisfaction';
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  entries: LeaderboardEntry[];
  userEntry?: LeaderboardEntry;
  totalParticipants: number;
}

export interface BusinessStreak {
  id: string;
  streakType: 'fast_response' | 'daily_activity' | 'perfect_week';
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  streakMultiplier: number;
  isActive: boolean;
}

export interface CelebrationEvent {
  id: string;
  eventType: 'achievement_earned' | 'level_up' | 'streak_milestone' | 'leaderboard_rank';
  eventData: {
    title: string;
    message: string;
    icon: string;
    reward?: string;
  };
  isShown: boolean;
  createdAt: string;
}

export const gamificationService = {
  /**
   * Gets all available achievements
   */
  async getAvailableAchievements(): Promise<Achievement[]> {
    try {
      const response = await apiClient.get<Achievement[]>('/api/v1/gamification/achievements');
      return response.data;
    } catch (error) {
      console.error('Failed to get achievements:', error);
      return [];
    }
  },

  /**
   * Gets earned achievements for current business
   */
  async getEarnedAchievements(): Promise<BusinessAchievement[]> {
    try {
      const response = await apiClient.get<BusinessAchievement[]>('/api/v1/gamification/achievements/earned');
      return response.data;
    } catch (error) {
      console.error('Failed to get earned achievements:', error);
      return [];
    }
  },

  /**
   * Gets channel mastery for a specific channel
   */
  async getChannelMastery(channelType: ChannelType): Promise<ChannelMastery | null> {
    try {
      const response = await apiClient.get<ChannelMastery>(`/api/v1/gamification/mastery/${channelType}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get channel mastery:', error);
      return null;
    }
  },

  /**
   * Gets leaderboard for specific industry and metric
   */
  async getLeaderboard(
    industry: string,
    metricType: 'response_time' | 'conversion_rate' | 'satisfaction',
    period: 'daily' | 'weekly' | 'monthly' | 'all_time'
  ): Promise<Leaderboard | null> {
    try {
      const response = await apiClient.get<Leaderboard>('/api/v1/gamification/leaderboard', {
        params: { industry, metricType, period }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      return null;
    }
  },

  /**
   * Gets current streak for business
   */
  async getStreak(streakType: 'fast_response' | 'daily_activity' | 'perfect_week'): Promise<BusinessStreak | null> {
    try {
      const response = await apiClient.get<BusinessStreak>(`/api/v1/gamification/streaks/${streakType}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get streak:', error);
      return null;
    }
  },

  /**
   * Gets pending celebration events
   */
  async getPendingCelebrations(): Promise<CelebrationEvent[]> {
    try {
      const response = await apiClient.get<CelebrationEvent[]>('/api/v1/gamification/celebrations/pending');
      return response.data;
    } catch (error) {
      console.error('Failed to get celebrations:', error);
      return [];
    }
  },

  /**
   * Marks celebration as shown
   */
  async markCelebrationAsShown(celebrationId: string): Promise<void> {
    try {
      await apiClient.post(`/api/v1/gamification/celebrations/${celebrationId}/shown`);
    } catch (error) {
      console.error('Failed to mark celebration as shown:', error);
    }
  }
};
