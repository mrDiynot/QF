'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadScoringService, ScoreHistoryEntry, LeadScoreResult, BantExtractionResult, ScoringConfiguration } from '@/services/api/lead-scoring.service';
import { toast } from 'sonner';

// Query keys
export const leadScoringKeys = {
  all: ['lead-scoring'] as const,
  history: (leadId: string) => [...leadScoringKeys.all, 'history', leadId] as const,
  bant: (conversationId: string) => [...leadScoringKeys.all, 'bant', conversationId] as const,
  configuration: () => [...leadScoringKeys.all, 'configuration'] as const,
};

/**
 * Hook to fetch score history for a lead
 */
export function useScoreHistory(leadId: string, limit = 10) {
  return useQuery<ScoreHistoryEntry[], Error>({
    queryKey: leadScoringKeys.history(leadId),
    queryFn: () => leadScoringService.getScoreHistory(leadId, limit),
    enabled: !!leadId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to recalculate score for a lead
 */
export function useRecalculateScore() {
  const queryClient = useQueryClient();

  return useMutation<LeadScoreResult, Error, string>({
    mutationFn: (leadId: string) => leadScoringService.recalculateScore(leadId),
    onSuccess: (result) => {
      // Invalidate score history to refetch
      queryClient.invalidateQueries({ queryKey: leadScoringKeys.history(result.leadId) });
      
      const changeText = result.scoreChange > 0 ? `+${result.scoreChange}` : result.scoreChange.toString();
      toast.success(`Score updated: ${result.finalScore} (${changeText})`);
    },
    onError: (error) => {
      toast.error(`Failed to recalculate score: ${error.message}`);
    },
  });
}

/**
 * Hook to extract BANT signals from a conversation
 */
export function useBantExtraction(conversationId: string, enabled = true) {
  return useQuery<BantExtractionResult, Error>({
    queryKey: leadScoringKeys.bant(conversationId),
    queryFn: () => leadScoringService.extractBant(conversationId),
    enabled: !!conversationId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - BANT doesn't change often
  });
}

/**
 * Hook to fetch scoring configuration
 */
export function useScoringConfiguration() {
  return useQuery<ScoringConfiguration, Error>({
    queryKey: leadScoringKeys.configuration(),
    queryFn: () => leadScoringService.getConfiguration(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Helper to get score color based on value
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-yellow-600';
  if (score >= 20) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Helper to get score background color based on value
 */
export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-blue-100';
  if (score >= 40) return 'bg-yellow-100';
  if (score >= 20) return 'bg-orange-100';
  return 'bg-red-100';
}

/**
 * Helper to get BANT label
 */
export function getBantLabel(type: 'budget' | 'authority' | 'need' | 'timeline'): string {
  const labels = {
    budget: 'Budget',
    authority: 'Authority',
    need: 'Need',
    timeline: 'Timeline',
  };
  return labels[type];
}

/**
 * Helper to calculate overall BANT score
 */
export function calculateOverallBantScore(bant: BantExtractionResult): number {
  return Math.round(
    (bant.budgetScore + bant.authorityScore + bant.needScore + bant.timelineScore) / 4
  );
}
