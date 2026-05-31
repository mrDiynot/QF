/**
 * AI CRM Enrichment React Query Hooks
 * Provides hooks for AI-powered CRM data enrichment from conversations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { aiService } from '@/services/api';
import type {
  CrmEnrichmentRequest,
  CrmEnrichmentResult,
  ApplyEnrichmentRequest,
  ApplyEnrichmentResponse,
} from '@/types/ai-crm-enrichment';

// Query keys for cache management
export const crmEnrichmentKeys = {
  all: ['ai', 'crm-enrichment'] as const,
  enrichment: (conversationId: string) =>
    [...crmEnrichmentKeys.all, 'conversation', conversationId] as const,
};

/**
 * Hook for enriching CRM data from a conversation using AI
 * Analyzes conversation to extract contact details, company info, and deal signals
 */
export function useAICrmEnrichment() {
  return useMutation<CrmEnrichmentResult, Error, CrmEnrichmentRequest>({
    mutationFn: (request) => aiService.enrichCrmData(request),
    onError: (error) => {
      console.error('CRM enrichment failed:', error);
      toast.error('Failed to analyze conversation for CRM data');
    },
  });
}

/**
 * Hook for applying accepted CRM enrichment suggestions
 * Updates lead, contact, or deal entities with accepted field values
 */
export function useApplyCrmEnrichment() {
  const queryClient = useQueryClient();

  return useMutation<ApplyEnrichmentResponse, Error, ApplyEnrichmentRequest>({
    mutationFn: (request) => aiService.applyCrmEnrichment(request),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success('CRM data updated successfully');

        // Invalidate relevant queries to refresh data
        if (variables.leadId) {
          queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] });
          queryClient.invalidateQueries({ queryKey: ['leads'] });
        }
        if (variables.contactId) {
          queryClient.invalidateQueries({ queryKey: ['contact', variables.contactId] });
          queryClient.invalidateQueries({ queryKey: ['contacts'] });
        }
        if (variables.dealId) {
          queryClient.invalidateQueries({ queryKey: ['deal', variables.dealId] });
          queryClient.invalidateQueries({ queryKey: ['deals'] });
        }
      } else {
        toast.error(data.message || 'Failed to apply CRM updates');
      }
    },
    onError: (error) => {
      console.error('Apply CRM enrichment failed:', error);
      toast.error('Failed to apply CRM updates');
    },
  });
}

