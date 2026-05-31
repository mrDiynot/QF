/**
 * AI Readiness Checklist Types
 * Defines the structure for tracking business readiness to leverage AI capabilities
 */

export type ChecklistItemStatus = 'completed' | 'in_progress' | 'pending' | 'blocked';
export type ChecklistCategoryId = 'onboarding' | 'channels' | 'ai_config' | 'knowledge' | 'leads' | 'subscription';

export interface ChecklistItem {
  id: string;
  category: ChecklistCategoryId;
  title: string;
  description: string;
  status: ChecklistItemStatus;
  importance: 'critical' | 'important' | 'recommended';
  actionUrl?: string;
  actionLabel?: string;
  completedAt?: string;
  blockedReason?: string;
}

export interface ChecklistCategoryData {
  id: ChecklistCategoryId;
  name: string;
  description: string;
  items: ChecklistItem[];
  completedCount: number;
  totalCount: number;
  isComplete: boolean;
}

export interface AIReadinessScore {
  overallScore: number; // 0-100
  categories: {
    onboarding: number;
    channels: number;
    aiConfig: number;
    knowledge: number;
    leads: number;
    subscription: number;
  };
  isFullyReady: boolean;
  blockedItems: ChecklistItem[];
  nextActions: ChecklistItem[];
}

export interface AIReadinessChecklist {
  businessId: string;
  businessName: string;
  score: AIReadinessScore;
  categories: ChecklistCategoryData[];
  lastUpdated: string;
  
  // Quick status flags
  hasCompletedOnboarding: boolean;
  hasActiveChannels: boolean;
  hasConfiguredAI: boolean;
  hasKnowledgeBase: boolean;
  hasLeads: boolean;
  hasAdequateSubscription: boolean;
}

