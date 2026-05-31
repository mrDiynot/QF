/**
 * Admin Workflow Management API Service
 * Handles all API calls for admin workflow management
 */

// Using fetch API directly - will be replaced with proper API client integration
const api = {
  get: async (url: string) => {
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) throw new Error(`API error: ${response.statusText}`);
    return { data: await response.json() };
  },
  post: async (url: string, data: unknown) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`API error: ${response.statusText}`);
    return { data: await response.json() };
  },
  put: async (url: string, data: unknown) => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`API error: ${response.statusText}`);
    return { data: await response.json() };
  },
  delete: async (url: string) => {
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`API error: ${response.statusText}`);
    return { data: await response.json() };
  },
};
import type {
  WorkflowTemplate,
  BusinessWorkflow,
  WorkflowPlanAssignment,
  BusinessWorkflowQuota,
  AdminWorkflowAnalytics,
  WorkflowApprovalRequest,
  WorkflowTemplateRequest,
  BulkWorkflowAssignment,
  AdminWorkflowFilters,
  BusinessWorkflowFilters,
} from '@/types/admin-workflows';

const BASE_URL = '/api/v1/admin';

// ============================================================================
// Workflow Templates
// ============================================================================

/**
 * Get all workflow templates
 */
export const getWorkflowTemplates = async (
  filters?: AdminWorkflowFilters
): Promise<{ templates: WorkflowTemplate[]; total: number }> => {
  const params = new URLSearchParams();
  
  if (filters?.search) params.append('search', filters.search);
  if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
  if (filters?.planTier && filters.planTier !== 'all') params.append('planTier', filters.planTier);
  if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters?.isGlobalTemplate !== undefined) params.append('isGlobalTemplate', String(filters.isGlobalTemplate));
  if (filters?.requiresApproval !== undefined) params.append('requiresApproval', String(filters.requiresApproval));
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.pageSize) params.append('pageSize', String(filters.pageSize));

  const response = await api.get(`${BASE_URL}/workflow-templates?${params.toString()}`);
  return response.data;
};

/**
 * Get workflow template by ID
 */
export const getWorkflowTemplateById = async (id: string): Promise<WorkflowTemplate> => {
  const response = await api.get(`${BASE_URL}/workflow-templates/${id}`);
  return response.data;
};

/**
 * Create workflow template
 */
export const createWorkflowTemplate = async (
  data: WorkflowTemplateRequest
): Promise<WorkflowTemplate> => {
  const response = await api.post(`${BASE_URL}/workflow-templates`, data);
  return response.data;
};

/**
 * Update workflow template
 */
export const updateWorkflowTemplate = async (
  id: string,
  data: Partial<WorkflowTemplateRequest>
): Promise<WorkflowTemplate> => {
  const response = await api.put(`${BASE_URL}/workflow-templates/${id}`, data);
  return response.data;
};

/**
 * Delete workflow template
 */
export const deleteWorkflowTemplate = async (id: string): Promise<{ success: boolean }> => {
  const response = await api.delete(`${BASE_URL}/workflow-templates/${id}`);
  return response.data;
};

/**
 * Get workflow template analytics
 */
export const getWorkflowTemplateAnalytics = async (id: string): Promise<{
  usage: number;
  performance: number;
  adoption: number;
}> => {
  const response = await api.get(`${BASE_URL}/workflow-templates/${id}/analytics`);
  return response.data;
};

// ============================================================================
// Plan Assignments
// ============================================================================

/**
 * Get all workflow plan assignments
 */
export const getWorkflowPlanAssignments = async (): Promise<WorkflowPlanAssignment[]> => {
  const response = await api.get(`${BASE_URL}/workflow-plan-assignments`);
  return response.data;
};

/**
 * Update workflow plan assignment
 */
export const updateWorkflowPlanAssignment = async (data: {
  templateId: string;
  planTier: string;
  isIncluded: boolean;
  requiresApproval?: boolean;
}): Promise<WorkflowPlanAssignment> => {
  const response = await api.put(`${BASE_URL}/workflow-plan-assignments`, data);
  return response.data;
};

/**
 * Bulk update workflow plan assignments
 */
export const bulkUpdateWorkflowPlanAssignments = async (
  data: BulkWorkflowAssignment
): Promise<{ successCount: number; failureCount: number; errors: string[] }> => {
  const response = await api.post(`${BASE_URL}/workflow-plan-assignments/bulk`, data);
  return response.data;
};

// ============================================================================
// Business Workflows
// ============================================================================

/**
 * Get workflows for a specific business
 */
export const getBusinessWorkflows = async (
  businessId: string,
  filters?: BusinessWorkflowFilters
): Promise<BusinessWorkflow[]> => {
  const params = new URLSearchParams();
  
  if (filters?.search) params.append('search', filters.search);
  if (filters?.templateId) params.append('templateId', filters.templateId);
  if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.pageSize) params.append('pageSize', String(filters.pageSize));

  const response = await api.get(
    `${BASE_URL}/businesses/${businessId}/workflows?${params.toString()}`
  );
  return response.data;
};

