/**
 * AI Service
 * Provides access to OpenAI-powered features via the QualiFlow AI API
 * - Lead Qualification (BANT scoring)
 * - Intent Detection
 * - Sentiment Analysis
 * - AI Response Generation
 * - Conversation Analysis
 * - AI Insights Generation
 * - AI Knowledge Generation
 * - AI CRM Enrichment
 */

import { apiClient } from '@/lib/axios';
import type { InsightsRequest, InsightsResult } from '@/types/ai-insights';
import type {
  KnowledgeGenerationRequest,
  KnowledgeArticleResult,
  ExtractFaqsRequest,
  ExtractFaqsResult,
} from '@/types/ai-knowledge';
import type {
  CrmEnrichmentRequest,
  CrmEnrichmentResult,
  ApplyEnrichmentRequest,
  ApplyEnrichmentResponse,
} from '@/types/ai-crm-enrichment';
import type {
  ReportGenerationRequest,
  ReportGenerationResult,
} from '@/types/ai-reports';
import type {
  QuickReplySuggestionRequest,
  QuickReplySuggestionResult,
} from '@/types/ai-quick-replies';
import type {
  OnboardingRecommendationRequest,
  OnboardingRecommendationResult,
} from '@/types/ai-onboarding';

// ============================================================================
// Types
// ============================================================================

export interface QualifyLeadRequest {
  leadId: string;
  conversationId?: string;
  forceRequalify?: boolean;
}

export interface CriterionScore {
  name: string;
  score: number;
  weight: number;
  weightedScore: number;
  evidence?: string;
}

export interface QualifyLeadResponse {
  leadId: string;
  score: number;
  isQualified: boolean;
  reasoning: string;
  criterionScores: CriterionScore[];
  suggestedActions?: string[];
  confidence: number;
  qualifiedAt: string;
  fromCache: boolean;
  tokensUsed: number;
}

export interface ConversationAnalysisResponse {
  conversationId: string;
  leadId?: string;
  primaryIntent: string;
  intentConfidence: number;
  sentiment: string;
  sentimentScore: number;
  keyTopics: string[];
  extractedEntities?: Record<string, string>;
  painPoints?: string[];
  messageCount: number;
  analyzedAt: string;
}

export interface SuggestResponseRequest {
  conversationId: string;
  tone?: 'professional' | 'friendly' | 'formal';
}

export interface SuggestedResponseResult {
  conversationId: string;
  suggestedResponse: string;
  confidence: number;
  tone: string;
  generatedAt: string;
}

export interface IntentDetectionRequest {
  message: string;
  conversationContext?: string[];
}

export interface SecondaryIntent {
  intent: string;
  confidence: number;
}

export interface IntentDetectionResponse {
  primaryIntent: string;
  confidence: number;
  secondaryIntents?: SecondaryIntent[];
  extractedEntities?: Record<string, string>;
  detectedAt: string;
}

export interface SentimentAnalysisRequest {
  message: string;
}

export interface Emotion {
  emotion: string;
  intensity: number;
}

export interface SentimentAnalysisResponse {
  sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
  score: number;
  confidence: number;
  emotions?: Emotion[];
  analyzedAt: string;
}

