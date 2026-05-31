/**
 * AI Readiness Hook
 * Fetches and manages AI readiness checklist data
 */

import { useQuery } from '@tanstack/react-query';
import { aiReadinessService } from '@/services/api/ai-readiness.service';
import type { AIReadinessChecklist } from '@/types/ai-readiness';
import { queryConfig } from '@/lib/query-config';
import { devLog } from '@/lib/dev-bypass';

export const aiReadinessKeys = {
  all: ['ai-readiness'] as const,
  checklist: () => [...aiReadinessKeys.all, 'checklist'] as const,
  quickScore: () => [...aiReadinessKeys.all, 'quick-score'] as const,
};

/**
 * Hook to get AI readiness checklist
 * Fetches real data from API and calculates checklist
 */
export function useAIReadiness() {
  return useQuery({
    queryKey: aiReadinessKeys.checklist(),
    queryFn: async (): Promise<AIReadinessChecklist> => {
      try {
        // Fetch real business data from API
        const apiResponse = await aiReadinessService.getReadinessChecklist();
        
        // The API returns raw business data - calculate the checklist from it
        // If it's already calculated (has categories), return as-is
        if (apiResponse && 'categories' in apiResponse && Array.isArray(apiResponse.categories)) {
          return apiResponse;
        }
        
        // Otherwise, map API response to local calculation format
        const data = apiResponse as unknown as {
          onboardingComplete: boolean;
          onboardingStep: number;
          industry?: string;
          primaryGoal?: string;
          aiToneConfigured: boolean;
          activeChannels: string[];
          hasPhoneNumber: boolean;
          hasWebChat: boolean;
          hasForms: boolean;
          bantWeightsConfigured: boolean;
          qualificationThresholdSet: boolean;
          aiPersonaSelected: boolean;
          autoResponseEnabled: boolean;
          businessInfoComplete: boolean;
          knowledgeBasePopulated: boolean;
          quickRepliesConfigured: boolean;
          leadCount: number;
          leadSourcesTracked: boolean;
          subscriptionTier: string;
          aiInteractionsRemaining: number;
          aiInteractionsLimit: number;
        };

        return aiReadinessService.calculateLocalReadiness({
          onboardingComplete: data.onboardingComplete ?? false,
          onboardingStep: data.onboardingStep ?? 1,
          industry: data.industry,
          primaryGoal: data.primaryGoal,
          aiToneConfigured: data.aiToneConfigured ?? false,
          activeChannels: data.activeChannels ?? [],
          hasPhoneNumber: data.hasPhoneNumber ?? false,
          hasWebChat: data.hasWebChat ?? false,
          hasForms: data.hasForms ?? false,
          bantWeightsConfigured: data.bantWeightsConfigured ?? false,
          qualificationThresholdSet: data.qualificationThresholdSet ?? false,
          aiPersonaSelected: data.aiPersonaSelected ?? false,
          autoResponseEnabled: data.autoResponseEnabled ?? false,
          businessInfoComplete: data.businessInfoComplete ?? false,
          knowledgeBasePopulated: data.knowledgeBasePopulated ?? false,
          quickRepliesConfigured: data.quickRepliesConfigured ?? false,
          leadCount: data.leadCount ?? 0,
          leadSourcesTracked: data.leadSourcesTracked ?? false,
          subscriptionTier: data.subscriptionTier ?? 'freeflow',
          aiInteractionsRemaining: data.aiInteractionsRemaining ?? 50,
          aiInteractionsLimit: data.aiInteractionsLimit ?? 50,
        });
      } catch (error) {
        devLog('Failed to fetch AI readiness from API:', error);
        // Return a safe default so the dashboard renders even when backend is down
        return aiReadinessService.calculateLocalReadiness({
          onboardingComplete: false,
          onboardingStep: 1,
          aiToneConfigured: false,
          activeChannels: [],
          hasPhoneNumber: false,
          hasWebChat: false,
          hasForms: false,
          bantWeightsConfigured: false,
          qualificationThresholdSet: false,
          aiPersonaSelected: false,
          autoResponseEnabled: false,
          businessInfoComplete: false,
          knowledgeBasePopulated: false,
          quickRepliesConfigured: false,
          leadCount: 0,
          leadSourcesTracked: false,
          subscriptionTier: 'freeflow',
          aiInteractionsRemaining: 50,
          aiInteractionsLimit: 50,
        });
      }
    },
    ...queryConfig.standard,
    retry: 0, // Don't retry on network error — fall back to default immediately
  });
}

/**
 * Hook to get quick AI readiness score
 */
export function useAIReadinessQuickScore() {
  return useQuery({
    queryKey: aiReadinessKeys.quickScore(),
    queryFn: () => aiReadinessService.getQuickScore(),
    ...queryConfig.static,
  });
}

export default useAIReadiness;
