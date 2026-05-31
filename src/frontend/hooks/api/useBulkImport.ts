/**
 * Bulk Import React Query Hooks
 * Sprint 37 Feature
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  bulkImportService,
} from '@/services/api/bulk-import.service';
import { leadsKeys } from './useLeads';
import { contactsKeys } from './useContacts';
import { analyticsKeys } from './useAnalytics';

export const bulkImportKeys = {
  all: ['bulk-import'] as const,
};

export function useImportLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      skipDuplicates = true,
      updateExisting = false,
    }: {
      file: File;
      skipDuplicates?: boolean;
      updateExisting?: boolean;
    }) => bulkImportService.importLeads(file, skipDuplicates, updateExisting),
    onSuccess: () => {
      // Remove cached leads data completely to force fresh fetch on next mount
      queryClient.removeQueries({ queryKey: leadsKeys.all });
      // Then invalidate to trigger refetch for any active queries
      queryClient.invalidateQueries({ queryKey: leadsKeys.all, refetchType: 'all' });
      // Invalidate dashboard/analytics metrics that show lead counts
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all, refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['ai-readiness'], refetchType: 'all' });
    },
  });
}

export function useImportContacts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      skipDuplicates = true,
      updateExisting = false,
    }: {
      file: File;
      skipDuplicates?: boolean;
      updateExisting?: boolean;
    }) => bulkImportService.importContacts(file, skipDuplicates, updateExisting),
    onSuccess: () => {
      // Remove cached contacts data completely to force fresh fetch on next mount
      queryClient.removeQueries({ queryKey: contactsKeys.all });
      // Then invalidate to trigger refetch for any active queries
      queryClient.invalidateQueries({ queryKey: contactsKeys.all, refetchType: 'all' });
      // Invalidate dashboard/analytics metrics that show contact counts
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all, refetchType: 'all' });
    },
  });
}

export function useValidateCsv() {
  return useMutation({
    mutationFn: ({ file, entityType = 'leads' }: { file: File; entityType?: string }) => 
      bulkImportService.validateCsv(file, entityType),
  });
}

export function useDownloadLeadTemplate() {
  return useMutation({
    mutationFn: () => bulkImportService.downloadLeadTemplate(),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'leads_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}

export function useDownloadContactTemplate() {
  return useMutation({
    mutationFn: () => bulkImportService.downloadContactTemplate(),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'contacts_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}