export interface AICompletionRequest {
  prompt: string;
  systemMessage?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AICompletionResponse {
  content: string;
  generatedAt: string;
  latencyMs: number;
}

export interface AIUsageMetrics {
  businessId: string;
  startDate: string;
  endDate: string;
  totalQualifications: number;
  totalAnalyses: number;
  totalSuggestions: number;
  totalTokensUsed: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  averageLatencyMs: number;
  successRate: number;
}

// Import AI form generation types
import type {
  GenerateFormRequest,
  GenerateFormResponse,
} from '@/types/ai-forms';

// Import AI SMS template generation types
import type {
  GenerateSmsTemplateRequest,
  GenerateSmsTemplateResponse,
} from '@/types/ai-sms-templates';

// ============================================================================
// AI Service
// ============================================================================

export const aiService = {
  /**
   * Qualify a lead using AI-powered BANT analysis.
   * Analyzes conversation history and scores on Budget, Authority, Need, Timeline.
   */
  qualifyLead: async (request: QualifyLeadRequest): Promise<QualifyLeadResponse> => {
    const response = await apiClient.post<QualifyLeadResponse>('/ai/qualify-lead', request);
    return response.data;
  },

  /**
   * Analyze a conversation to extract insights.
   * Returns intent, sentiment, key topics, and extracted entities.
   */
  analyzeConversation: async (conversationId: string): Promise<ConversationAnalysisResponse> => {
    const response = await apiClient.get<ConversationAnalysisResponse>(
      `/ai/analyze-conversation/${conversationId}`
    );
    return response.data;
  },

  /**
   * Generate an AI-powered suggested response for an agent.
   * Analyzes conversation context and generates contextually appropriate response.
   */
  suggestResponse: async (request: SuggestResponseRequest): Promise<SuggestedResponseResult> => {
    const response = await apiClient.post<SuggestedResponseResult>('/ai/suggest-response', request);
    return response.data;
  },

  /**
   * Detect the intent of a message using AI.
   * Returns primary intent, secondary intents, and extracted entities.
   */
  detectIntent: async (request: IntentDetectionRequest): Promise<IntentDetectionResponse> => {
    const response = await apiClient.post<IntentDetectionResponse>('/ai/detect-intent', request);
    return response.data;
  },

  /**
   * Analyze the sentiment of a message using AI.
   * Returns sentiment classification, score, and detected emotions.
   */
  analyzeSentiment: async (request: SentimentAnalysisRequest): Promise<SentimentAnalysisResponse> => {
    const response = await apiClient.post<SentimentAnalysisResponse>('/ai/analyze-sentiment', request);
    return response.data;
  },

  /**
   * Generate a custom AI completion using GPT-4.
   * General-purpose endpoint for custom AI generation needs.
   */
  generateCompletion: async (request: AICompletionRequest): Promise<AICompletionResponse> => {
    const response = await apiClient.post<AICompletionResponse>('/ai/generate', request);
    return response.data;
  },

  /**
   * Get AI usage metrics for the business.
   * Returns token counts, costs, and performance metrics.
   */
  getUsageMetrics: async (startDate?: string, endDate?: string): Promise<AIUsageMetrics> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiClient.get<AIUsageMetrics>(`/ai/usage?${params.toString()}`);
    return response.data;
  },

  /**
   * Generate a form using AI based on the purpose and options.
   * Returns form fields optimized for lead qualification with BANT mapping.
   */
  generateForm: async (request: GenerateFormRequest): Promise<GenerateFormResponse> => {
    const response = await apiClient.post<GenerateFormResponse>('/ai/generate/form', request);
    return response.data;
  },

  /**
   * Generate SMS templates using AI based on purpose and context.
   * Returns multiple template variations optimized for the specified use case.
   */
  generateSmsTemplates: async (request: GenerateSmsTemplateRequest): Promise<GenerateSmsTemplateResponse> => {
    const response = await apiClient.post<GenerateSmsTemplateResponse>('/ai/generate/sms-template', request);
    return response.data;
  },

  /**
   * Get AI-powered dashboard insights.
   * Analyzes lead, conversation, and channel data to generate actionable insights.
   * Results are cached for 1 hour.
   */
  getDashboardInsights: async (): Promise<InsightsResult> => {
    const response = await apiClient.get<InsightsResult>('/ai/analyze/insights/dashboard');
    return response.data;
  },

  /**
   * Generate custom AI insights with specific parameters.
   * Allows filtering by date range, categories, and other options.
   */
  generateInsights: async (request: InsightsRequest): Promise<InsightsResult> => {
    const response = await apiClient.post<InsightsResult>('/ai/analyze/insights', request);
    return response.data;
  },

  /**
   * Refresh dashboard insights by clearing the cache and regenerating.
   * Useful when user wants the latest insights immediately.
   */
  refreshDashboardInsights: async (): Promise<InsightsResult> => {
    const response = await apiClient.post<InsightsResult>('/ai/analyze/insights/refresh');
    return response.data;
  },

  // ============================================================================
  // Knowledge Base Generation
  // ============================================================================

  /**
   * Generate a knowledge base article using AI.
   * Creates article content based on topic and entry type.
   */
  generateKnowledgeArticle: async (
    request: KnowledgeGenerationRequest
  ): Promise<KnowledgeArticleResult> => {
    const response = await apiClient.post<KnowledgeArticleResult>(
      '/ai/generate/knowledge-article',
      request
    );
    return response.data;
  },

  /**
   * Extract FAQs from conversation history using AI analysis.
   * Analyzes recent conversations to identify common questions and generate answers.
   */
  extractFaqsFromConversations: async (
    request: ExtractFaqsRequest
  ): Promise<ExtractFaqsResult> => {
    const response = await apiClient.post<ExtractFaqsResult>(
      '/ai/extract/faqs',
      request
    );
    return response.data;
  },

  // ============================================================================
  // CRM Enrichment
  // ============================================================================

