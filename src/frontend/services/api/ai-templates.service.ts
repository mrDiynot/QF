/**
 * AI Response Templates API Service
 * Handles CRUD operations for AI response templates
 * Sprint 36 Feature
 */

import { apiClient } from '@/lib/axios';

// ============================================================================
// Types
// ============================================================================

export interface AiResponseTemplateDto {
  id: string;
  name: string;
  description?: string;
  category: string;
  prompt: string;
  variables: string[];
  tone: string;
  maxTokens: number;
  isActive: boolean;
  sortOrder: number;
  usageCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAiResponseTemplateRequest {
  name: string;
  description?: string;
  category: string;
  prompt: string;
  variables?: string[];
  tone?: string;
  maxTokens?: number;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateAiResponseTemplateRequest {
  name?: string;
  description?: string;
  category?: string;
  prompt?: string;
  variables?: string[];
  tone?: string;
  maxTokens?: number;
  isActive?: boolean;
  sortOrder?: number;
}

export interface GenerateFromTemplateRequest {
  variables: Record<string, string>;
}

export interface GenerateFromTemplateResponse {
  templateId: string;
  templateName: string;
  generatedContent: string;
  tokensUsed: number;
  generatedAt: string;
}

// ============================================================================
// Service
// ============================================================================

export const aiTemplatesService = {
  /**
   * Get all AI response templates for the current business
   * GET /api/v1/ai-response-templates
   */
  getAll: async (): Promise<AiResponseTemplateDto[]> => {
    const response = await apiClient.get<AiResponseTemplateDto[]>('/ai-response-templates');
    return response.data;
  },

  /**
   * Get all available template categories
   * GET /api/v1/ai-response-templates/categories
   */
  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/ai-response-templates/categories');
    return response.data;
  },

  /**
   * Get a specific template by ID
   * GET /api/v1/ai-response-templates/:id
   */
  getById: async (id: string): Promise<AiResponseTemplateDto> => {
    const response = await apiClient.get<AiResponseTemplateDto>(`/ai-response-templates/${id}`);
    return response.data;
  },

  /**
   * Create a new AI response template
   * POST /api/v1/ai-response-templates
   */
  create: async (request: CreateAiResponseTemplateRequest): Promise<AiResponseTemplateDto> => {
    const response = await apiClient.post<AiResponseTemplateDto>('/ai-response-templates', request);
    return response.data;
  },

  /**
   * Update an existing template
   * PUT /api/v1/ai-response-templates/:id
   */
  update: async (id: string, request: UpdateAiResponseTemplateRequest): Promise<AiResponseTemplateDto> => {
    const response = await apiClient.put<AiResponseTemplateDto>(`/ai-response-templates/${id}`, request);
    return response.data;
  },

  /**
   * Delete a template (soft delete)
   * DELETE /api/v1/ai-response-templates/:id
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/ai-response-templates/${id}`);
  },

  /**
   * Generate a response using a template
   * POST /api/v1/ai-response-templates/:id/generate
   */
  generate: async (id: string, request: GenerateFromTemplateRequest): Promise<GenerateFromTemplateResponse> => {
    const response = await apiClient.post<GenerateFromTemplateResponse>(
      `/ai-response-templates/${id}/generate`,
      request
    );
    return response.data;
  },
};

export default aiTemplatesService;
