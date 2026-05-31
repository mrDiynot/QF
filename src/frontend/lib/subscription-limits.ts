/**
 * ⚠️ DEPRECATED - DO NOT USE IN NEW CODE ⚠️
 *
 * This file contains hardcoded subscription limits and feature access configuration.
 * It has been replaced by a database-driven system to ensure consistency and accuracy.
 *
 * @deprecated Use database-driven feature access instead:
 * - For feature access: Import `useFeatureAccess` from '@/hooks/subscriptions/useFeatureAccess'
 * - For subscription info: Import `useCurrentSubscription` from '@/hooks/subscriptions/useSubscriptions'
 * - For enforcement: Import `useSubscriptionEnforcement` from '@/hooks/useSubscriptionEnforcement'
 *
 * Migration Guide: See SUBSCRIPTION_MIGRATION_GUIDE.md
 *
 * WHY DEPRECATED:
 * 1. Hardcoded values became inconsistent with database (e.g., WhatsApp: SmartFlow+ vs UltraFlow+)
 * 2. No single source of truth - changes required updates in multiple places
 * 3. Features in database (feature_keys table) didn't match this file
 * 4. Usage limits need real-time tracking from backend API, not static values
 *
 * REMOVAL TIMELINE:
 * - Sprint 2 (Current): File marked as deprecated, migration guide created
 * - Sprint 3: Remove all remaining usages
 * - Sprint 4: Delete this file completely
 *
 * Last Updated: 2025-12-27
 * Status: DEPRECATED - Scheduled for deletion
 */

export type PlanTier = 'freeflow' | 'smartflow' | 'ultraflow' | 'enterprise';

export interface PlanLimits {
  // Channel limits
  maxChannels: number;
  maxPhoneNumbers: number;
  
  // Team limits
  maxSeats: number;
  
  // Lead & CRM limits
  maxLeads: number;
  maxCrmContacts: number;
  maxDeals: number;
  
  // Workflow limits
  maxWorkflows: number;
  maxWorkflowExecutions: number;
  
  // AI limits (monthly)
  maxAiConversations: number;
  maxAiSms: number;
  maxAiVoiceMinutes: number;
  
  // Communication limits (monthly)
  maxMessages: number;
  maxEmailsSent: number;
  
  // Storage limits
  maxStorageGB: number;
  maxKnowledgeBaseMB: number;
  
  // API limits
  maxApiCalls: number;
  
  // Voice agent limits
  maxAiVoiceAgents: number;
  
  // Form limits
  maxForms: number;
  maxFormSubmissions: number;
}

export interface PlanFeatures {
  // Channel features
  smsChannel: boolean;
  voiceChannel: boolean;
  whatsappChannel: boolean;
  chatWidget: boolean;
  webForms: boolean; // Includes QR code feature
  instagramDm: boolean;
  facebookMessenger: boolean;
  emailChannel: boolean;
  
  // AI features
  aiLeadQualification: boolean;
  aiConversations: boolean;
  aiVoiceCalls: boolean;
  aiSms: boolean;
  aiEmail: boolean;
  customAiPersona: boolean;
  aiSentimentAnalysis: boolean;
  
  // CRM features
  basicCrm: boolean;
  advancedCrm: boolean;
  dealPipeline: boolean;
  customFields: boolean;
  
  // Workflow features
  basicWorkflows: boolean;
  advancedWorkflows: boolean;
  customWorkflows: boolean;
  workflowTemplates: boolean;
  
  // Integration features
  zapierIntegration: boolean;
  apiAccess: boolean;
  webhooks: boolean;
  calendarIntegration: boolean;
  
  // Analytics features
  basicAnalytics: boolean;
  advancedAnalytics: boolean;
  customReports: boolean;
  exportData: boolean;
  
  // Support features
  emailSupport: boolean;
  prioritySupport: boolean;
  dedicatedManager: boolean;
  phoneSupport: boolean;
  /** Dedicated onboarding support with 1:1 kickoff call */
  onboardingSupport: boolean;
  
  // Branding features
  removeBranding: boolean;
  customDomain: boolean;
  whiteLabel: boolean;
  
