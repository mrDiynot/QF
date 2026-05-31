/**
 * Forms React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formsService } from '@/services/api';
import { toast } from 'sonner';
import type { CreateFormRequest } from '@/types/api';
import { queryConfig, invalidateListQueries } from '@/lib/query-config';

export const formsKeys = {
  all: ['forms'] as const,
  lists: () => [...formsKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...formsKeys.lists(), filters] as const,
  details: () => [...formsKeys.all, 'detail'] as const,
  detail: (id: string) => [...formsKeys.details(), id] as const,
  submissions: (id: string) => [...formsKeys.detail(id), 'submissions'] as const,
};

export function useForms(params?: {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: formsKeys.list(params || {}),
    queryFn: () => formsService.getForms(params),
    ...queryConfig.standard,
  });
}

export function useForm(id: string) {
  return useQuery({
    queryKey: formsKeys.detail(id),
    queryFn: () => formsService.getFormById(id),
    enabled: !!id,
    ...queryConfig.detail,
  });
}

export function useFormSubmissions(formId: string, params?: {
  pageNumber?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: formsKeys.submissions(formId),
    queryFn: () => formsService.getFormSubmissions(formId, params),
    enabled: !!formId,
    ...queryConfig.realtime, // Form submissions can come in frequently
  });
}

export function useCreateForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFormRequest) => formsService.createForm(data),
    onSuccess: () => {
      invalidateListQueries(queryClient, formsKeys.all, [['ai-readiness'], ['analytics']]);
      toast.success('Form created successfully');
    },
    onError: () => {
      toast.error('Failed to create form');
    },
  });
}

export function useUpdateForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateFormRequest> }) =>
      formsService.updateForm(id, data),
    onSuccess: (_, variables) => {
      invalidateListQueries(queryClient, formsKeys.all);
      queryClient.invalidateQueries({ queryKey: formsKeys.detail(variables.id), refetchType: 'all' });
      toast.success('Form updated successfully');
    },
    onError: () => {
      toast.error('Failed to update form');
    },
  });
}

export function usePublishForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => formsService.publishForm(id),
    onSuccess: (_, id) => {
      invalidateListQueries(queryClient, formsKeys.all, [['ai-readiness']]);
      queryClient.invalidateQueries({ queryKey: formsKeys.detail(id), refetchType: 'all' });
      toast.success('Form published successfully');
    },
    onError: () => {
      toast.error('Failed to publish form');
    },
  });
}

export function useDeleteForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => formsService.deleteForm(id),
    onSuccess: () => {
      invalidateListQueries(queryClient, formsKeys.all, [['ai-readiness'], ['analytics']]);
      toast.success('Form deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete form');
    },
  });
}