// Checklist item definitions with requirements
export const AI_READINESS_ITEMS: Omit<ChecklistItem, 'status' | 'completedAt'>[] = [
  // ONBOARDING (Critical - Must complete first)
  {
    id: 'onboarding_complete',
    category: 'onboarding',
    title: 'Complete Onboarding Wizard',
    description: 'Complete all 10 steps of the onboarding wizard to configure your business profile',
    importance: 'critical',
    actionUrl: '/onboarding',
    actionLabel: 'Continue Onboarding',
  },
  {
    id: 'industry_selected',
    category: 'onboarding',
    title: 'Select Your Industry',
    description: 'AI uses industry context to generate relevant responses and qualify leads appropriately',
    importance: 'critical',
    actionUrl: '/onboarding?step=1',
    actionLabel: 'Select Industry',
  },
  {
    id: 'ai_tone_configured',
    category: 'onboarding',
    title: 'Configure AI Communication Style',
    description: 'Set your preferred AI tone, business hours, and follow-up preferences',
    importance: 'critical',
    actionUrl: '/settings/ai-training',
    actionLabel: 'Configure AI',
  },
  {
    id: 'team_size_set',
    category: 'onboarding',
    title: 'Set Team Size',
    description: 'Help us understand your team structure for better recommendations',
    importance: 'recommended',
    actionUrl: '/settings/system',
    actionLabel: 'Set Team Size',
  },
  {
    id: 'lead_type_configured',
    category: 'onboarding',
    title: 'Specify Lead Type',
    description: 'Define if you work with B2B, B2C, or both types of leads',
    importance: 'recommended',
    actionUrl: '/settings/system',
    actionLabel: 'Set Lead Type',
  },
  {
    id: 'crm_integrated',
    category: 'onboarding',
    title: 'Connect Your CRM',
    description: 'Sync leads with Salesforce, HubSpot, Pipedrive, or other CRM platforms',
    importance: 'recommended',
    actionUrl: '/settings/integrations',
    actionLabel: 'Connect CRM',
  },

  // CHANNEL ACTIVATION (Critical - Need at least one)
  {
    id: 'channel_activated',
    category: 'channels',
    title: 'Activate At Least One Channel',
    description: 'Activate SMS, WhatsApp, Voice, Web Chat, or another channel for AI to engage leads',
    importance: 'critical',
    actionUrl: '/channels',
    actionLabel: 'Activate Channels',
  },
  {
    id: 'phone_number_assigned',
    category: 'channels',
    title: 'Assign Phone Number',
    description: 'Get a dedicated phone number for SMS and Voice AI interactions',
    importance: 'important',
    actionUrl: '/channels/phone',
    actionLabel: 'Get Phone Number',
  },
  {
    id: 'lead_sources_configured',
    category: 'channels',
    title: 'Configure Lead Sources',
    description: 'Specify where your leads come from (website, referrals, ads, etc.)',
    importance: 'recommended',
    actionUrl: '/settings/lead-sources',
    actionLabel: 'Configure Sources',
  },
  {
    id: 'webchat_configured',
    category: 'channels',
    title: 'Configure Web Chat Widget',
    description: 'Set up and embed the AI-powered chat widget on your website',
    importance: 'recommended',
    actionUrl: '/web-chat-builder/new',
    actionLabel: 'Create Widget',
  },
  {
    id: 'form_created',
    category: 'channels',
    title: 'Create Lead Capture Form',
    description: 'Create at least one form for lead capture with AI qualification',
    importance: 'recommended',
    actionUrl: '/forms/builder',
    actionLabel: 'Create Form',
  },

  // AI CONFIGURATION (Important)
  {
    id: 'bant_weights_configured',
    category: 'ai_config',
    title: 'Configure BANT Qualification Weights',
    description: 'Customize Budget, Authority, Need, Timeline weights for your business model',
    importance: 'important',
    actionUrl: '/settings/ai-training',
    actionLabel: 'Configure BANT',
  },
  {
    id: 'qualification_threshold_set',
    category: 'ai_config',
    title: 'Set Qualification Threshold',
    description: 'Define the minimum score for a lead to be marked as qualified',
    importance: 'important',
    actionUrl: '/settings/ai-training',
    actionLabel: 'Set Threshold',
  },
  {
    id: 'ai_persona_selected',
    category: 'ai_config',
    title: 'Select AI Persona',
    description: 'Choose Professional, Friendly, Casual, or Formal communication style',
    importance: 'recommended',
    actionUrl: '/settings/ai-training',
    actionLabel: 'Select Persona',
  },
  {
    id: 'auto_response_enabled',
    category: 'ai_config',
    title: 'Enable AI Auto-Response',
    description: 'Allow AI to automatically respond to incoming messages',
    importance: 'important',
    actionUrl: '/settings/ai-training',
    actionLabel: 'Enable Auto-Response',
  },
  {
    id: 'business_hours_set',
    category: 'ai_config',
    title: 'Set Business Hours',
    description: 'Configure when your business is available for AI-assisted conversations',
    importance: 'important',
    actionUrl: '/settings/business-hours',
    actionLabel: 'Set Hours',
  },
  {
    id: 'calendar_connected',
    category: 'ai_config',
    title: 'Connect Calendar',
    description: 'Link Google Calendar or Outlook for AI-powered meeting scheduling',
    importance: 'recommended',
    actionUrl: '/settings/integrations',
    actionLabel: 'Connect Calendar',
  },

  // KNOWLEDGE BASE (Important)
  {
    id: 'business_info_complete',
    category: 'knowledge',
    title: 'Complete Business Information',
    description: 'Add company name, services, and unique value proposition for AI context',
    importance: 'important',
    actionUrl: '/settings/system',
    actionLabel: 'Update Business Info',
  },
  {
    id: 'knowledge_base_populated',
    category: 'knowledge',
    title: 'Add Knowledge Base Content',
    description: 'Upload FAQs, product info, and other content for AI to reference',
    importance: 'recommended',
    actionUrl: '/settings/knowledge-base',
    actionLabel: 'Add Content',
  },
  {
    id: 'quick_replies_configured',
    category: 'knowledge',
    title: 'Configure Quick Replies',
    description: 'Set up common responses for faster AI-assisted conversations',
    importance: 'recommended',
    actionUrl: '/settings/quick-replies',
    actionLabel: 'Add Quick Replies',
  },

  // LEADS (Important - Need data to process)
  {
    id: 'has_leads',
    category: 'leads',
    title: 'Capture Leads',
    description: 'Capture leads through forms, web chat, or channel conversations',
    importance: 'important',
    actionUrl: '/leads',
    actionLabel: 'View Leads',
  },
  {
    id: 'lead_sources_tracked',
    category: 'leads',
    title: 'Configure Lead Source Tracking',
    description: 'Set up UTM tracking and source attribution for analytics',
    importance: 'recommended',
    actionUrl: '/settings/source-tracking',
    actionLabel: 'Configure Tracking',
  },

  // SUBSCRIPTION (Critical for full AI access)
  {
    id: 'adequate_plan',
    category: 'subscription',
    title: 'Subscribe to AI-Enabled Plan',
    description: 'SmartFlow ($199/mo) or higher required for full AI capabilities',
    importance: 'critical',
    actionUrl: '/settings/subscription',
    actionLabel: 'Upgrade Plan',
  },
  {
    id: 'ai_interactions_available',
    category: 'subscription',
    title: 'AI Interactions Available',
    description: 'Ensure you have remaining AI interactions in your monthly quota',
    importance: 'critical',
    actionUrl: '/analytics/ai-usage',
    actionLabel: 'Check Usage',
  },
];

// Category metadata
export const CHECKLIST_CATEGORIES: { id: ChecklistCategoryId; name: string; description: string; weight: number }[] = [
  {
    id: 'onboarding',
    name: 'Onboarding',
    description: 'Complete initial setup to configure your business profile',
    weight: 25,
  },
  {
    id: 'channels',
    name: 'Channel Activation',
    description: 'Activate communication channels for AI engagement',
    weight: 25,
  },
  {
    id: 'ai_config',
    name: 'AI Configuration',
    description: 'Customize AI behavior and qualification settings',
    weight: 20,
  },
  {
    id: 'knowledge',
    name: 'Knowledge Base',
    description: 'Provide context for AI to give accurate responses',
    weight: 10,
  },
  {
    id: 'leads',
    name: 'Lead Pipeline',
    description: 'Have leads ready for AI qualification',
    weight: 10,
  },
  {
    id: 'subscription',
    name: 'Subscription',
    description: 'Ensure adequate plan for AI features',
    weight: 10,
  },
];