  // Security features
  sso: boolean;
  twoFactorAuth: boolean;
  auditLogs: boolean;
  ipWhitelist: boolean;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  freeflow: {
    maxChannels: 2,
    maxPhoneNumbers: 0,
    maxSeats: 1,
    maxLeads: 50,
    maxCrmContacts: 100,
    maxDeals: 10,
    maxWorkflows: 1,
    maxWorkflowExecutions: 50,
    maxAiConversations: 50,
    maxAiSms: 0,
    maxAiVoiceMinutes: 0,
    maxMessages: 100,
    maxEmailsSent: 50,
    maxStorageGB: 1,
    maxKnowledgeBaseMB: 10,
    maxApiCalls: 100,
    maxAiVoiceAgents: 0,
    maxForms: 1,
    maxFormSubmissions: 50,
  },
  smartflow: {
    maxChannels: 5,
    maxPhoneNumbers: 1,
    maxSeats: 3,
    maxLeads: 500,
    maxCrmContacts: 1000,
    maxDeals: 100,
    maxWorkflows: 5,
    maxWorkflowExecutions: 500,
    maxAiConversations: 250,
    maxAiSms: 250,
    maxAiVoiceMinutes: 100,
    maxMessages: 1000,
    maxEmailsSent: 500,
    maxStorageGB: 10,
    maxKnowledgeBaseMB: 100,
    maxApiCalls: 1000,
    maxAiVoiceAgents: 1,
    maxForms: 5,
    maxFormSubmissions: 500,
  },
  ultraflow: {
    maxChannels: 10,
    maxPhoneNumbers: 3,
    maxSeats: 10,
    maxLeads: 2000,
    maxCrmContacts: 5000,
    maxDeals: 500,
    maxWorkflows: 20,
    maxWorkflowExecutions: 2000,
    maxAiConversations: 1000,
    maxAiSms: 1000,
    maxAiVoiceMinutes: 500,
    maxMessages: 5000,
    maxEmailsSent: 2000,
    maxStorageGB: 50,
    maxKnowledgeBaseMB: 500,
    maxApiCalls: 10000,
    maxAiVoiceAgents: 3,
    maxForms: 20,
    maxFormSubmissions: 2000,
  },
  enterprise: {
    maxChannels: 999999,
    maxPhoneNumbers: 999999,
    maxSeats: 999999,
    maxLeads: 999999,
    maxCrmContacts: 999999,
    maxDeals: 999999,
    maxWorkflows: 999999,
    maxWorkflowExecutions: 999999,
    maxAiConversations: 999999,
    maxAiSms: 999999,
    maxAiVoiceMinutes: 999999,
    maxMessages: 999999,
    maxEmailsSent: 999999,
    maxStorageGB: 999999,
    maxKnowledgeBaseMB: 999999,
    maxApiCalls: 999999,
    maxAiVoiceAgents: 999999,
    maxForms: 999999,
    maxFormSubmissions: 999999,
  },
};

