'use client';

/**
 * Workflow React Query Hooks
 * Provides hooks for workflow management and execution
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowsService, type CreateWorkflowRequest } from '@/services/api/workflows.service';
import { toast } from 'sonner';
import { queryConfig, invalidateListQueries } from '@/lib/query-config';

// Query keys
export const workflowKeys = {
  all: ['workflows'] as const,
  lists: () => [...workflowKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...workflowKeys.lists(), filters] as const,
  details: () => [...workflowKeys.all, 'detail'] as const,
  detail: (id: string) => [...workflowKeys.details(), id] as const,
  executions: (id: string) => [...workflowKeys.detail(id), 'executions'] as const,
  definitions: () => [...workflowKeys.all, 'definitions'] as const,
};

/**
 * Fetch all workflows
 */
export function useWorkflows() {
  return useQuery({
    queryKey: workflowKeys.lists(),
    queryFn: () => workflowsService.getWorkflows(),
    ...queryConfig.standard,
  });
}

/**
 * Fetch a single workflow by ID
 */
export function useWorkflow(id: string) {
  return useQuery({
    queryKey: workflowKeys.detail(id),
    queryFn: () => workflowsService.getWorkflowById(id),
    enabled: !!id,
    ...queryConfig.detail,
  });
}

/**
 * Fetch workflow definitions (templates)
 */
export function useWorkflowDefinitions() {
  return useQuery({
    queryKey: workflowKeys.definitions(),
    queryFn: () => workflowsService.getDefinitions(),
    ...queryConfig.static, // Definitions rarely change
  });
}

/**
 * Fetch workflow executions
 */
export function useWorkflowExecutions(workflowId: string, options?: { pageNumber?: number; pageSize?: number }) {
  return useQuery({
    queryKey: [...workflowKeys.executions(workflowId), options],
    queryFn: () => workflowsService.getExecutions(workflowId, options),
    enabled: !!workflowId,
    ...queryConfig.realtime,
    refetchInterval: 5000, // Poll for updates
  });
}

/**
 * Create a new workflow
 */
export function useCreateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkflowRequest) => workflowsService.createWorkflow(data),
    onSuccess: (newWorkflow) => {
      invalidateListQueries(queryClient, workflowKeys.lists());
      toast.success(`Workflow "${newWorkflow.name}" created`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create workflow: ${error.message}`);
    },
  });
}

/**
 * Update an existing workflow
 */
export function useUpdateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateWorkflowRequest> }) =>
      workflowsService.updateWorkflow(id, data),
    onSuccess: (updatedWorkflow) => {
      invalidateListQueries(queryClient, workflowKeys.lists());
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(updatedWorkflow.id), refetchType: 'all' });
      toast.success('Workflow updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update workflow: ${error.message}`);
    },
  });
}

/**
 * Delete a workflow
 */
export function useDeleteWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workflowsService.deleteWorkflow(id),
    onSuccess: () => {
      invalidateListQueries(queryClient, workflowKeys.lists());
      toast.success('Workflow deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete workflow: ${error.message}`);
    },
  });
}

/**
 * Toggle workflow active state
 */
export function useToggleWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      workflowsService.toggleActive(id, isActive),
    onSuccess: (workflow) => {
      invalidateListQueries(queryClient, workflowKeys.lists());
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(workflow.id), refetchType: 'all' });
      toast.success(workflow.isActive ? 'Workflow activated' : 'Workflow paused');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update workflow: ${error.message}`);
    },
  });
}

/**
 * Test a workflow
 */
export function useTestWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, testData }: { id: string; testData?: Record<string, unknown> }) =>
      workflowsService.testWorkflow(id, testData),
    onSuccess: (execution, { id }) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.executions(id) });
      toast.success('Workflow test started');
    },
    onError: (error: Error) => {
      toast.error(`Failed to test workflow: ${error.message}`);
    },
  });
}

/**
 * Start a workflow instance
 */
export function useStartWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workflowId, version, data }: { workflowId: string; version?: number; data?: Record<string, unknown> }) =>
      workflowsService.startWorkflow(workflowId, version, data),
    onSuccess: (result, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.executions(workflowId) });
      toast.success('Workflow started');
    },
    onError: (error: Error) => {
      toast.error(`Failed to start workflow: ${error.message}`);
    },
  });
}

/**
 * Cancel a running workflow
 */
export function useCancelWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (instanceId: string) => workflowsService.cancelWorkflow(instanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.all });
      toast.success('Workflow cancelled');
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel workflow: ${error.message}`);
    },
  });
}

/**
 * Resume a suspended workflow
 */
export function useResumeWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (instanceId: string) => workflowsService.resumeWorkflow(instanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.all });
      toast.success('Workflow resumed');
    },
    onError: (error: Error) => {
      toast.error(`Failed to resume workflow: ${error.message}`);
    },
  });
}

/**
 * Publish an event to trigger waiting workflows
 */
export function usePublishWorkflowEvent() {
  return useMutation({
    mutationFn: ({ eventName, eventKey, eventData }: { eventName: string; eventKey: string; eventData?: Record<string, unknown> }) =>
      workflowsService.publishEvent(eventName, eventKey, eventData),
    onSuccess: () => {
      toast.success('Event published');
    },
    onError: (error: Error) => {
      toast.error(`Failed to publish event: ${error.message}`);
    },
  });
}
