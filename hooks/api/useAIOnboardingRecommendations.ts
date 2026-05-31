/**
 * AI Onboarding Recommendations Hook
 * React Query hook for fetching AI-powered onboarding recommendations
 */

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import aiService from '@/services/api/ai.service';
import type {
  OnboardingRecommendationRequest,
  OnboardingRecommendationResult,
} from '@/types/ai-onboarding';

/**
 * Hook for generating AI onboarding recommendations
 * @returns Mutation for generating recommendations
 */
export function useAIOnboardingRecommendations() {
  return useMutation<
    OnboardingRecommendationResult,
    Error,
    OnboardingRecommendationRequest
  >({
    mutationKey: ['ai-onboarding-recommendations'],
    mutationFn: async (request) => {
      console.log('[AIRecommendations] Starting API call...');
      const result = await aiService.getOnboardingRecommendations(request);
      console.log('[AIRecommendations] API call succeeded:', result?.success);
      return result;
    },
    onSuccess: (data) => {
      console.log('[AIRecommendations] onSuccess callback - success:', data?.success);
      console.log('[AIRecommendations] onSuccess - channels:', data?.recommendedChannels?.length);
    },
    onError: (error: Error & { response?: { data?: unknown; status?: number } }) => {
      console.error('Failed to get AI recommendations:', error);
      console.error('[AIRecommendations] Error status:', error.response?.status);
      console.error('[AIRecommendations] Error data:', JSON.stringify(error.response?.data, null, 2));
      toast.error('Failed to get AI recommendations. Using defaults.');
    },
  });
}

/**
 * Hook options for customizing the recommendations mutation
 */
export interface UseAIOnboardingRecommendationsOptions {
  onSuccess?: (data: OnboardingRecommendationResult) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for generating AI onboarding recommendations with custom callbacks
 * @param options - Custom callbacks for success/error
 * @returns Mutation for generating recommendations
 */
export function useAIOnboardingRecommendationsWithCallbacks(
  options?: UseAIOnboardingRecommendationsOptions
) {
  return useMutation<
    OnboardingRecommendationResult,
    Error,
    OnboardingRecommendationRequest
  >({
    mutationKey: ['ai-onboarding-recommendations'],
    mutationFn: async (request) => {
      return aiService.getOnboardingRecommendations(request);
    },
    onSuccess: (data) => {
      if (data.success) {
        options?.onSuccess?.(data);
      } else {
        const error = new Error(data.errorMessage || 'Failed to get recommendations');
        options?.onError?.(error);
      }
    },
    onError: (error) => {
      console.error('Failed to get AI recommendations:', error);
      options?.onError?.(error);
    },
  });
}