export const PLAN_FEATURES: Record<PlanTier, PlanFeatures> = {
  freeflow: {
    smsChannel: false,
    voiceChannel: false,
    whatsappChannel: false,
    chatWidget: true,
    webForms: true,
    instagramDm: false,
    facebookMessenger: false,
    emailChannel: false,
    aiLeadQualification: true,
    aiConversations: true,
    aiVoiceCalls: false,
    aiSms: false,
    aiEmail: false,
    customAiPersona: false,
    aiSentimentAnalysis: false,
    basicCrm: true,
    advancedCrm: false,
    dealPipeline: false,
    customFields: false,
    basicWorkflows: true,
    advancedWorkflows: false,
    customWorkflows: false,
    workflowTemplates: true,
    zapierIntegration: false,
    apiAccess: false,
    webhooks: false,
    calendarIntegration: false,
    basicAnalytics: true,
    advancedAnalytics: false,
    customReports: false,
    exportData: false,
    emailSupport: true,
    prioritySupport: false,
    dedicatedManager: false,
    phoneSupport: false,
    onboardingSupport: false,
    removeBranding: false,
    customDomain: false,
    whiteLabel: false,
    sso: false,
    twoFactorAuth: true,
    auditLogs: false,
    ipWhitelist: false,
  },
  smartflow: {
    smsChannel: true,
    voiceChannel: true,
    whatsappChannel: true,
    chatWidget: true,
    webForms: true,
    instagramDm: false,
    facebookMessenger: false,
    emailChannel: true,
    aiLeadQualification: true,
    aiConversations: true,
    aiVoiceCalls: true,
    aiSms: true,
    aiEmail: true,
    customAiPersona: true,
    aiSentimentAnalysis: false,
    basicCrm: true,
    advancedCrm: true,
    dealPipeline: true,
    customFields: true,
    basicWorkflows: true,
    advancedWorkflows: true,
    customWorkflows: false,
    workflowTemplates: true,
    zapierIntegration: true,
    apiAccess: true,
    webhooks: true,
    calendarIntegration: true,
    basicAnalytics: true,
    advancedAnalytics: true,
    customReports: false,
    exportData: true,
    emailSupport: true,
    prioritySupport: true,
    dedicatedManager: false,
    phoneSupport: false,
    onboardingSupport: false, // Available as $700 add-on
    removeBranding: true,
    customDomain: false,
    whiteLabel: false,
    sso: false,
    twoFactorAuth: true,
    auditLogs: true,
    ipWhitelist: false,
  },
  ultraflow: {
    smsChannel: true,
    voiceChannel: true,
    whatsappChannel: true,
    chatWidget: true,
    webForms: true,
    instagramDm: true,
    facebookMessenger: true,
    emailChannel: true,
    aiLeadQualification: true,
    aiConversations: true,
    aiVoiceCalls: true,
    aiSms: true,
    aiEmail: true,
    customAiPersona: true,
    aiSentimentAnalysis: true,
    basicCrm: true,
    advancedCrm: true,
    dealPipeline: true,
    customFields: true,
    basicWorkflows: true,
    advancedWorkflows: true,
    customWorkflows: true,
    workflowTemplates: true,
    zapierIntegration: true,
    apiAccess: true,
    webhooks: true,
    calendarIntegration: true,
    basicAnalytics: true,
    advancedAnalytics: true,
    customReports: true,
    exportData: true,
    emailSupport: true,
    prioritySupport: true,
    dedicatedManager: false,
    phoneSupport: true,
    onboardingSupport: true, // Included in UltraFlow
    removeBranding: true,
    customDomain: true,
    whiteLabel: false,
    sso: true,
    twoFactorAuth: true,
    auditLogs: true,
    ipWhitelist: true,
  },
  enterprise: {
    smsChannel: true,
    voiceChannel: true,
    whatsappChannel: true,
    chatWidget: true,
    webForms: true,
    instagramDm: true,
    facebookMessenger: true,
    emailChannel: true,
    aiLeadQualification: true,
    aiConversations: true,
    aiVoiceCalls: true,
    aiSms: true,
    aiEmail: true,
    customAiPersona: true,
    aiSentimentAnalysis: true,
    basicCrm: true,
    advancedCrm: true,
    dealPipeline: true,
    customFields: true,
    basicWorkflows: true,
    advancedWorkflows: true,
    customWorkflows: true,
    workflowTemplates: true,
    zapierIntegration: true,
    apiAccess: true,
    webhooks: true,
    calendarIntegration: true,
    basicAnalytics: true,
    advancedAnalytics: true,
    customReports: true,
    exportData: true,
    emailSupport: true,
    prioritySupport: true,
    dedicatedManager: true,
    phoneSupport: true,
    onboardingSupport: true, // Included in Enterprise
    removeBranding: true,
    customDomain: true,
    whiteLabel: true,
    sso: true,
    twoFactorAuth: true,
    auditLogs: true,
    ipWhitelist: true,
  },
};

/**
 * Channel type to feature key mapping
 */
export const CHANNEL_FEATURE_MAP: Record<string, keyof PlanFeatures> = {
  SMS: 'smsChannel',
  Voice: 'voiceChannel',
  WhatsApp: 'whatsappChannel',
  ChatWidget: 'chatWidget',
  WebForm: 'webForms',
  Instagram: 'instagramDm',
  Facebook: 'facebookMessenger',
};

/**
 * Get human-readable limit labels
 */
export const LIMIT_LABELS: Record<keyof PlanLimits, string> = {
  maxChannels: 'Communication Channels',
  maxPhoneNumbers: 'Phone Numbers',
  maxSeats: 'Team Seats',
  maxLeads: 'Active Leads',
  maxCrmContacts: 'CRM Contacts',
  maxDeals: 'Active Deals',
  maxWorkflows: 'Active Workflows',
  maxWorkflowExecutions: 'Workflow Executions/month',
  maxAiConversations: 'AI Conversations/month',
  maxAiSms: 'AI SMS Messages/month',
  maxAiVoiceMinutes: 'AI Voice Minutes/month',
  maxMessages: 'Messages/month',
  maxEmailsSent: 'Emails Sent/month',
  maxStorageGB: 'Storage (GB)',
  maxKnowledgeBaseMB: 'Knowledge Base (MB)',
  maxApiCalls: 'API Calls/month',
  maxAiVoiceAgents: 'AI Voice Agents',
  maxForms: 'Web Forms',
  maxFormSubmissions: 'Form Submissions/month',
};
