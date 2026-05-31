/**
 * React Query hooks for Bulk Operations API
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bulkOperationsService } from '@/services/api/bulk-operations.service';
import { leadsKeys } from './useLeads';
import { contactsKeys } from './useContacts';
import { invalidateListQueries } from '@/lib/query-config';

// Bulk delete leads
export function useBulkDeleteLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkOperationsService.bulkDeleteLeads(ids),
    onSuccess: () => {
      invalidateListQueries(queryClient, leadsKeys.all, [['analytics']]);
    },
  });
}

// Bulk update lead status
export function useBulkUpdateLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: string }) =>
      bulkOperationsService.bulkUpdateLeadStatus(ids, status),
    onSuccess: () => {
      invalidateListQueries(queryClient, leadsKeys.all, [['analytics']]);
    },
  });
}

// Bulk assign leads
export function useBulkAssignLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, assigneeId }: { ids: string[]; assigneeId: string }) =>
      bulkOperationsService.bulkAssignLeads(ids, assigneeId),
    onSuccess: () => {
      invalidateListQueries(queryClient, leadsKeys.all);
    },
  });
}

// Bulk delete contacts
export function useBulkDeleteContacts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkOperationsService.bulkDeleteContacts(ids),
    onSuccess: () => {
      invalidateListQueries(queryClient, contactsKeys.all, [['analytics']]);
    },
  });
}

// Bulk tag contacts
export function useBulkTagContacts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, tags }: { ids: string[]; tags: string[] }) =>
      bulkOperationsService.bulkTagContacts(ids, tags),
    onSuccess: () => {
      invalidateListQueries(queryClient, contactsKeys.all);
    },
  });
}
