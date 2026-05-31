/**
 * Reports & ROI React Query Hooks
 * Sprint 37 Feature
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { reportsService, type GenerateReportRequest, type ExportReportRequest } from '@/services/api/reports.service';
import { queryConfig } from '@/lib/query-config';

export const reportsKeys = {
  all: ['reports'] as const,
  roi: (from?: string, to?: string) => [...reportsKeys.all, 'roi', { from, to }] as const,
  revenue: (from?: string, to?: string, groupBy?: string) => [...reportsKeys.all, 'revenue', { from, to, groupBy }] as const,
  templates: () => [...reportsKeys.all, 'templates'] as const,
};

export function useRoiMetrics(from?: string, to?: string) {
  return useQuery({
    queryKey: reportsKeys.roi(from, to),
    queryFn: () => reportsService.getRoiMetrics(from, to),
    ...queryConfig.dashboard, // Reports need dashboard-style refresh
  });
}

export function useRevenueTracking(from?: string, to?: string, groupBy: string = 'day') {
  return useQuery({
    queryKey: reportsKeys.revenue(from, to, groupBy),
    queryFn: () => reportsService.getRevenueTracking(from, to, groupBy),
    ...queryConfig.dashboard,
  });
}

export function useReportTemplates() {
  return useQuery({
    queryKey: reportsKeys.templates(),
    queryFn: reportsService.getReportTemplates,
    ...queryConfig.static, // Templates rarely change
  });
}

export function useGenerateReport() {
  return useMutation({
    mutationFn: (request: GenerateReportRequest) => reportsService.generateReport(request),
  });
}

export function useExportToExcel() {
  return useMutation({
    mutationFn: (request: ExportReportRequest) => reportsService.exportToExcel(request),
  });
}

export function useExportToCsv() {
  return useMutation({
    mutationFn: (request: ExportReportRequest) => reportsService.exportToCsv(request),
  });
}
