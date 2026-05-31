/**
 * AI Report Generation Types
 * TypeScript types for AI-powered business report generation
 */

/** Types of reports that can be generated */
export type ReportType =
  | 'LeadPerformance'
  | 'ConversionAnalysis'
  | 'ChannelEffectiveness'
  | 'RoiSummary'
  | 'AiUsageAnalysis'
  | 'TeamPerformance'
  | 'Custom';

/** Report type metadata with descriptions */
export interface ReportTypeInfo {
  value: ReportType;
  label: string;
  description: string;
  icon: string;
}

/** Available report types with descriptions */
export const REPORT_TYPES: ReportTypeInfo[] = [
  {
    value: 'LeadPerformance',
    label: 'Lead Performance',
    description: 'Analyze lead qualification and conversion metrics',
    icon: 'Target',
  },
  {
    value: 'ConversionAnalysis',
    label: 'Conversion Analysis',
    description: 'Funnel progression and conversion rate analysis',
    icon: 'TrendingUp',
  },
  {
    value: 'ChannelEffectiveness',
    label: 'Channel Effectiveness',
    description: 'Compare channel performance and ROI',
    icon: 'BarChart',
  },
  {
    value: 'RoiSummary',
    label: 'ROI Summary',
    description: 'Revenue, costs, and return on investment',
    icon: 'DollarSign',
  },
  {
    value: 'AiUsageAnalysis',
    label: 'AI Usage Analysis',
    description: 'AI feature usage, tokens, and costs',
    icon: 'Brain',
  },
  {
    value: 'TeamPerformance',
    label: 'Team Performance',
    description: 'Team member productivity and metrics',
    icon: 'Users',
  },
  {
    value: 'Custom',
    label: 'Custom Report',
    description: 'Generate a custom report with specific metrics',
    icon: 'Settings',
  },
];

/** Request to generate a report using AI */
export interface ReportGenerationRequest {
  /** Type of report to generate */
  reportType: ReportType;
  /** Start date for the report period */
  dateFrom: string; // ISO date string
  /** End date for the report period */
  dateTo: string; // ISO date string
  /** Optional filters (e.g., channel, status) */
  filters?: Record<string, string>;
  /** Custom metrics to include (for Custom report type) */
  customMetrics?: string[];
  /** Whether to include trend analysis */
  includeTrends?: boolean;
  /** Whether to include AI recommendations */
  includeRecommendations?: boolean;
}

/** Date range for a report */
export interface ReportDateRange {
  from: string;
  to: string;
}

/** A key insight from the report */
export interface ReportInsight {
  title: string;
  description: string;
  icon: string;
  trend: string; // 'up', 'down', 'neutral'
}

/** A metric within a report section */
export interface ReportMetric {
  name: string;
  value: string;
  change?: string;
  changeType?: string; // 'positive', 'negative', 'neutral'
}

/** A section of the report */
export interface ReportSection {
  title: string;
  description: string;
  metrics: ReportMetric[];
}

/** A data point in a chart */
export interface ChartDataPoint {
  label: string;
  value: number;
}

/** Chart data for visualization */
export interface ChartData {
  title: string;
  type: string; // 'bar', 'line', 'pie', etc.
  data: ChartDataPoint[];
}

/** An AI-generated recommendation */
export interface ReportRecommendation {
  title: string;
  description: string;
  priority: string; // 'high', 'medium', 'low'
  category: string;
}

/** Result of AI report generation */
export interface ReportGenerationResult {
  success: boolean;
  errorMessage?: string;
  limitExceeded: boolean;
  title: string;
  reportType: ReportType;
  dateRange?: ReportDateRange;
  executiveSummary: string;
  keyInsights: ReportInsight[];
  sections: ReportSection[];
  charts: ChartData[];
  recommendations: ReportRecommendation[];
  auditId?: string;
  tokensUsed: number;
  generatedAt: string;
}

