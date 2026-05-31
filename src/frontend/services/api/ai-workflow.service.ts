/**
 * AI Workflow Generation Service
 * Provides API integration for AI-powered workflow generation
 */

import { apiClient } from '@/lib/axios';

// ============================================================================
// Request/Response Types
// ============================================================================

export interface WorkflowGenerationRequest {
  goalDescription: string;
  triggerType: string;
  desiredActions?: string[];
  category?: string;
  includeDelays?: boolean;
  includeBranches?: boolean;
  maxSteps?: number;
}

export interface WorkflowTriggerDto {
  type: string;
  description: string;
  conditions?: Record<string, unknown>;
}

export interface WorkflowBranchDto {
  condition: string;
  nextStepId: string;
}

export interface WorkflowStepDto {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  config?: Record<string, unknown>;
  nextStepId?: string;
  branches?: WorkflowBranchDto[];
}

export interface WorkflowGenerationResult {
  success: boolean;
  errorMessage?: string;
  limitExceeded?: boolean;
  name: string;
  description: string;
  category: string;
  trigger: WorkflowTriggerDto;
  steps: WorkflowStepDto[];
  estimatedTimeMinutes: number;
  auditId?: string;
  tokensUsed: number;
  generatedAt: string;
}

export interface SaveWorkflowResponse {
  workflowId: string;
}

// ============================================================================
// API Service
// ============================================================================

const AI_WORKFLOW_API_BASE = '/api/v1/ai/workflow';

export const aiWorkflowService = {
  /**
   * Generate a workflow definition using AI
   */
  async generateWorkflow(request: WorkflowGenerationRequest): Promise<WorkflowGenerationResult> {
    const response = await apiClient.post<WorkflowGenerationResult>(
      `${AI_WORKFLOW_API_BASE}/generate`,
      request
    );
    return response.data;
  },

  /**
   * Save a generated workflow to the business's workflow library
   */
  async saveWorkflow(workflow: WorkflowGenerationResult): Promise<SaveWorkflowResponse> {
    const response = await apiClient.post<SaveWorkflowResponse>(
      `${AI_WORKFLOW_API_BASE}/save`,
      workflow
    );
    return response.data;
  },
};

export default aiWorkflowService;

