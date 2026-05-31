/**
 * Auto-Assignment Rules React Query Hooks
 * Sprint 37 Feature
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  autoAssignmentService,
  type CreateAutoAssignmentRuleRequest,
  type UpdateAutoAssignmentRuleRequest,
  type ReorderRulesRequest,
} from '@/services/api/auto-assignment.service';
import { queryConfig, invalidateListQueries } from '@/lib/query-config';

export const autoAssignmentKeys = {
  all: ['auto-assignment'] as const,
  list: () => [...autoAssignmentKeys.all, 'list'] as const,
  detail: (id: string) => [...autoAssignmentKeys.all, 'detail', id] as const,
};

export function useAutoAssignmentRules() {
  return useQuery({
    queryKey: autoAssignmentKeys.list(),
    queryFn: autoAssignmentService.getRules,
    ...queryConfig.standard,
  });
}

export function useAutoAssignmentRule(id: string) {
  return useQuery({
    queryKey: autoAssignmentKeys.detail(id),
    queryFn: () => autoAssignmentService.getRule(id),
    enabled: !!id,
    ...queryConfig.detail,
  });
}

export function useCreateAutoAssignmentRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateAutoAssignmentRuleRequest) =>
      autoAssignmentService.createRule(request),
    onSuccess: () => {
      invalidateListQueries(queryClient, autoAssignmentKeys.all);
    },
  });
}

export function useUpdateAutoAssignmentRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateAutoAssignmentRuleRequest }) =>
      autoAssignmentService.updateRule(id, request),
    onSuccess: () => {
      invalidateListQueries(queryClient, autoAssignmentKeys.all);
    },
  });
}

export function useDeleteAutoAssignmentRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => autoAssignmentService.deleteRule(id),
    onSuccess: () => {
      invalidateListQueries(queryClient, autoAssignmentKeys.all);
    },
  });
}

export function useReorderAutoAssignmentRules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ReorderRulesRequest) => autoAssignmentService.reorderRules(request),
    onSuccess: () => {
      invalidateListQueries(queryClient, autoAssignmentKeys.all);
    },
  });
}
