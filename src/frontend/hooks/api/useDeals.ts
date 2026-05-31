/**
 * Deals React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsService } from '@/services/api';
import { toast } from 'sonner';
import type { CreateDealRequest } from '@/types/api';
import { queryConfig, invalidateListQueries } from '@/lib/query-config';

export const dealsKeys = {
  all: ['deals'] as const,
  lists: () => [...dealsKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...dealsKeys.lists(), filters] as const,
  details: () => [...dealsKeys.all, 'detail'] as const,
  detail: (id: string) => [...dealsKeys.details(), id] as const,
  pipeline: () => [...dealsKeys.all, 'pipeline'] as const,
  analytics: () => [...dealsKeys.all, 'analytics'] as const,
};

export function useDeals(params?: {
  pageNumber?: number;
  pageSize?: number;
  stage?: string;
}) {
  return useQuery({
    queryKey: dealsKeys.list(params || {}),
    queryFn: () => dealsService.getDeals(params),
    ...queryConfig.standard,
  });
}

export function useDeal(id: string) {
  return useQuery({
    queryKey: dealsKeys.detail(id),
    queryFn: () => dealsService.getDealById(id),
    enabled: !!id,
    ...queryConfig.detail,
  });
}

export function usePipeline() {
  return useQuery({
    queryKey: dealsKeys.pipeline(),
    queryFn: dealsService.getPipeline,
    ...queryConfig.standard,
  });
}

export function usePipelineAnalytics() {
  return useQuery({
    queryKey: dealsKeys.analytics(),
    queryFn: dealsService.getPipelineAnalytics,
    ...queryConfig.dashboard,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDealRequest) => dealsService.createDeal(data),
    onSuccess: () => {
      invalidateListQueries(queryClient, dealsKeys.all, [['analytics']]);
      toast.success('Deal created successfully');
    },
    onError: () => {
      toast.error('Failed to create deal');
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDealRequest> }) =>
      dealsService.updateDeal(id, data),
    onSuccess: (_, variables) => {
      invalidateListQueries(queryClient, dealsKeys.all);
      queryClient.invalidateQueries({ queryKey: dealsKeys.detail(variables.id), refetchType: 'all' });
      toast.success('Deal updated successfully');
    },
    onError: () => {
      toast.error('Failed to update deal');
    },
  });
}

export function useMoveDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      dealsService.moveDeal(id, stage),
    onSuccess: () => {
      invalidateListQueries(queryClient, dealsKeys.all, [['analytics']]);
      toast.success('Deal moved successfully');
    },
    onError: () => {
      toast.error('Failed to move deal');
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dealsService.deleteDeal(id),
    onSuccess: () => {
      invalidateListQueries(queryClient, dealsKeys.all, [['analytics']]);
      toast.success('Deal deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete deal');
    },
  });
}