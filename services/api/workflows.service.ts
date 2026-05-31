/**
 * Workflows API Service
 */

import { apiClient } from '@/lib/axios';
import { devLog } from '@/lib/dev-bypass';

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  isActive: boolean;
  isCustom: boolean;
  executionCount: number;
  lastExecutedAt?: string;
  createdAt: string;
  updatedAt?: string;
  // Additional properties for UI display
  category?: 'lead_management' | 'follow_up_recovery' | 'engagement_retention' | 'sales_conversion' | 'communication';
  executions?: number;
  successRate?: number;
  avgDuration?: number;
}

export interface WorkflowTrigger {
  type: 'lead_created' | 'lead_status_changed' | 'form_submitted' | 'message_received' | 'scheduled';
  conditions?: Record<string, unknown>;
  schedule?: string;
}

export interface WorkflowAction {
  id: string;
  type: 'send_email' | 'send_sms' | 'create_task' | 'update_lead' | 'notify' | 'webhook' | 'delay';
  config: Record<string, unknown>;
  order: number;
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  trigger: WorkflowTrigger;
  actions: Omit<WorkflowAction, 'id'>[];
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  triggeredBy: string;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
  logs: WorkflowLog[];
}

export interface WorkflowLog {
  actionId: string;
  actionType: string;
  status: 'success' | 'failed' | 'skipped';
  message?: string;
  timestamp: string;
}

export const workflowsService = {
  getWorkflows: async (): Promise<Workflow[]> => {
    try {
      const response = await apiClient.get<Workflow[]>('/Workflows');
      return response.data || [];
    } catch (error) {
      devLog('[Workflows] Failed to get workflows:', error);
      return [];
    }
  },

  getWorkflowById: async (id: string): Promise<Workflow | null> => {
    try {
      const response = await apiClient.get<Workflow>(`/Workflows/${id}`);
      return response.data;
    } catch (error) {
      devLog('[Workflows] Failed to get workflow:', error);
      return null;
    }
  },

  createWorkflow: async (data: CreateWorkflowRequest) => {
    const response = await apiClient.post<Workflow>('/Workflows', data);
    return response.data;
  },

  updateWorkflow: async (id: string, data: Partial<CreateWorkflowRequest>) => {
    const response = await apiClient.patch<Workflow>(`/Workflows/${id}`, data);
    return response.data;
  },

  deleteWorkflow: async (id: string) => {
    await apiClient.delete(`/Workflows/${id}`);
  },

  toggleActive: async (id: string, isActive: boolean) => {
    const response = await apiClient.patch<Workflow>(`/Workflows/${id}/toggle`, { isActive });
    return response.data;
  },

  testWorkflow: async (id: string, testData?: Record<string, unknown>) => {
    const response = await apiClient.post<WorkflowExecution>(`/Workflows/${id}/test`, testData);
    return response.data;
  },

  getExecutions: async (workflowId: string, params?: { pageNumber?: number; pageSize?: number }) => {
    const response = await apiClient.get<{ items: WorkflowExecution[]; totalCount: number }>(
      `/Workflows/${workflowId}/executions`,
      { params }
    );
    return response.data;
  },

  getExecutionById: async (workflowId: string, executionId: string) => {
    const response = await apiClient.get<WorkflowExecution>(
      `/Workflows/${workflowId}/executions/${executionId}`
    );
    return response.data;
  },

  // Start a workflow instance
  startWorkflow: async (workflowId: string, version: number = 1, data: Record<string, unknown> = {}) => {
    const response = await apiClient.post<{ workflowInstanceId: string }>('/Workflows/start', {
      workflowId,
      version,
      data: JSON.stringify(data),
    });
    return response.data;
  },

  // Cancel a running workflow instance
  cancelWorkflow: async (instanceId: string) => {
    await apiClient.post(`/Workflows/${instanceId}/cancel`);
  },

  // Resume a suspended workflow instance
  resumeWorkflow: async (instanceId: string) => {
    await apiClient.post(`/Workflows/${instanceId}/resume`);
  },

  // Get workflow definitions (predefined workflows)
  getDefinitions: async () => {
    try {
      const response = await apiClient.get<Array<{
        workflowId: string;
        version: number;
        name: string;
        description: string;
      }>>('/Workflows/definitions');
      return response.data || [];
    } catch (error) {
      devLog('[Workflows] Failed to get definitions:', error);
      return [];
    }
  },

  // Publish an event to resume waiting workflows
  publishEvent: async (eventName: string, eventKey: string, eventData?: Record<string, unknown>) => {
    await apiClient.post('/Workflows/event', {
      eventName,
      eventKey,
      eventData: eventData ? JSON.stringify(eventData) : null,
    });
  },

  // Get available workflow templates for the business
  getTemplates: async () => {
    try {
      const response = await apiClient.get<Array<{
        id: string;
        name: string;
        description: string;
        category: string;
        tier: string;
        estimatedTimeMinutes: number;
        stepCount: number;
        usageCount: number;
        rating: number;
        isActive: boolean;
        icon?: string;
      }>>('/Workflows/templates');
      return response.data || [];
    } catch (error) {
      devLog('[Workflows] Failed to get templates:', error);
      return [];
    }
  },

  // Get workflow subscription status for the current business
  getSubscriptionStatus: async (): Promise<WorkflowSubscriptionStatus> => {
    try {
      const response = await apiClient.get<WorkflowSubscriptionStatus>('/Workflows/subscription');
      return response.data;
    } catch (error) {
      devLog('[Workflows] Failed to get subscription status:', error);
      return {
        currentTier: 'FreeFlow',
        availableWorkflowIds: [],
        availableWorkflowCount: 0,
        activeWorkflowCount: 0,
        monthlyExecutions: 0,
        canCreateCustomWorkflows: false,
        hasVisualBuilder: false,
      };
    }
  },

  // Check if a specific workflow can be activated
  canActivateWorkflow: async (workflowId: string): Promise<WorkflowAccessCheck> => {
    try {
      const response = await apiClient.get<WorkflowAccessCheck>(`/Workflows/can-activate/${workflowId}`);
      return response.data;
    } catch (error) {
      devLog('[Workflows] Failed to check workflow activation:', error);
      return {
        workflowId,
        canActivate: false,
        canExecute: false,
        requiredTier: 'SmartFlow',
      };
    }
  },
};

// Types for subscription status
export interface WorkflowSubscriptionStatus {
  currentTier: string;
  availableWorkflowIds: string[];
  availableWorkflowCount: number;
  activeWorkflowCount: number;
  monthlyExecutions: number;
  canCreateCustomWorkflows: boolean;
  hasVisualBuilder: boolean;
}

export interface WorkflowAccessCheck {
  workflowId: string;
  canActivate: boolean;
  canExecute: boolean;
  requiredTier: string;
}
