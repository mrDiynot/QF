/**
 * Admin Workflow Management React Query Hooks
 * Provides hooks for admin workflow operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminWorkflowsService } from '@/services/api/admin-workflows.service';
import { toast } from 'sonner';
import type {
  WorkflowTemplateRequest,
  BulkWorkflowAssignment,
  AdminWorkflowFilters,
  BusinessWorkflowFilters,
} from '@/types/admin-workflows';
import { queryConfig, invalidateListQueries } from '@/lib/query-config';

// Query keys
export const adminWorkflowKeys = {
  all: ['admin', 'workflows'] as const,
  templates: () => [...adminWorkflowKeys.all, 'templates'] as const,
  template: (id: string) => [...adminWorkflowKeys.templates(), id] as const,
  templateAnalytics: (id: string) => [...adminWorkflowKeys.template(id), 'analytics'] as const,
  assignments: () => [...adminWorkflowKeys.all, 'assignments'] as const,
  businessWorkflows: (businessId: string) => [...adminWorkflowKeys.all, 'business', businessId] as const,
  businessQuota: (businessId: string) => [...adminWorkflowKeys.businessWorkflows(businessId), 'quota'] as const,
  approvalRequests: () => [...adminWorkflowKeys.all, 'approval-requests'] as const,
  analytics: () => [...adminWorkflowKeys.all, 'analytics'] as const,
  templatePerformance: () => [...adminWorkflowKeys.analytics(), 'templates'] as const,
  planBreakdown: () => [...adminWorkflowKeys.analytics(), 'plans'] as const,
};

// ============================================================================
// Workflow Templates
// ============================================================================

/**
 * Fetch all workflow templates
 */
export function useAdminWorkflowTemplates(filters?: AdminWorkflowFilters) {
  return useQuery({
    queryKey: [...adminWorkflowKeys.templates(), filters],
    queryFn: () => adminWorkflowsService.getWorkflowTemplates(filters),
    ...queryConfig.standard, // Templates are relatively stable
  });
}

/**
 * Fetch single workflow template
 */
export function useAdminWorkflowTemplate(id: string) {
  return useQuery({
    queryKey: adminWorkflowKeys.template(id),
    queryFn: () => adminWorkflowsService.getWorkflowTemplateById(id),
    enabled: !!id,
    ...queryConfig.detail,
  });
}

/**
 * Create workflow template
 */
export function useCreateWorkflowTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WorkflowTemplateRequest) =>
      adminWorkflowsService.createWorkflowTemplate(data),
    onSuccess: () => {
      invalidateListQueries(queryClient, adminWorkflowKeys.templates());
      toast.success('Workflow template created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create template: ${error.message}`);
    },
  });
}

/**
 * Update workflow template
 */
export function useUpdateWorkflowTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkflowTemplateRequest> }) =>
      adminWorkflowsService.updateWorkflowTemplate(id, data),
    onSuccess: (_, { id }) => {
      invalidateListQueries(queryClient, adminWorkflowKeys.templates());
      queryClient.invalidateQueries({ queryKey: adminWorkflowKeys.template(id), refetchType: 'all' });
      toast.success('Workflow template updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update template: ${error.message}`);
    },
  });
}

/**
 * Delete workflow template
 */
export function useDeleteWorkflowTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminWorkflowsService.deleteWorkflowTemplate(id),
    onSuccess: () => {
      invalidateListQueries(queryClient, adminWorkflowKeys.templates());
      toast.success('Workflow template deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete template: ${error.message}`);
    },
  });
}

/**
 * Get workflow template analytics
 */
export function useWorkflowTemplateAnalytics(id: string) {
  return useQuery({
    queryKey: adminWorkflowKeys.templateAnalytics(id),
    queryFn: () => adminWorkflowsService.getWorkflowTemplateAnalytics(id),
    enabled: !!id,
    ...queryConfig.dashboard, // Analytics need more frequent updates
  });
}

// ============================================================================
// Plan Assignments
// ============================================================================

/**
 * Fetch workflow plan assignments
 */
export function useWorkflowPlanAssignments() {
  return useQuery({
    queryKey: adminWorkflowKeys.assignments(),
    queryFn: () => adminWorkflowsService.getWorkflowPlanAssignments(),
    ...queryConfig.standard,
  });
}

/**
 * Update workflow plan assignment
 */
export function useUpdateWorkflowPlanAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      templateId: string;
      planTier: string;
      isIncluded: boolean;
      requiresApproval?: boolean;
    }) => adminWorkflowsService.updateWorkflowPlanAssignment(data),
    onSuccess: () => {
      invalidateListQueries(queryClient, adminWorkflowKeys.assignments(), [
        adminWorkflowKeys.templates(),
      ]);
      toast.success('Plan assignment updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update assignment: ${error.message}`);
    },
  });
}

/**
 * Bulk update workflow plan assignments
 */
export function useBulkUpdateWorkflowPlanAssignments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkWorkflowAssignment) =>
      adminWorkflowsService.bulkUpdateWorkflowPlanAssignments(data),
    onSuccess: (result) => {
      invalidateListQueries(queryClient, adminWorkflowKeys.assignments(), [
        adminWorkflowKeys.templates(),
      ]);
      toast.success(
        `Bulk update complete: ${result.successCount} succeeded, ${result.failureCount} failed`
      );
    },
    onError: (error: Error) => {
      toast.error(`Bulk update failed: ${error.message}`);
    },
  });
}

