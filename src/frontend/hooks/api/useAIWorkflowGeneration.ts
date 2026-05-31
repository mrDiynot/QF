/**
 * AI Workflow Generation Hooks
 * React Query hooks for AI-powered workflow generation
 */

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  aiWorkflowService,
  WorkflowGenerationRequest,
  WorkflowGenerationResult,
  SaveWorkflowResponse,
} from '@/services/api/ai-workflow.service';

/**
 * Hook for generating workflows using AI
 */
export function useAIWorkflowGeneration() {
  return useMutation<WorkflowGenerationResult, Error, WorkflowGenerationRequest>({
    mutationFn: (request) => aiWorkflowService.generateWorkflow(request),
    onError: (error) => {
      console.error('Failed to generate workflow:', error);
      toast.error('Failed to generate workflow. Please try again.');
    },
  });
}

/**
 * Hook for saving a generated workflow
 */
export function useSaveGeneratedWorkflow() {
  return useMutation<SaveWorkflowResponse, Error, WorkflowGenerationResult>({
    mutationFn: (workflow) => aiWorkflowService.saveWorkflow(workflow),
    onSuccess: () => {
      toast.success('Workflow saved successfully!');
    },
    onError: (error) => {
      console.error('Failed to save workflow:', error);
      toast.error('Failed to save workflow. Please try again.');
    },
  });
}

// Re-export types for convenience
export type {
  WorkflowGenerationRequest,
  WorkflowGenerationResult,
  WorkflowStepDto,
  WorkflowTriggerDto,
  WorkflowBranchDto,
  SaveWorkflowResponse,
} from '@/services/api/ai-workflow.service';

