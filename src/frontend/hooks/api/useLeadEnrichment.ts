/**
 * Lead Enrichment React Query Hooks
 * Sprint 37 Feature
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  leadEnrichmentService,
  type BulkEnrichmentRequest,
} from '@/services/api/lead-enrichment.service';
import { leadsKeys } from './useLeads';
import { queryConfig, invalidateListQueries } from '@/lib/query-config';

export const leadEnrichmentKeys = {
  all: ['lead-enrichment'] as const,
  company: (domain: string) => [...leadEnrichmentKeys.all, 'company', domain] as const,
  person: (email: string) => [...leadEnrichmentKeys.all, 'person', email] as const,
};

export function useEnrichLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leadId: string) => leadEnrichmentService.enrichLead(leadId),
    onSuccess: () => {
      invalidateListQueries(queryClient, leadsKeys.all);
    },
  });
}

export function useBulkEnrichLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BulkEnrichmentRequest) => leadEnrichmentService.bulkEnrichLeads(request),
    onSuccess: () => {
      invalidateListQueries(queryClient, leadsKeys.all);
    },
  });
}

export function useCompanyLookup(domain: string) {
  return useQuery({
    queryKey: leadEnrichmentKeys.company(domain),
    queryFn: () => leadEnrichmentService.lookupCompany(domain),
    enabled: !!domain && domain.length > 0,
    ...queryConfig.static, // Company data rarely changes
  });
}

export function usePersonLookup(email: string) {
  return useQuery({
    queryKey: leadEnrichmentKeys.person(email),
    queryFn: () => leadEnrichmentService.lookupPerson(email),
    enabled: !!email && email.includes('@'),
    ...queryConfig.static, // Person data rarely changes
  });
}