  /**
   * Enrich CRM data by analyzing a conversation.
   * Extracts contact details, company info, and deal signals using AI.
   */
  enrichCrmData: async (request: CrmEnrichmentRequest): Promise<CrmEnrichmentResult> => {
    const response = await apiClient.post<CrmEnrichmentResult>(
      '/ai/enhance/crm-data',
      request
    );
    return response.data;
  },

  /**
   * Apply accepted enrichment suggestions to CRM entities.
   * Updates lead, contact, or deal with the accepted field values.
   */
  applyCrmEnrichment: async (request: ApplyEnrichmentRequest): Promise<ApplyEnrichmentResponse> => {
    const response = await apiClient.post<ApplyEnrichmentResponse>(
      '/ai/enhance/crm-data/apply',
      request
    );
    return response.data;
  },

  // ============================================================================
  // AI Report Generation (Sprint 42 - Story 6.2)
  // ============================================================================

  /**
   * Generate a comprehensive business report using AI.
   * Returns insights, charts, and recommendations based on business data.
   */
  generateReport: async (request: ReportGenerationRequest): Promise<ReportGenerationResult> => {
    const response = await apiClient.post<ReportGenerationResult>(
      '/ai/generate/report',
      request
    );
    return response.data;
  },

  // ============================================================================
  // AI Quick Reply Suggestions (Sprint 43 - Story 8.2)
  // ============================================================================

  /**
   * Generate quick reply suggestions for a conversation.
   * Returns 3-5 contextual reply options with confidence scores.
   * Uses gpt-5-nano for fast response times (<500ms).
   */
  getQuickReplySuggestions: async (request: QuickReplySuggestionRequest): Promise<QuickReplySuggestionResult> => {
    const response = await apiClient.post<QuickReplySuggestionResult>(
      '/ai/enhance/quick-replies',
      request
    );
    return response.data;
  },

  /**
   * Get AI-powered onboarding recommendations
   * Returns personalized channel, workflow, form, and AI configuration recommendations
   * @param request - Business profile information
   * @returns Personalized recommendations for onboarding
   */
  getOnboardingRecommendations: async (
    request: OnboardingRecommendationRequest
  ): Promise<OnboardingRecommendationResult> => {
    // AI generation can take up to 60 seconds, use extended timeout
    const response = await apiClient.post<OnboardingRecommendationResult>(
      '/ai/enhance/onboarding',
      request,
      { timeout: 90000 } // 90 seconds for AI generation
    );
    return response.data;
  },
};

export default aiService;

// Re-export form generation types for convenience
export type { GenerateFormRequest, GenerateFormResponse } from '@/types/ai-forms';

// Re-export SMS template generation types for convenience
export type { GenerateSmsTemplateRequest, GenerateSmsTemplateResponse } from '@/types/ai-sms-templates';

// Re-export insights types for convenience
export type { InsightsRequest, InsightsResult, InsightItem, InsightCategory, InsightSeverity } from '@/types/ai-insights';

// Re-export knowledge generation types for convenience
export type {
  KnowledgeGenerationRequest,
  KnowledgeArticleResult,
  ExtractFaqsRequest,
  ExtractFaqsResult,
  FaqSuggestion,
  KnowledgeEntryType,
} from '@/types/ai-knowledge';

// Re-export CRM enrichment types for convenience
export type {
  CrmEnrichmentRequest,
  CrmEnrichmentResult,
  ApplyEnrichmentRequest,
  ApplyEnrichmentResponse,
  CrmFieldSuggestion,
  BantScores,
} from '@/types/ai-crm-enrichment';

// Re-export report generation types for convenience
export type {
  ReportGenerationRequest,
  ReportGenerationResult,
  ReportType,
  ReportTypeInfo,
  ReportInsight,
  ReportSection,
  ReportMetric,
  ChartData,
  ChartDataPoint,
  ReportRecommendation,
} from '@/types/ai-reports';
export { REPORT_TYPES } from '@/types/ai-reports';

// Re-export quick reply types for convenience
export type {
  QuickReplySuggestionRequest,
  QuickReplySuggestionResult,
  QuickReplySuggestion,
  QuickReplyCategory,
  QuickReplyTone,
  ConversationHistoryItem,
  LeadContext,
} from '@/types/ai-quick-replies';

// Re-export onboarding recommendation types for convenience
export type {
  OnboardingRecommendationRequest,
  OnboardingRecommendationResult,
  ChannelRecommendation,
  WorkflowRecommendation,
  FormRecommendation,
  AIConfigRecommendation,
  AutomationRecommendation,
  BantWeights,
} from '@/types/ai-onboarding';
