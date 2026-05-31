/**
 * React Query hooks for Workflows API
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workflowsService, CreateWorkflowRequest } from '@/services/api/workflows.service';
import type { Workflow, WorkflowExecution, WorkflowSubscriptionStatus, WorkflowAccessCheck } from '@/services/api/workflows.service';
import { queryConfig, invalidateListQueries } from '@/lib/query-config';

// Type exports for consumers
export type { Workflow, WorkflowExecution, WorkflowSubscriptionStatus, WorkflowAccessCheck };

// Query keys
export const workflowKeys = {
  all: ['workflows'] as const,
  lists: () => [...workflowKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...workflowKeys.lists(), filters] as const,
  details: () => [...workflowKeys.all, 'detail'] as const,
  detail: (id: string) => [...workflowKeys.details(), id] as const,
  executions: (workflowId: string) => [...workflowKeys.all, 'executions', workflowId] as const,
  definitions: () => [...workflowKeys.all, 'definitions'] as const,
  subscription: () => [...workflowKeys.all, 'subscription'] as const,
  canActivate: (workflowId: string) => [...workflowKeys.all, 'canActivate', workflowId] as const,
};

// Get all workflows
export function useWorkflows() {
  return useQuery({
    queryKey: workflowKeys.lists(),
    queryFn: () => workflowsService.getWorkflows(),
    ...queryConfig.standard,
  });
}

// Get single workflow by ID
export function useWorkflow(id: string) {
  return useQuery({
    queryKey: workflowKeys.detail(id),
    queryFn: () => workflowsService.getWorkflowById(id),
    enabled: !!id,
    ...queryConfig.detail,
  });
}

// Get workflow definitions (predefined workflows)
export function useWorkflowDefinitions() {
  return useQuery({
    queryKey: workflowKeys.definitions(),
    queryFn: () => workflowsService.getDefinitions(),
    ...queryConfig.static, // Definitions rarely change
  });
}

// Get workflow executions
export function useWorkflowExecutions(workflowId: string, params?: { pageNumber?: number; pageSize?: number }) {
  return useQuery({
    queryKey: workflowKeys.executions(workflowId),
    queryFn: () => workflowsService.getExecutions(workflowId, params),
    enabled: !!workflowId,
    ...queryConfig.realtime, // Executions can change frequently
  });
}

// Create workflow mutation
export function useCreateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkflowRequest) => workflowsService.createWorkflow(data),
    onSuccess: () => {
      invalidateListQueries(queryClient, workflowKeys.all);
    },
  });
}

// Update workflow mutation
export function useUpdateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateWorkflowRequest> }) =>
      workflowsService.updateWorkflow(id, data),
    onSuccess: (_, { id }) => {
      invalidateListQueries(queryClient, workflowKeys.all);
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(id), refetchType: 'all' });
    },
  });
}

// Delete workflow mutation
export function useDeleteWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workflowsService.deleteWorkflow(id),
    onSuccess: () => {
      invalidateListQueries(queryClient, workflowKeys.all);
    },
  });
}

// Toggle workflow active status
export function useToggleWorkflowActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      workflowsService.toggleActive(id, isActive),
    onSuccess: (_, { id }) => {
      invalidateListQueries(queryClient, workflowKeys.all);
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(id), refetchType: 'all' });
    },
  });
}

// Start workflow instance
export function useStartWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workflowId, version = 1, data = {} }: {
      workflowId: string;
      version?: number;
      data?: Record<string, unknown>;
    }) => workflowsService.startWorkflow(workflowId, version, data),
    onSuccess: (_, { workflowId }) => {
      queryClient.removeQueries({ queryKey: workflowKeys.executions(workflowId) });
      queryClient.invalidateQueries({ queryKey: workflowKeys.executions(workflowId), refetchType: 'all' });
    },
  });
}

// Cancel workflow instance
export function useCancelWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (instanceId: string) => workflowsService.cancelWorkflow(instanceId),
    onSuccess: () => {
      invalidateListQueries(queryClient, workflowKeys.all);
    },
  });
}

// Resume workflow instance
export function useResumeWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (instanceId: string) => workflowsService.resumeWorkflow(instanceId),
    onSuccess: () => {
      invalidateListQueries(queryClient, workflowKeys.all);
    },
  });
}

// Test workflow
export function useTestWorkflow() {
  return useMutation({
    mutationFn: ({ id, testData }: { id: string; testData?: Record<string, unknown> }) =>
      workflowsService.testWorkflow(id, testData),
  });
}

// Publish event to resume waiting workflows
export function usePublishWorkflowEvent() {
  return useMutation({
    mutationFn: ({ eventName, eventKey, eventData }: { 
      eventName: string; 
      eventKey: string; 
      eventData?: Record<string, unknown>;
    }) => workflowsService.publishEvent(eventName, eventKey, eventData),
  });
}

// Get workflow subscription status for the current business
export function useWorkflowSubscriptionStatus() {
  return useQuery({
    queryKey: workflowKeys.subscription(),
    queryFn: () => workflowsService.getSubscriptionStatus(),
  });
}

// Check if a specific workflow can be activated
export function useCanActivateWorkflow(workflowId: string) {
  return useQuery({
    queryKey: workflowKeys.canActivate(workflowId),
    queryFn: () => workflowsService.canActivateWorkflow(workflowId),
    enabled: !!workflowId,
  });
}
