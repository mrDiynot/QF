/**
 * Admin Workflow Management Types
 * Types for managing workflows at the admin portal level
 */

import type { SubscriptionTier, WorkflowCategory } from './workflows';

/**
 * Workflow template that can be assigned to subscription plans
 */
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  isActive: boolean;
  isGlobalTemplate: boolean;
  assignedToPlans: SubscriptionTier[];
  requiresApproval: boolean;
  
  // Template configuration
  defaultTrigger: Record<string, unknown>;
  defaultSteps: Record<string, unknown>[];
  configurableFields: string[];
  
  // Usage statistics
  totalBusinesses: number;
  activeInstances: number;
  totalExecutions: number;
  avgSuccessRate: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
}

/**
 * Business-specific workflow instance
 */
export interface BusinessWorkflow {
  id: string;
  businessId: string;
  businessName: string;
  templateId: string;
  templateName: string;
  
  // Status
  isActive: boolean;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  
  // Customization
  customConfiguration: Record<string, unknown>;
  
  // Performance
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
  lastExecutedAt?: string;
  
  // Metadata
  activatedAt?: string;
  deactivatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Workflow assignment to subscription plan
 */
export interface WorkflowPlanAssignment {
  id: string;
  workflowTemplateId: string;
  workflowName: string;
  planTier: SubscriptionTier;
  
  // Assignment settings
  isIncluded: boolean;
  maxInstances?: number; // null = unlimited
  requiresApproval: boolean;
  
  // Usage tracking
  totalBusinessesOnPlan: number;
  businessesUsingWorkflow: number;
  adoptionRate: number;
  
  // Metadata
  assignedAt: string;
  assignedBy: string;
}

/**
 * Business workflow quota and usage
 */
export interface BusinessWorkflowQuota {
  businessId: string;
  businessName: string;
  planTier: SubscriptionTier;
  
  // Quota limits
  maxWorkflows: number; // Total workflows allowed
  maxCustomWorkflows: number;
  maxActiveWorkflows: number;
  
  // Current usage
  totalWorkflows: number;
  customWorkflows: number;
  activeWorkflows: number;
  
  // Available templates
  availableTemplates: string[]; // Template IDs
  
  // Status
  isOverQuota: boolean;
  quotaWarning?: string;
}

/**
 * Workflow analytics for admin dashboard
 */
export interface AdminWorkflowAnalytics {
  // Global metrics
  totalTemplates: number;
  activeTemplates: number;
  totalBusinessWorkflows: number;
  activeBusinessWorkflows: number;
  
  // Execution metrics
  totalExecutions24h: number;
  totalExecutions7d: number;
  totalExecutions30d: number;
  globalSuccessRate: number;
  
  // Adoption metrics
  businessesUsingWorkflows: number;
  totalBusinesses: number;
  adoptionRate: number;
  
  // Top performers
  topWorkflowsByUsage: Array<{
    templateId: string;
    name: string;
    activeInstances: number;
    totalExecutions: number;
  }>;
  
  topWorkflowsBySuccess: Array<{
    templateId: string;
    name: string;
    successRate: number;
    totalExecutions: number;
  }>;
  
  // Plan breakdown
  workflowsByPlan: Array<{
    planTier: SubscriptionTier;
    totalWorkflows: number;
    activeWorkflows: number;
    totalExecutions: number;
  }>;
  
  // Trend data
  executionTrend: Array<{
    date: string;
    executions: number;
    successes: number;
    failures: number;
  }>;
}

/**
 * Workflow approval request
 */
export interface WorkflowApprovalRequest {
  id: string;
  businessId: string;
  businessName: string;
  workflowTemplateId: string;
  workflowName: string;
  
  // Request details
  requestedBy: string;
  requestedByEmail: string;
  requestReason?: string;
  customConfiguration?: Record<string, unknown>;
  
  // Status
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  
  // Metadata
  requestedAt: string;
  expiresAt?: string;
}

/**
 * Bulk workflow assignment operation
 */
export interface BulkWorkflowAssignment {
  workflowTemplateIds: string[];
  targetPlanTiers: SubscriptionTier[];
  operation: 'assign' | 'unassign';
  
  // Options
  requiresApproval?: boolean;
  maxInstancesPerBusiness?: number;
  
