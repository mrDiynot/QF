/**
 * Integration Framework Type Definitions
 * Custom integrations and third-party connections
 */

export type IntegrationType = 
  | 'crm'
  | 'calendar'
  | 'email_service'
  | 'sms_provider'
  | 'voice_provider'
  | 'analytics'
  | 'payment'
  | 'ecommerce'
  | 'marketing'
  | 'custom';

export type AuthType = 
  | 'oauth2'
  | 'api_key'
  | 'basic'
  | 'bearer'
  | 'custom';

export type SyncDirection = 'inbound' | 'outbound' | 'bidirectional';

export type SyncFrequency = 'realtime' | 'hourly' | 'daily' | 'manual';

export type ConflictResolution = 'qualiflow_wins' | 'external_wins' | 'manual' | 'newest_wins';

// ============================================================================
// Integration Definition
// ============================================================================

export interface Integration {
  id: string;
  businessId: string;
  name: string;
  type: IntegrationType;
  provider: string; // e.g., 'hubspot', 'salesforce', 'custom'
  
  // Connection
  auth: IntegrationAuth;
  
  // Configuration
  config: IntegrationConfig;
  
  // Data mapping
  fieldMappings: FieldMapping[];
  
  // Sync configuration
  sync: SyncConfig;
  
  // Webhooks
  webhooks: WebhookConfig;
  
  // Status
  isActive: boolean;
  lastSyncAt?: Date;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  lastError?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

// ============================================================================
// Authentication
// ============================================================================

export interface IntegrationAuth {
  type: AuthType;
  credentials: AuthCredentials;
  
  // OAuth2 specific
  tokenEndpoint?: string;
  authorizationEndpoint?: string;
  scopes?: string[];
  
  // Token management
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface AuthCredentials {
  // API Key
  apiKey?: string;
  apiSecret?: string;
  
  // Basic Auth
  username?: string;
  password?: string;
  
  // OAuth2
  clientId?: string;
  clientSecret?: string;
  
  // Custom
  customHeaders?: Record<string, string>;
  customParams?: Record<string, string>;
}

// ============================================================================
// Integration Configuration
// ============================================================================

export interface IntegrationConfig {
  // API endpoints
  baseUrl: string;
  apiVersion?: string;
  
  // Rate limiting
  rateLimit?: {
    requests: number;
    period: number; // seconds
  };
  
  // Timeout
  timeout?: number; // milliseconds
  
  // Retry policy
  retry?: {
    attempts: number;
    backoff: 'linear' | 'exponential';
    delay: number; // milliseconds
  };
  
  // Custom configuration
  custom?: Record<string, unknown>;
}

// ============================================================================
// Field Mapping
// ============================================================================

export interface FieldMapping {
  id: string;
  
  // QualiFlow AI field
  qualiflowField: string;
  qualiflowType: FieldType;
  
  // External field
  externalField: string;
  externalType: string;
  
  // Mapping configuration
  direction: SyncDirection;
  isRequired: boolean;
  
  // Transformation
  transform?: FieldTransform;
  
  // Validation
  validation?: FieldValidation;
}

export type FieldType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'email'
  | 'phone'
  | 'url'
  | 'json'
  | 'array';

export interface FieldTransform {
  type: 'javascript' | 'template' | 'lookup';
  
  // JavaScript transformation
  code?: string; // e.g., "value.toUpperCase()"
  
  // Template transformation
  template?: string; // e.g., "{{firstName}} {{lastName}}"
  
  // Lookup transformation
  lookupTable?: Record<string, unknown>;
  defaultValue?: unknown;
}

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string; // regex
  min?: number;
  max?: number;
  enum?: unknown[];
}

// ============================================================================
// Sync Configuration
// ============================================================================

export interface SyncConfig {
  direction: SyncDirection;
  frequency: SyncFrequency;
  
  // Conflict resolution
  conflictResolution: ConflictResolution;
  
  // Filters
  filters?: SyncFilter[];
  
  // Batch configuration
  batchSize?: number;
  
  // Error handling
  onError: 'stop' | 'continue' | 'retry';
  
  // Notifications
  notifyOnSuccess?: boolean;
  notifyOnError?: boolean;
  notificationEmail?: string;
}

export interface SyncFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: unknown;
}

// ============================================================================
// Webhooks
// ============================================================================

export interface WebhookConfig {
  inbound: WebhookEndpoint[];
  outbound: WebhookSubscription[];
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  secret: string;
  events: string[]; // Events this webhook listens for
  isActive: boolean;
  
  // Security
  ipWhitelist?: string[];
  signatureHeader?: string;
  
  // Retry
  retryAttempts?: number;
  retryDelay?: number;
}

export interface WebhookSubscription {
  id: string;
  targetUrl: string;
  events: string[]; // Events to send to external system
  isActive: boolean;
  
  // Authentication
  auth?: {
    type: 'none' | 'basic' | 'bearer' | 'custom';
    credentials?: Record<string, string>;
  };
  
  // Payload
  payloadTemplate?: string; // Custom payload format
  headers?: Record<string, string>;
  
