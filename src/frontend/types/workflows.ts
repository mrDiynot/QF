/**
 * Workflow System Type Definitions
 * Comprehensive types for pre-built workflows, custom workflows, and workflow execution
 */

export type WorkflowCategory = 
  | 'lead_management'
  | 'follow_up_recovery'
  | 'engagement_retention'
  | 'sales_conversion'
  | 'communication';

export type WorkflowComplexity = 'simple' | 'moderate' | 'advanced';

// Aligned with Figma specification - 4 tiers only
export type SubscriptionTier = 'freeflow' | 'smartflow' | 'ultraflow' | 'enterprise';

export type Channel = 
  | 'sms'
  | 'email'
  | 'voice'
  | 'web_chat'
  | 'web_forms'
  | 'instagram'
  | 'facebook'
  | 'whatsapp';

export type IntegrationType = 
  | 'crm'
  | 'calendar'
  | 'email_service'
  | 'sms_provider'
  | 'analytics'
  | 'payment'
  | 'custom';

// ============================================================================
// Workflow Definition
// ============================================================================

export interface Workflow {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  category: WorkflowCategory;
  tier: SubscriptionTier;
  isActive: boolean;
  isCustom: boolean;
  assignedToPlans?: SubscriptionTier[];
  isGlobalTemplate?: boolean;
  requiresApproval?: boolean;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  conditions?: WorkflowCondition[];
  createdAt: string;
  updatedAt: string;
  version: number;

  // Optional analytics properties
  executions?: number;
  successRate?: number;
}

// ============================================================================
// Workflow Triggers
// ============================================================================

export type TriggerType =
  | 'form_submitted'
  | 'lead_created'
  | 'lead_updated'
  | 'call_missed'
  | 'call_received'
  | 'call_completed'
  | 'email_opened'
  | 'email_clicked'
  | 'sms_received'
  | 'appointment_scheduled'
  | 'appointment_missed'
  | 'time_based'
  | 'webhook'
  | 'api_call'
  | 'manual';

export interface WorkflowTrigger {
  type: TriggerType;
  config: TriggerConfig;
}

export interface TriggerConfig {
  // Form trigger
  formId?: string;
  
  // Lead trigger
  leadStatus?: string;
  leadScore?: number;
  
  // Call trigger
  callDuration?: number;
  callDirection?: 'inbound' | 'outbound';
  
  // Email trigger
  emailCampaignId?: string;
  linkClicked?: string;
  
  // Time-based trigger
  schedule?: {
    type: 'once' | 'recurring';
    datetime?: Date;
    cron?: string; // For recurring
  };
  
  // Webhook trigger
  webhookUrl?: string;
  webhookSecret?: string;
  
  // Conditions for trigger activation
  conditions?: WorkflowCondition[];
}

// ============================================================================
// Workflow Steps
// ============================================================================

export type StepType =
  | 'send_email'
  | 'send_sms'
  | 'make_call'
  | 'update_crm'
  | 'create_task'
  | 'send_webhook'
  | 'api_call'
  | 'wait'
  | 'branch'
  | 'loop'
  | 'end';

export interface WorkflowStep {
  id: string;
  type: StepType;
  name: string;
  description?: string;
  config: StepConfig;
  order: number;
  
  // Conditional execution
  conditions?: WorkflowCondition[];
  
  // Error handling
  onError?: {
    action: 'retry' | 'skip' | 'fail' | 'fallback';
    retryAttempts?: number;
    retryDelay?: number; // seconds
    fallbackStepId?: string;
  };
}

export interface StepConfig {
  // Email step
  emailTemplate?: string;
  emailSubject?: string;
  emailBody?: string;
  emailTo?: string;
  emailFrom?: string;
  
  // SMS step
  smsTemplate?: string;
  smsBody?: string;
  smsTo?: string;
  
  // Call step
  callTo?: string;
  callScript?: string;
  callType?: 'ai' | 'human';
  
  // CRM step
  crmAction?: 'create' | 'update' | 'delete';
  crmEntity?: string;
  crmFields?: Record<string, unknown>;
  
  // Task step
  taskTitle?: string;
  taskDescription?: string;
  taskAssignee?: string;
  taskDueDate?: Date;
  
  // Webhook step
  webhookUrl?: string;
  webhookMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  webhookHeaders?: Record<string, string>;
  webhookBody?: Record<string, unknown>;
  
  // Wait step
  waitDuration?: number; // seconds
  waitUntil?: Date;
  
  // Branch step
  branches?: Array<{
    condition: WorkflowCondition;
    nextStepId: string;
  }>;
  defaultBranch?: string; // Step ID if no conditions match
  
  // Loop step
  loopIterations?: number;
  loopCondition?: WorkflowCondition;
  loopSteps?: string[]; // Step IDs to loop
}

// ============================================================================
// Workflow Conditions
// ============================================================================

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'is_empty'
  | 'is_not_empty'
  | 'in'
  | 'not_in';

export type LogicalOperator = 'AND' | 'OR';

export interface WorkflowCondition {
  field: string; // Variable name or field path
  operator: ConditionOperator;
  value: unknown;
  logicalOperator?: LogicalOperator; // For combining multiple conditions
}

// ============================================================================
// Workflow Execution
// ============================================================================

