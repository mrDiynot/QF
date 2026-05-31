'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { adminAuditLogService } from '@/services/api/admin.service';
import { useAdminAnalytics, AdminEvents } from './useAdminAnalytics';
import type { AdminAuditLogQuery } from '@/types/admin';
import { queryConfig } from '@/lib/query-config';

export function useAdminAuditLogs(query: AdminAuditLogQuery) {
  const { track } = useAdminAnalytics();

  return useQuery({
    queryKey: ['admin', 'audit-logs', query],
    queryFn: async () => {
      track(AdminEvents.ADMIN_AUDIT_LOGS_VIEWED, {
        filters: {
          action: query.action,
          entityType: query.entityType,
          startDate: query.startDate,
          endDate: query.endDate,
        },
      });
      return adminAuditLogService.getAuditLogs(query);
    },
    ...queryConfig.standard,
  });
}

export function useAdminAuditLog(logId: string) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', logId],
    queryFn: () => adminAuditLogService.getAuditLog(logId),
    enabled: !!logId,
    ...queryConfig.detail,
  });
}

export function useEntityAuditLogs(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', 'entity', entityType, entityId],
    queryFn: () => adminAuditLogService.getEntityAuditLogs(entityType, entityId),
    enabled: !!entityType && !!entityId,
    ...queryConfig.standard,
  });
}

export function useExportAuditLogs() {
  const { track, trackAdminError } = useAdminAnalytics();

  return useMutation({
    mutationFn: async (query: AdminAuditLogQuery) => {
      track(AdminEvents.ADMIN_DATA_EXPORTED, {
        export_type: 'audit_logs',
        date_range: {
          start: query.startDate,
          end: query.endDate,
        },
      });
      const blob = await adminAuditLogService.exportAuditLogs(query);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return blob;
    },
    onError: (error) => {
      trackAdminError(error instanceof Error ? error : new Error('Export failed'), {
        action: 'export_audit_logs',
      });
    },
  });
}

