/**
 * Forms React Query hooks
 * Provides hooks for form management with caching
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { formsService } from '@/services/api/forms.service';
import { handleApiError } from '@/lib/axios';
import type { Form, CreateFormRequest } from '@/types/api';
import { queryConfig, invalidateListQueries } from '@/lib/query-config';

/** Query key factory for forms */
export const formKeys = {
  all: ['forms'] as const,
  lists: () => [...formKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...formKeys.lists(), filters] as const,
  details: () => [...formKeys.all, 'detail'] as const,
  detail: (id: string) => [...formKeys.details(), id] as const,
  submissions: (formId: string) => [...formKeys.all, 'submissions', formId] as const,
};

/**
 * Hook to fetch all forms with pagination
 */
export const useForms = (params?: {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: formKeys.list(params || {}),
    queryFn: () => formsService.getForms(params),
    ...queryConfig.standard,
    staleTime: 60 * 1000, // Override: 1 minute - prevent auto-refetch from overriding optimistic updates
    refetchOnWindowFocus: false, // Don't refetch on focus during edits
  });
};

/**
 * Hook to fetch a single form by ID
 */
export const useForm = (id: string) => {
  return useQuery({
    queryKey: formKeys.detail(id),
    queryFn: () => formsService.getFormById(id),
    enabled: !!id,
    ...queryConfig.detail,
  });
};

/**
 * Hook to fetch form by slug (for public forms)
 */
export const useFormBySlug = (slug: string) => {
  return useQuery({
    queryKey: [...formKeys.all, 'slug', slug],
    queryFn: () => formsService.getFormBySlug(slug),
    enabled: !!slug,
    ...queryConfig.static, // Public form data rarely changes
  });
};

/**
 * Hook to create a form
 */
export const useCreateForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFormRequest) => formsService.createForm(data),
    onSuccess: () => {
      toast.success('Form created successfully');
      invalidateListQueries(queryClient, formKeys.lists());
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to update a form
 */
export const useUpdateForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Form> }) =>
      formsService.updateForm(id, data),
    onSuccess: (_, variables) => {
      toast.success('Form updated');
      queryClient.invalidateQueries({ queryKey: formKeys.detail(variables.id), refetchType: 'all' });
      invalidateListQueries(queryClient, formKeys.lists());
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to delete a form
 */
export const useDeleteForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => formsService.deleteForm(id),
    onSuccess: (_data, deletedId) => {
      toast.success('Form deleted successfully');
      // Manually update the cache to remove the deleted form
      queryClient.setQueriesData<{ items?: Form[]; totalCount?: number }>(
        { queryKey: formKeys.lists() },
        (oldData) => {
          if (!oldData?.items) return oldData;
          return {
            ...oldData,
            items: oldData.items.filter((form) => form.id !== deletedId),
            totalCount: Math.max((oldData.totalCount || oldData.items.length) - 1, 0),
          };
        }
      );
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to publish a form
 */
export const usePublishForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => formsService.publishForm(id),
    onSuccess: (updatedForm) => {
      toast.success('Form published successfully!');
      // Manually update the cache with the published form
      queryClient.setQueriesData<{ items?: Form[] }>(
        { queryKey: formKeys.lists() },
        (oldData) => {
          if (!oldData?.items) return oldData;
          return {
            ...oldData,
            items: oldData.items.map((form) =>
              form.id === updatedForm.id ? { ...form, status: updatedForm.status, isActive: true } : form
            ),
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: formKeys.detail(updatedForm.id) });
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to fetch form submissions
 */
export const useFormSubmissions = (formId: string, params?: {
  pageNumber?: number;
  pageSize?: number;
}) => {
  return useQuery({
    queryKey: formKeys.submissions(formId),
    queryFn: () => formsService.getFormSubmissions(formId, params),
    enabled: !!formId,
    ...queryConfig.realtime, // Submissions need real-time updates
  });
};

/**
 * Hook to submit a form (public)
 */
export const useSubmitForm = () => {
  return useMutation({
    mutationFn: ({ formId, data }: { formId: string; data: Record<string, unknown> }) =>
      formsService.submitForm(formId, data),
    onSuccess: () => {
      toast.success('Form submitted successfully!');
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

