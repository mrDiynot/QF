import { apiClient } from '@/lib/axios';

// ============================================================================
// ROI Calculator Types
// ============================================================================

export interface RoiMetrics {
  totalLeads: number;
  qualifiedLeads: number;
  wonDeals: number;
  totalRevenue: number;
  totalCost: number;
  costPerLead: number;
  conversionRate: number;
  roi: number;
  periodStart: string;
  periodEnd: string;
}

// ============================================================================
// Revenue Tracking Types
// ============================================================================

export interface RevenueDataPoint {
  period: string;
  revenue: number;
  dealCount: number;
}

export interface RevenueTrackingResponse {
  totalRevenue: number;
  wonDeals: number;
  averageDealSize: number;
  pipelineValue: number;
  dataPoints: RevenueDataPoint[];
  periodStart: string;
  periodEnd: string;
}

// ============================================================================
// Custom Reports Types
// ============================================================================

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface GenerateReportRequest {
  templateId: string;
  from?: string;
  to?: string;
  filters?: Record<string, string>;
}

export interface CustomReportResult {
  title: string;
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
  summary: Record<string, unknown>;
  data: Record<string, unknown>;
}

export interface ExportReportRequest {
  reportType: string;
  from?: string;
  to?: string;
}

// ============================================================================
// Reports Service
// ============================================================================

export const reportsService = {
  // ROI Calculator
  getRoiMetrics: async (from?: string, to?: string): Promise<RoiMetrics> => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const { data } = await apiClient.get<RoiMetrics>(`/reports/roi?${params}`);
    return data;
  },

  // Revenue Tracking
  getRevenueTracking: async (
    from?: string,
    to?: string,
    groupBy: string = 'day'
  ): Promise<RevenueTrackingResponse> => {
    const params = new URLSearchParams({ groupBy });
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const { data } = await apiClient.get<RevenueTrackingResponse>(`/reports/revenue?${params}`);
    return data;
  },

  // Custom Reports
  getReportTemplates: async (): Promise<ReportTemplate[]> => {
    const { data } = await apiClient.get<ReportTemplate[]>('/reports/templates');
    return data;
  },

  generateReport: async (request: GenerateReportRequest): Promise<CustomReportResult> => {
    const { data } = await apiClient.post<CustomReportResult>('/reports/generate', request);
    return data;
  },

  // Export
  exportToExcel: async (request: ExportReportRequest): Promise<Blob> => {
    const { data } = await apiClient.post('/reports/export/excel', request, {
      responseType: 'blob',
    });
    return data;
  },

  exportToCsv: async (request: ExportReportRequest): Promise<Blob> => {
    const { data } = await apiClient.post('/reports/export/csv', request, {
      responseType: 'blob',
    });
    return data;
  },
};

export default reportsService;