/**
 * Add workflow to business
 */
export const addWorkflowToBusiness = async (
  businessId: string,
  data: { templateId: string; customConfiguration?: Record<string, unknown> }
): Promise<BusinessWorkflow> => {
  const response = await api.post(`${BASE_URL}/businesses/${businessId}/workflows`, data);
  return response.data;
};

/**
 * Update business workflow
 */
export const updateBusinessWorkflow = async (
  businessId: string,
  workflowId: string,
  data: {
    isActive?: boolean;
    isApproved?: boolean;
    customConfiguration?: Record<string, unknown>;
  }
): Promise<BusinessWorkflow> => {
  const response = await api.put(
    `${BASE_URL}/businesses/${businessId}/workflows/${workflowId}`,
    data
  );
  return response.data;
};

/**
 * Remove workflow from business
 */
export const removeWorkflowFromBusiness = async (
  businessId: string,
  workflowId: string
): Promise<{ success: boolean }> => {
  const response = await api.delete(
    `${BASE_URL}/businesses/${businessId}/workflows/${workflowId}`
  );
  return response.data;
};

/**
 * Get business workflow quota
 */
export const getBusinessWorkflowQuota = async (
  businessId: string
): Promise<BusinessWorkflowQuota> => {
  const response = await api.get(`${BASE_URL}/businesses/${businessId}/workflows/quota`);
  return response.data;
};

// ============================================================================
// Approval Requests
// ============================================================================

/**
 * Get workflow approval requests
 */
export const getWorkflowApprovalRequests = async (filters?: {
  status?: 'pending' | 'approved' | 'rejected' | 'all';
  businessId?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ requests: WorkflowApprovalRequest[]; total: number }> => {
  const params = new URLSearchParams();
  
  if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters?.businessId) params.append('businessId', filters.businessId);
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.pageSize) params.append('pageSize', String(filters.pageSize));

  const response = await api.get(
    `${BASE_URL}/workflow-approval-requests?${params.toString()}`
  );
  return response.data;
};

/**
 * Approve workflow request
 */
export const approveWorkflowRequest = async (
  requestId: string,
  reviewNotes?: string
): Promise<WorkflowApprovalRequest> => {
  const response = await api.post(
    `${BASE_URL}/workflow-approval-requests/${requestId}/approve`,
    { reviewNotes }
  );
  return response.data;
};

/**
 * Reject workflow request
 */
export const rejectWorkflowRequest = async (
  requestId: string,
  reviewNotes?: string
): Promise<WorkflowApprovalRequest> => {
  const response = await api.post(
    `${BASE_URL}/workflow-approval-requests/${requestId}/reject`,
    { reviewNotes }
  );
  return response.data;
};

// ============================================================================
// Analytics
// ============================================================================

/**
 * Get platform-wide workflow analytics
 */
export const getAdminWorkflowAnalytics = async (): Promise<AdminWorkflowAnalytics> => {
  const response = await api.get(`${BASE_URL}/workflows/analytics`);
  return response.data;
};

/**
 * Get template performance analytics
 */
export const getTemplatePerformanceAnalytics = async (): Promise<{
  topByUsage: Array<{ templateId: string; name: string; activeInstances: number; totalExecutions: number }>;
  topBySuccess: Array<{ templateId: string; name: string; successRate: number; totalExecutions: number }>;
  trends: Array<{ date: string; executions: number; successes: number; failures: number }>;
}> => {
  const response = await api.get(`${BASE_URL}/workflows/analytics/templates`);
  return response.data;
};

/**
 * Get plan breakdown analytics
 */
export const getPlanBreakdownAnalytics = async (): Promise<{
  workflowsByPlan: Array<{
    planTier: string;
    totalWorkflows: number;
    activeWorkflows: number;
    totalExecutions: number;
  }>;
  adoptionByPlan: Array<{
    planTier: string;
    totalBusinesses: number;
    businessesUsingWorkflows: number;
    adoptionRate: number;
  }>;
}> => {
  const response = await api.get(`${BASE_URL}/workflows/analytics/plans`);
  return response.data;
};

// Export all services
export const adminWorkflowsService = {
  // Templates
  getWorkflowTemplates,
  getWorkflowTemplateById,
  createWorkflowTemplate,
  updateWorkflowTemplate,
  deleteWorkflowTemplate,
  getWorkflowTemplateAnalytics,
  
  // Plan Assignments
  getWorkflowPlanAssignments,
  updateWorkflowPlanAssignment,
  bulkUpdateWorkflowPlanAssignments,
  
  // Business Workflows
  getBusinessWorkflows,
  addWorkflowToBusiness,
  updateBusinessWorkflow,
  removeWorkflowFromBusiness,
  getBusinessWorkflowQuota,
  
  // Approval Requests
  getWorkflowApprovalRequests,
  approveWorkflowRequest,
  rejectWorkflowRequest,
  
  // Analytics
  getAdminWorkflowAnalytics,
  getTemplatePerformanceAnalytics,
  getPlanBreakdownAnalytics,
};
