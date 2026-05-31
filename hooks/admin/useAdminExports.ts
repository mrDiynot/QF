'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { adminExportService, ExportRequest } from '@/services/api/admin.service';
import { queryConfig } from '@/lib/query-config';

export function useExportOptions() {
  return useQuery({
    queryKey: ['admin', 'export', 'options'],
    queryFn: () => adminExportService.getOptions(),
    ...queryConfig.static, // Export options rarely change
    staleTime: Infinity, // Override to never stale
  });
}

export function useExportBusinesses() {
  return useMutation({
    mutationFn: (request: ExportRequest) => adminExportService.exportBusinesses(request),
    onSuccess: (blob, variables) => {
      downloadBlob(blob, `businesses-export.${variables.format}`);
    },
  });
}

export function useExportUsers() {
  return useMutation({
    mutationFn: (request: ExportRequest) => adminExportService.exportUsers(request),
    onSuccess: (blob, variables) => {
      downloadBlob(blob, `users-export.${variables.format}`);
    },
  });
}

export function useExportSubscriptions() {
  return useMutation({
    mutationFn: (request: ExportRequest) => adminExportService.exportSubscriptions(request),
    onSuccess: (blob, variables) => {
      downloadBlob(blob, `subscriptions-export.${variables.format}`);
    },
  });
}

export function useExportAIUsage() {
  return useMutation({
    mutationFn: (request: ExportRequest) => adminExportService.exportAIUsage(request),
    onSuccess: (blob, variables) => {
      downloadBlob(blob, `ai-usage-export.${variables.format}`);
    },
  });
}

// Helper to download blob as file
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
