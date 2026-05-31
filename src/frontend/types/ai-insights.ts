/**
 * AI Insights Types
 * Types for AI-powered business insights dashboard feature
 * Matches backend DTOs in QualiFlow.Application.Features.AI.DTOs
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * Categories of business insights
 */
export type InsightCategory =
  | 'ConversionTrends'
  | 'TopObjections'
  | 'ChannelPerformance'
  | 'QualificationPatterns'
  | 'ResponseMetrics'
  | 'SentimentTrends'
  | 'ActivityPatterns'
  | 'TeamPerformance';

/**
 * Severity levels for insights
 */
export type InsightSeverity = 'Info' | 'Positive' | 'Warning' | 'Critical';

// ============================================================================
// Request Types
// ============================================================================

/**
 * Request for generating custom AI insights
 */
export interface InsightsRequest {
  /** Start date for the analysis period (ISO string) */
  dateFrom?: string;
  /** End date for the analysis period (ISO string) */
  dateTo?: string;
  /** Specific insight categories to analyze */
  categories?: InsightCategory[];
  /** Maximum number of insights to generate (default: 5) */
  maxInsights?: number;
  /** Whether to include trend analysis (default: true) */
  includeTrends?: boolean;
  /** Whether to include actionable recommendations (default: true) */
  includeRecommendations?: boolean;
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Individual insight item
 */
export interface InsightItem {
  /** The insight category */
  category: InsightCategory;
  /** Short, impactful title */
  title: string;
  /** 2-3 sentence explanation */
  description: string;
  /** Severity level (info, warning, critical, positive) */
  severity: InsightSeverity;
  /** Icon name suggestion for UI */
  icon?: string;
  /** Primary metric value if applicable (e.g., "85%", "12 leads") */
  metricValue?: string;
  /** Metric change percentage if applicable */
  metricChange?: number;
  /** Actionable recommendation */
  recommendation?: string;
  /** Link to related page in the app */
  actionLink?: string;
}

/**
 * Summary metrics for the insights analysis period
 */
export interface InsightsSummaryMetrics {
  periodStart: string;
  periodEnd: string;
  totalLeads: number;
  totalConversations: number;
  conversionRate: number;
  averageLeadScore: number;
  averageResponseTimeMinutes: number;
  topChannel?: string;
}

/**
 * Detected anomaly in the data
 */
export interface AnomalyDetection {
  metric: string;
  description: string;
  isSpike: boolean;
  deviationPercent: number;
}

/**
 * Trend data for week-over-week comparison
 */
export interface InsightsTrendData {
  leadCountChange: number;
  conversionRateChange: number;
  averageScoreChange: number;
  responseTimeChange: number;
  anomalies: AnomalyDetection[];
}

/**
 * Result containing AI-generated business insights
 */
export interface InsightsResult {
  /** Whether the insight generation was successful */
  success: boolean;
  /** Error message if generation failed */
  errorMessage?: string;
  /** Whether the failure was due to usage limits */
  limitExceeded: boolean;
  /** List of generated insights */
  insights: InsightItem[];
  /** Summary metrics for the analysis period */
  summary?: InsightsSummaryMetrics;
  /** Trend data for week-over-week comparison */
  trends?: InsightsTrendData;
  /** Audit ID for feedback tracking */
  auditId?: string;
  /** Number of tokens used */
  tokensUsed: number;
  /** Generation timestamp */
  generatedAt: string;
  /** Cache expiration time */
  cacheExpiresAt?: string;
}

