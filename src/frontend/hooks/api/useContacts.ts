/**
 * Contacts React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsService } from '@/services/api';
import { toast } from 'sonner';
import type { CreateContactRequest } from '@/types/api';
import { queryConfig, invalidateListQueries } from '@/lib/query-config';

export const contactsKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactsKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...contactsKeys.lists(), filters] as const,
  details: () => [...contactsKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactsKeys.details(), id] as const,
  count: () => [...contactsKeys.all, 'count'] as const,
};

export function useContacts(params?: {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: contactsKeys.list(params || {}),
    queryFn: () => contactsService.getContacts(params),
    ...queryConfig.realtime,
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: contactsKeys.detail(id),
    queryFn: () => contactsService.getContactById(id),
    enabled: !!id,
    ...queryConfig.detail,
  });
}

export function useContactCount() {
  return useQuery({
    queryKey: contactsKeys.count(),
    queryFn: contactsService.getContactCount,
    ...queryConfig.realtime,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContactRequest) => contactsService.createContact(data),
    onSuccess: () => {
      invalidateListQueries(queryClient, contactsKeys.all, [['analytics']]);
      toast.success('Contact created successfully');
    },
    onError: () => {
      toast.error('Failed to create contact');
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateContactRequest> }) =>
      contactsService.updateContact(id, data),
    onSuccess: (_, variables) => {
      invalidateListQueries(queryClient, contactsKeys.all);
      queryClient.invalidateQueries({ queryKey: contactsKeys.detail(variables.id), refetchType: 'all' });
      toast.success('Contact updated successfully');
    },
    onError: () => {
      toast.error('Failed to update contact');
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contactsService.deleteContact(id),
    onSuccess: () => {
      invalidateListQueries(queryClient, contactsKeys.all, [['analytics']]);
      toast.success('Contact deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete contact');
    },
  });
}