  // Retry
  retryAttempts?: number;
  retryDelay?: number;
}

// ============================================================================
// Sync Execution
// ============================================================================

export interface SyncExecution {
  id: string;
  integrationId: string;
  businessId: string;
  
  // Execution details
  direction: SyncDirection;
  status: 'running' | 'completed' | 'failed' | 'partial';
  
  // Results
  recordsProcessed: number;
  recordsSucceeded: number;
  recordsFailed: number;
  
  // Errors
  errors: SyncError[];
  
  // Timing
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // milliseconds
  
  // Metadata
  triggeredBy: 'manual' | 'scheduled' | 'webhook' | 'api';
  createdAt: Date;
}

export interface SyncError {
  recordId?: string;
  field?: string;
  message: string;
  code?: string;
  timestamp: Date;
}

// ============================================================================
// Supported Integrations
// ============================================================================

export const SUPPORTED_INTEGRATIONS = {
  // CRM
  HUBSPOT: 'hubspot',
  SALESFORCE: 'salesforce',
  ZOHO: 'zoho',
  PIPEDRIVE: 'pipedrive',
  GOHIGHLEVEL: 'gohighlevel',
  MONDAY: 'monday',
  CLOSE: 'close',
  FRESHSALES: 'freshsales',
  ACTIVECAMPAIGN: 'activecampaign',
  COPPER: 'copper',
  
  // Calendar
  GOOGLE_CALENDAR: 'google_calendar',
  OUTLOOK_CALENDAR: 'outlook_calendar',
  APPLE_CALENDAR: 'apple_calendar',
  CALENDLY: 'calendly',
  ACUITY: 'acuity',
  
  // Communication
  TWILIO: 'twilio',
  SENDGRID: 'sendgrid',
  MAILGUN: 'mailgun',
  POSTMARK: 'postmark',
  SLACK: 'slack',
  TEAMS: 'teams',
  
  // Analytics
  GOOGLE_ANALYTICS: 'google_analytics',
  MIXPANEL: 'mixpanel',
  SEGMENT: 'segment',
  AMPLITUDE: 'amplitude',
  
  // Payment
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
  SQUARE: 'square',
  
  // E-commerce
  SHOPIFY: 'shopify',
  WOOCOMMERCE: 'woocommerce',
  MAGENTO: 'magento',
  
  // Automation
  ZAPIER: 'zapier',
  MAKE: 'make',
} as const;

export type SupportedIntegration = typeof SUPPORTED_INTEGRATIONS[keyof typeof SUPPORTED_INTEGRATIONS];

// ============================================================================
// Integration Templates
// ============================================================================

export interface IntegrationTemplate {
  id: string;
  provider: SupportedIntegration;
  name: string;
  description: string;
  type: IntegrationType;
  
  // Pre-configured settings
  defaultConfig: Partial<IntegrationConfig>;
  defaultFieldMappings: Partial<FieldMapping>[];
  
  // Requirements
  requiredScopes?: string[];
  requiredFields?: string[];
  
  // Documentation
  setupGuide: string;
  documentationUrl: string;
  
  // Metadata
  isPopular: boolean;
  category: string;
  icon: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

export const getIntegrationsByType = (type: IntegrationType): SupportedIntegration[] => {
  const integrations: SupportedIntegration[] = [];
  
  switch (type) {
    case 'crm':
      integrations.push(
        SUPPORTED_INTEGRATIONS.HUBSPOT,
        SUPPORTED_INTEGRATIONS.SALESFORCE,
        SUPPORTED_INTEGRATIONS.ZOHO,
        SUPPORTED_INTEGRATIONS.PIPEDRIVE,
        SUPPORTED_INTEGRATIONS.GOHIGHLEVEL,
        SUPPORTED_INTEGRATIONS.MONDAY,
        SUPPORTED_INTEGRATIONS.CLOSE,
        SUPPORTED_INTEGRATIONS.FRESHSALES,
        SUPPORTED_INTEGRATIONS.ACTIVECAMPAIGN,
        SUPPORTED_INTEGRATIONS.COPPER
      );
      break;
    case 'calendar':
      integrations.push(
        SUPPORTED_INTEGRATIONS.GOOGLE_CALENDAR,
        SUPPORTED_INTEGRATIONS.OUTLOOK_CALENDAR,
        SUPPORTED_INTEGRATIONS.APPLE_CALENDAR,
        SUPPORTED_INTEGRATIONS.CALENDLY,
        SUPPORTED_INTEGRATIONS.ACUITY
      );
      break;
    // Add other types as needed
  }
  
  return integrations;
};

export const requiresEnterpriseForIntegration = (provider: SupportedIntegration): boolean => {
  const enterpriseOnly: SupportedIntegration[] = [
    SUPPORTED_INTEGRATIONS.SALESFORCE,
    SUPPORTED_INTEGRATIONS.GOHIGHLEVEL,
  ];
  return enterpriseOnly.includes(provider);
};

export const canCreateCustomIntegration = (tier: string): boolean => {
  return tier === 'enterprise';
};