  // Results
  affectedBusinesses?: number;
  successCount?: number;
  failureCount?: number;
  errors?: string[];
}

/**
 * Workflow template creation/update request
 */
export interface WorkflowTemplateRequest {
  name: string;
  description: string;
  category: WorkflowCategory;
  
  // Assignment
  assignedToPlans: SubscriptionTier[];
  isGlobalTemplate: boolean;
  requiresApproval: boolean;
  
  // Configuration
  defaultTrigger: Record<string, unknown>;
  defaultSteps: Record<string, unknown>[];
  configurableFields: string[];
  
  // Metadata
  tags?: string[];
  estimatedSetupTime?: number; // minutes
  complexity?: 'simple' | 'moderate' | 'advanced';
}

/**
 * Admin workflow filters
 */
export interface AdminWorkflowFilters {
  search?: string;
  category?: WorkflowCategory | 'all';
  planTier?: SubscriptionTier | 'all';
  status?: 'active' | 'inactive' | 'all';
  isGlobalTemplate?: boolean;
  requiresApproval?: boolean;
  
  // Sorting
  sortBy?: 'name' | 'usage' | 'success_rate' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
  
  // Pagination
  page?: number;
  pageSize?: number;
}

/**
 * Business workflow filters
 */
export interface BusinessWorkflowFilters {
  businessId?: string;
  search?: string;
  templateId?: string;
  status?: 'active' | 'inactive' | 'pending_approval' | 'all';
  
  // Sorting
  sortBy?: 'business_name' | 'template_name' | 'executions' | 'success_rate' | 'activated_at';
  sortOrder?: 'asc' | 'desc';
  
  // Pagination
  page?: number;
  pageSize?: number;
}

/**
 * Helper function to check if a business can use a workflow
 */
export const canBusinessUseWorkflow = (
  businessPlan: SubscriptionTier,
  workflowAssignedPlans: SubscriptionTier[]
): boolean => {
  return workflowAssignedPlans.includes(businessPlan);
};

/**
 * Helper function to check if business is over quota
 */
export const isBusinessOverQuota = (quota: BusinessWorkflowQuota): boolean => {
  return quota.totalWorkflows >= quota.maxWorkflows ||
         quota.customWorkflows >= quota.maxCustomWorkflows ||
         quota.activeWorkflows >= quota.maxActiveWorkflows;
};

/**
 * Helper function to get quota status
 */
export const getQuotaStatus = (quota: BusinessWorkflowQuota): {
  status: 'ok' | 'warning' | 'exceeded';
  message: string;
} => {
  const workflowUsage = (quota.totalWorkflows / quota.maxWorkflows) * 100;
  const activeUsage = (quota.activeWorkflows / quota.maxActiveWorkflows) * 100;
  
  if (workflowUsage >= 100 || activeUsage >= 100) {
    return {
      status: 'exceeded',
      message: 'Workflow quota exceeded'
    };
  }
  
  if (workflowUsage >= 80 || activeUsage >= 80) {
    return {
      status: 'warning',
      message: 'Approaching workflow quota limit'
    };
  }
  
  return {
    status: 'ok',
    message: 'Within quota limits'
  };
};

/**
 * Plan tier display names
 */
export const PLAN_TIER_NAMES: Record<SubscriptionTier, string> = {
  freeflow: 'FreeFlow',
  smartflow: 'SmartFlow',
  ultraflow: 'UltraFlow',
  enterprise: 'Enterprise'
};

/**
 * Default workflow quotas per plan
 */
export const DEFAULT_WORKFLOW_QUOTAS: Record<SubscriptionTier, {
  maxWorkflows: number;
  maxCustomWorkflows: number;
  maxActiveWorkflows: number;
}> = {
  freeflow: {
    maxWorkflows: 2,
    maxCustomWorkflows: 0,
    maxActiveWorkflows: 2
  },
  smartflow: {
    maxWorkflows: 6,
    maxCustomWorkflows: 0,
    maxActiveWorkflows: 6
  },
  ultraflow: {
    maxWorkflows: 15,
    maxCustomWorkflows: 5,
    maxActiveWorkflows: 10
  },
  enterprise: {
    maxWorkflows: -1, // unlimited
    maxCustomWorkflows: -1, // unlimited
    maxActiveWorkflows: -1 // unlimited
  }
};