export type ExecutionStatus = 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  businessId: string;
  
  // Execution context
  trigger: {
    type: TriggerType;
    data: Record<string, unknown>;
    timestamp: Date;
  };
  
  // Current state
  status: ExecutionStatus;
  currentStep: number;
  variables: Record<string, unknown>;
  
  // History
  steps: ExecutionStep[];
  errors: ExecutionError[];
  
  // Timing
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // milliseconds
  
  // Metadata
  createdAt: Date;
}

export interface ExecutionStep {
  stepId: string;
  type: StepType;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // milliseconds
  error?: string;
}

export interface ExecutionError {
  stepId: string;
  message: string;
  stack?: string;
  timestamp: Date;
  retryAttempt?: number;
}

// ============================================================================
// Workflow Analytics
// ============================================================================

export interface WorkflowAnalytics {
  workflowId: string;
  businessId: string;
  
  // Execution metrics
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  avgDuration: number; // milliseconds
  
  // Conversion metrics
  conversionRate: number; // percentage
  revenueGenerated: number;
  
  // Time period
  periodStart: Date;
  periodEnd: Date;
  
  // Trend data
  executionTrend: Array<{
    date: string;
    executions: number;
    successes: number;
    failures: number;
  }>;
  
  // Step performance
  stepPerformance: Array<{
    stepId: string;
    stepName: string;
    avgDuration: number;
    successRate: number;
  }>;
}

// ============================================================================
// Workflow Templates
// ============================================================================

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  tier: SubscriptionTier;
  
  // Template definition
  workflow: Omit<Workflow, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>;
  
  // Configuration options
  configOptions: TemplateConfigOption[];
  
  // Metadata
  isPopular: boolean;
  usageCount: number;
  rating: number;
  reviews: number;
  
  // Preview
  previewImage?: string;
  demoVideo?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateConfigOption {
  key: string;
  label: string;
  description: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
  required: boolean;
  defaultValue?: unknown;
  options?: Array<{ label: string; value: unknown }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// ============================================================================
// Pre-Built Workflow Definitions
// Matches backend WorkflowCore workflow IDs
// ============================================================================

export const PREBUILT_WORKFLOWS = {
  // FreeFlow tier (view-only, SmartFlow+ can execute)
  LEAD_QUALIFICATION: 'lead-qualification-workflow',
  REVIEW_SURVEY: 'review-survey-workflow',
  
  // SmartFlow tier (executable)
  EMAIL_NURTURE_CAMPAIGN: 'email-nurture-campaign-workflow',
  FOLLOW_UP_SEQUENCE: 'follow-up-sequence-workflow',
  MISSED_CALL_RECOVERY: 'missed-call-recovery-workflow',
  NO_SHOW_RECOVERY: 'no-show-recovery-workflow',
  
  // UltraFlow tier (executable)
  COLD_LEAD_REVIVAL: 'cold-lead-revival-workflow',
  RETENTION_REENGAGEMENT: 'retention-reengagement-workflow',
  PROPOSAL: 'proposal-workflow',
  ABANDONED_FORM_RECOVERY: 'abandoned-form-recovery-workflow',
} as const;

export type PrebuiltWorkflowId = typeof PREBUILT_WORKFLOWS[keyof typeof PREBUILT_WORKFLOWS];

// ============================================================================
// Workflow Builder (Enterprise)
// ============================================================================

export interface WorkflowBuilderState {
  workflow: Workflow;
  selectedStepId?: string;
  isDirty: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface WorkflowBuilderAction {
  type: 'add_step' | 'update_step' | 'delete_step' | 'reorder_steps' | 'update_trigger' | 'update_condition';
  payload: unknown;
}

// ============================================================================
// Helper Functions
// ============================================================================

export const getWorkflowsByTier = (_tier: SubscriptionTier): PrebuiltWorkflowId[] => {
  // Per Figma spec: ALL paid tiers (SmartFlow+) get ALL 10 workflows
  // FreeFlow can VIEW all workflows but cannot EXECUTE them
  // Return all workflow IDs - execution restriction handled by backend
  return [
    PREBUILT_WORKFLOWS.LEAD_QUALIFICATION,
    PREBUILT_WORKFLOWS.REVIEW_SURVEY,
    PREBUILT_WORKFLOWS.EMAIL_NURTURE_CAMPAIGN,
    PREBUILT_WORKFLOWS.FOLLOW_UP_SEQUENCE,
    PREBUILT_WORKFLOWS.MISSED_CALL_RECOVERY,
    PREBUILT_WORKFLOWS.NO_SHOW_RECOVERY,
    PREBUILT_WORKFLOWS.COLD_LEAD_REVIVAL,
    PREBUILT_WORKFLOWS.RETENTION_REENGAGEMENT,
    PREBUILT_WORKFLOWS.PROPOSAL,
    PREBUILT_WORKFLOWS.ABANDONED_FORM_RECOVERY,
  ];
};

export const canCreateCustomWorkflows = (tier: SubscriptionTier): boolean => {
  return ['ultraflow', 'enterprise'].includes(tier);
};

export const getMaxCustomWorkflows = (tier: SubscriptionTier): number => {
  switch (tier) {
    case 'ultraflow':
      return 5;
    case 'enterprise':
      return Infinity;
    default:
      return 0;
  }
};

export const hasMarketplaceAccess = (tier: SubscriptionTier): boolean => {
  return ['ultraflow', 'enterprise'].includes(tier);
};

export const hasWorkflowBuilderAccess = (tier: SubscriptionTier): boolean => {
  return tier === 'enterprise';
};
