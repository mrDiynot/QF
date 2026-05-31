/**
 * Leads React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsService } from '@/services/api';
import { toast } from 'sonner';
import type { CreateLeadRequest, QualifyLeadRequest } from '@/types/api';
import { queryConfig, invalidateListQueries } from '@/lib/query-config';

export const leadsKeys = {
  all: ['leads'] as const,
  lists: () => [...leadsKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...leadsKeys.lists(), filters] as const,
  details: () => [...leadsKeys.all, 'detail'] as const,
  detail: (id: string) => [...leadsKeys.details(), id] as const,
};

export function useLeads(params?: {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
  source?: string;
}) {
  return useQuery({
    queryKey: leadsKeys.list(params || {}),
    queryFn: () => leadsService.getLeads(params),
    ...queryConfig.realtime, // Leads need real-time updates after bulk imports
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: leadsKeys.detail(id),
    queryFn: () => leadsService.getLeadById(id),
    enabled: !!id,
    ...queryConfig.detail,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeadRequest) => leadsService.createLead(data),
    onSuccess: () => {
      invalidateListQueries(queryClient, leadsKeys.all, [['analytics']]);
      toast.success('Lead created successfully');
    },
    onError: () => {
      toast.error('Failed to create lead');
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateLeadRequest> }) =>
      leadsService.updateLead(id, data),
    onSuccess: (_, variables) => {
      invalidateListQueries(queryClient, leadsKeys.all);
      queryClient.invalidateQueries({ queryKey: leadsKeys.detail(variables.id), refetchType: 'all' });
      toast.success('Lead updated successfully');
    },
    onError: () => {
      toast.error('Failed to update lead');
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leadsService.deleteLead(id),
    onSuccess: () => {
      invalidateListQueries(queryClient, leadsKeys.all, [['analytics']]);
      toast.success('Lead deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete lead');
    },
  });
}

export function useQualifyLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: QualifyLeadRequest) => leadsService.qualifyLead(data),
    onSuccess: (_, variables) => {
      invalidateListQueries(queryClient, leadsKeys.all, [['analytics']]);
      queryClient.invalidateQueries({ queryKey: leadsKeys.detail(variables.leadId), refetchType: 'all' });
      toast.success('Lead qualification updated');
    },
    onError: () => {
      toast.error('Failed to qualify lead');
    },
  });
}