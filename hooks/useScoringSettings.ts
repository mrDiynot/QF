// -----------------------------------------------------------------------
// Scoring Settings Hook
// React Query hook for managing business scoring configuration
// -----------------------------------------------------------------------

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  DEFAULT_SCORING_CONFIG,
  ScoringConfiguration,
  scoringSettingsService,
  UpdateScoringConfigurationRequest,
} from '@/services/api/scoring-settings.service';

const QUERY_KEY = ['scoring-settings'];

/**
 * Hook for fetching and managing scoring configuration
 */
export function useScoringSettings() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => scoringSettingsService.getConfiguration(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: (request: UpdateScoringConfigurationRequest) =>
      scoringSettingsService.updateConfiguration(request),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEY, data);
      toast.success('Scoring settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update scoring settings: ${error.message}`);
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => scoringSettingsService.resetToDefaults(),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEY, data);
      toast.success('Scoring settings reset to defaults');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reset scoring settings: ${error.message}`);
    },
  });

  return {
    config: query.data ?? DEFAULT_SCORING_CONFIG,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    updateConfig: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    resetToDefaults: resetMutation.mutate,
    isResetting: resetMutation.isPending,
    refetch: query.refetch,
  };
}

/**
 * Validates that BANT weights sum to 100
 */
export function validateBANTWeights(config: Partial<ScoringConfiguration>): string | null {
  const sum =
    (config.budgetWeight ?? 0) +
    (config.authorityWeight ?? 0) +
    (config.needWeight ?? 0) +
    (config.timelineWeight ?? 0);

  if (sum !== 100) {
    return `BANT weights must sum to 100 (current: ${sum})`;
  }
  return null;
}

/**
 * Validates that AI/Rules weights sum to 100
 */
export function validateAIRulesWeights(config: Partial<ScoringConfiguration>): string | null {
  const sum = (config.aiWeight ?? 0) + (config.rulesWeight ?? 0);

  if (sum !== 100) {
    return `AI and Rules weights must sum to 100 (current: ${sum})`;
  }
  return null;
}

/**
 * Validates status thresholds are in ascending order
 */
export function validateStatusThresholds(config: Partial<ScoringConfiguration>): string | null {
  const contacted = config.contactedThreshold ?? 0;
  const engaged = config.engagedThreshold ?? 0;
  const qualified = config.qualifiedThreshold ?? 0;
  const opportunity = config.opportunityThreshold ?? 0;

  if (contacted >= engaged) {
    return 'Contacted threshold must be less than Engaged threshold';
  }
  if (engaged >= qualified) {
    return 'Engaged threshold must be less than Qualified threshold';
  }
  if (qualified >= opportunity) {
    return 'Qualified threshold must be less than Opportunity threshold';
  }
  return null;
}