// ============================================================================
// Business Workflows
// ============================================================================

/**
 * Fetch workflows for a business
 */
export function useBusinessWorkflows(businessId: string, filters?: BusinessWorkflowFilters) {
  return useQuery({
    queryKey: [...adminWorkflowKeys.businessWorkflows(businessId), filters],
    queryFn: () => adminWorkflowsService.getBusinessWorkflows(businessId, filters),
    enabled: !!businessId,
    ...queryConfig.standard,
  });
}

/**
 * Add workflow to business
 */
export function useAddWorkflowToBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      businessId,
      data,
    }: {
      businessId: string;
      data: { templateId: string; customConfiguration?: Record<string, unknown> };
    }) => adminWorkflowsService.addWorkflowToBusiness(businessId, data),
    onSuccess: (_, { businessId }) => {
      invalidateListQueries(queryClient, adminWorkflowKeys.businessWorkflows(businessId), [
        adminWorkflowKeys.businessQuota(businessId),
      ]);
      toast.success('Workflow added to business successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add workflow: ${error.message}`);
    },
  });
}

/**
 * Update business workflow
 */
export function useUpdateBusinessWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      businessId,
      workflowId,
      data,
    }: {
      businessId: string;
      workflowId: string;
      data: {
        isActive?: boolean;
        isApproved?: boolean;
        customConfiguration?: Record<string, unknown>;
      };
    }) => adminWorkflowsService.updateBusinessWorkflow(businessId, workflowId, data),
    onSuccess: (_, { businessId }) => {
      invalidateListQueries(queryClient, adminWorkflowKeys.businessWorkflows(businessId));
      toast.success('Business workflow updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update workflow: ${error.message}`);
    },
  });
}

/**
 * Remove workflow from business
 */
export function useRemoveWorkflowFromBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ businessId, workflowId }: { businessId: string; workflowId: string }) =>
      adminWorkflowsService.removeWorkflowFromBusiness(businessId, workflowId),
    onSuccess: (_, { businessId }) => {
      invalidateListQueries(queryClient, adminWorkflowKeys.businessWorkflows(businessId), [
        adminWorkflowKeys.businessQuota(businessId),
      ]);
      toast.success('Workflow removed from business successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove workflow: ${error.message}`);
    },
  });
}

/**
 * Get business workflow quota
 */
export function useBusinessWorkflowQuota(businessId: string) {
  return useQuery({
    queryKey: adminWorkflowKeys.businessQuota(businessId),
    queryFn: () => adminWorkflowsService.getBusinessWorkflowQuota(businessId),
    enabled: !!businessId,
    ...queryConfig.standard,
  });
}

// ============================================================================
// Approval Requests
// ============================================================================

/**
 * Fetch workflow approval requests
 */
export function useWorkflowApprovalRequests(filters?: {
  status?: 'pending' | 'approved' | 'rejected' | 'all';
  businessId?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: [...adminWorkflowKeys.approvalRequests(), filters],
    queryFn: () => adminWorkflowsService.getWorkflowApprovalRequests(filters),
    ...queryConfig.realtime, // Approval requests need to be up-to-date
  });
}

/**
 * Approve workflow request
 */
export function useApproveWorkflowRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, reviewNotes }: { requestId: string; reviewNotes?: string }) =>
      adminWorkflowsService.approveWorkflowRequest(requestId, reviewNotes),
    onSuccess: () => {
      invalidateListQueries(queryClient, adminWorkflowKeys.approvalRequests());
      toast.success('Workflow request approved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve request: ${error.message}`);
    },
  });
}

/**
 * Reject workflow request
 */
export function useRejectWorkflowRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, reviewNotes }: { requestId: string; reviewNotes?: string }) =>
      adminWorkflowsService.rejectWorkflowRequest(requestId, reviewNotes),
    onSuccess: () => {
      invalidateListQueries(queryClient, adminWorkflowKeys.approvalRequests());
      toast.success('Workflow request rejected');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reject request: ${error.message}`);
    },
  });
}

// ============================================================================
// Analytics
// ============================================================================

/**
 * Get platform-wide workflow analytics
 */
export function useAdminWorkflowAnalytics() {
  return useQuery({
    queryKey: adminWorkflowKeys.analytics(),
    queryFn: () => adminWorkflowsService.getAdminWorkflowAnalytics(),
    ...queryConfig.dashboard, // Analytics with polling
  });
}

/**
 * Get template performance analytics
 */
export function useTemplatePerformanceAnalytics() {
  return useQuery({
    queryKey: adminWorkflowKeys.templatePerformance(),
    queryFn: () => adminWorkflowsService.getTemplatePerformanceAnalytics(),
    ...queryConfig.dashboard,
  });
}

/**
 * Get plan breakdown analytics
 */
export function usePlanBreakdownAnalytics() {
  return useQuery({
    queryKey: adminWorkflowKeys.planBreakdown(),
    queryFn: () => adminWorkflowsService.getPlanBreakdownAnalytics(),
    ...queryConfig.dashboard,
  });
}
