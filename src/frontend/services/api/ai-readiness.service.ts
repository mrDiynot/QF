/**
 * AI Readiness Service
 * Calculates and returns business readiness for AI-driven capabilities
 */

import { apiClient } from '@/lib/axios';
import type { 
  AIReadinessChecklist, 
  ChecklistItem, 
  ChecklistCategoryData,
  ChecklistCategoryId,
} from '@/types/ai-readiness';

interface BusinessReadinessData {
  onboardingComplete: boolean;
  onboardingStep: number;
  industry?: string;
  primaryGoal?: string;
  aiToneConfigured: boolean;
  activeChannels: string[];
  hasPhoneNumber: boolean;
  hasWebChat: boolean;
  hasForms: boolean;
  bantWeightsConfigured: boolean;
  qualificationThresholdSet: boolean;
  aiPersonaSelected: boolean;
  autoResponseEnabled: boolean;
  businessInfoComplete: boolean;
  knowledgeBasePopulated: boolean;
  quickRepliesConfigured: boolean;
  leadCount: number;
  leadSourcesTracked: boolean;
  subscriptionTier: string;
  subscriptionPlanName?: string;
  aiInteractionsRemaining: number;
  aiInteractionsLimit: number;
}

/**
 * Format plan name for display (e.g., "freeflow" -> "Free Flow")
 */
function formatPlanName(tier: string): string {
  const tierMap: Record<string, string> = {
    'freeflow': 'Free Flow',
    'smartflow': 'Smart Flow',
    'ultraflow': 'Ultra Flow',
    'enterprise': 'Enterprise',
  };
  return tierMap[tier.toLowerCase()] || tier;
}

/**
 * Calculate AI readiness score and checklist status
 */
function calculateReadiness(data: BusinessReadinessData): AIReadinessChecklist {
  const items: ChecklistItem[] = [];
  
  // ONBOARDING items
  items.push({
    id: 'onboarding_complete',
    category: 'onboarding',
    title: 'Complete Onboarding Wizard',
    description: 'Complete all 10 steps of the onboarding wizard to configure your business profile',
    importance: 'critical',
    actionUrl: '/onboarding',
    actionLabel: 'Continue Onboarding',
    status: data.onboardingComplete ? 'completed' : data.onboardingStep > 1 ? 'in_progress' : 'pending',
    completedAt: data.onboardingComplete ? new Date().toISOString() : undefined,
  });

  items.push({
    id: 'industry_selected',
    category: 'onboarding',
    title: 'Business Type Selected',
    description: 'AI uses industry context to generate relevant responses',
    importance: 'critical',
    actionUrl: '/settings/business-profile',
    actionLabel: 'Update Business',
    status: data.industry ? 'completed' : 'pending',
  });

  items.push({
    id: 'primary_goal_set',
    category: 'onboarding',
    title: 'Primary Goal Set',
    description: 'Your main objective guides AI recommendations and priorities',
    importance: 'critical',
    actionUrl: '/settings/business-profile?section=goals',
    actionLabel: 'Set Goal',
    status: data.primaryGoal ? 'completed' : 'pending',
  });

  items.push({
    id: 'ai_tone_configured',
    category: 'onboarding',
    title: 'Configure AI Communication Style',
    description: 'Set your preferred AI tone and follow-up preferences',
    importance: 'critical',
    actionUrl: '/settings/ai-training',
    actionLabel: 'Configure AI',
    status: data.aiToneConfigured ? 'completed' : 'pending',
  });

  // CHANNEL items
  items.push({
    id: 'channel_activated',
    category: 'channels',
    title: 'Activate At Least One Channel',
    description: 'Activate SMS, WhatsApp, Voice, Web Chat, or another channel',
    importance: 'critical',
    actionUrl: '/channels',
    actionLabel: 'Activate Channels',
    status: data.activeChannels.length > 0 ? 'completed' : 'pending',
  });

  items.push({
    id: 'phone_number_assigned',
    category: 'channels',
    title: 'Assign Phone Number',
    description: 'Get a dedicated phone number for SMS and Voice',
    importance: 'important',
    actionUrl: '/channels?setup=sms',
    actionLabel: 'Get Phone Number',
    status: data.hasPhoneNumber ? 'completed' : 'pending',
  });

  items.push({
    id: 'webchat_configured',
    category: 'channels',
    title: 'Configure Web Chat Widget',
    description: 'Set up the AI-powered chat widget for your website',
    importance: 'recommended',
    actionUrl: '/web-chat-builder',
    actionLabel: 'Create Widget',
    status: data.hasWebChat ? 'completed' : 'pending',
  });

  items.push({
    id: 'form_created',
    category: 'channels',
    title: 'Create Lead Capture Form',
    description: 'Create at least one form for lead capture',
    importance: 'recommended',
    actionUrl: '/forms',
    actionLabel: 'Create Form',
    status: data.hasForms ? 'completed' : 'pending',
  });

  // AI CONFIG items
  items.push({
    id: 'bant_weights_configured',
    category: 'ai_config',
    title: 'Configure BANT Qualification Weights',
    description: 'Customize Budget, Authority, Need, Timeline weights',
    importance: 'important',
    actionUrl: '/settings/ai-training',
    actionLabel: 'Configure BANT',
    status: data.bantWeightsConfigured ? 'completed' : 'pending',
  });

  items.push({
    id: 'qualification_threshold_set',
    category: 'ai_config',
    title: 'Set Qualification Threshold',
    description: 'Define minimum score for qualified leads',
    importance: 'important',
    actionUrl: '/settings/ai-training',
    actionLabel: 'Set Threshold',
    status: data.qualificationThresholdSet ? 'completed' : 'pending',
  });

  items.push({
    id: 'ai_persona_selected',
    category: 'ai_config',
    title: 'Select AI Persona',
    description: 'Choose Professional, Friendly, Casual, or Formal style',
    importance: 'recommended',
    actionUrl: '/settings/ai-training',
    actionLabel: 'Select Persona',
    status: data.aiPersonaSelected ? 'completed' : 'pending',
  });

  items.push({
    id: 'auto_response_enabled',
    category: 'ai_config',
    title: 'Enable AI Auto-Response',
    description: 'Allow AI to automatically respond to messages',
    importance: 'important',
    actionUrl: '/settings/ai-training',
    actionLabel: 'Enable Auto-Response',
    status: data.autoResponseEnabled ? 'completed' : 'pending',
  });

  // KNOWLEDGE items
  items.push({
    id: 'business_info_complete',
    category: 'knowledge',
    title: 'Complete Business Information',
    description: 'Add company details for AI context',
    importance: 'important',
    actionUrl: '/settings/system',
    actionLabel: 'Update Business Info',
    status: data.businessInfoComplete ? 'completed' : 'pending',
  });

  items.push({
    id: 'knowledge_base_populated',
    category: 'knowledge',
    title: 'Add Knowledge Base Content',
    description: 'Upload FAQs and product info for AI reference',
    importance: 'recommended',
    actionUrl: '/settings/knowledge-base',
    actionLabel: 'Add Content',
    status: data.knowledgeBasePopulated ? 'completed' : 'pending',
  });

  items.push({
    id: 'quick_replies_configured',
    category: 'knowledge',
    title: 'Configure Quick Replies',
    description: 'Set up common responses for faster conversations',
    importance: 'recommended',
    actionUrl: '/settings/quick-replies',
    actionLabel: 'Add Quick Replies',
    status: data.quickRepliesConfigured ? 'completed' : 'pending',
  });

  // LEADS items
  items.push({
    id: 'has_leads',
    category: 'leads',
    title: 'Capture Leads',
    description: 'Capture leads through forms, web chat, or channel conversations',
    importance: 'important',
    actionUrl: '/leads',
    actionLabel: 'View Leads',
    status: data.leadCount > 0 ? 'completed' : 'pending',
  });

  items.push({
    id: 'lead_sources_tracked',
    category: 'leads',
    title: 'Configure Lead Source Tracking',
    description: 'Set up UTM tracking for analytics',
    importance: 'recommended',
    actionUrl: '/settings/ai-training',
    actionLabel: 'Configure Tracking',
    status: data.leadSourcesTracked ? 'completed' : 'pending',
  });

  // SUBSCRIPTION items
  const isPaidPlan = ['smartflow', 'ultraflow', 'enterprise'].includes(data.subscriptionTier.toLowerCase());
  const planDisplayName = data.subscriptionPlanName || formatPlanName(data.subscriptionTier);
  
  // Dynamic title and description based on actual subscription
  const subscriptionTitle = isPaidPlan 
    ? `Active Plan: ${planDisplayName}` 
    : 'Subscribe to AI-Enabled Plan';
  const subscriptionDescription = isPaidPlan 
    ? `Your ${planDisplayName} plan includes full AI capabilities` 
    : 'SmartFlow ($199/mo) or higher required for full AI capabilities';
  
  items.push({
    id: 'adequate_plan',
    category: 'subscription',
    title: subscriptionTitle,
    description: subscriptionDescription,
    importance: 'critical',
    actionUrl: '/settings/subscription',
    actionLabel: isPaidPlan ? 'Manage Plan' : 'Upgrade Plan',
    status: isPaidPlan ? 'completed' : 'blocked',
    blockedReason: !isPaidPlan ? 'Free tier has limited AI capabilities' : undefined,
  });

  items.push({
    id: 'ai_interactions_available',
    category: 'subscription',
    title: 'AI Interactions Available',
    description: 'Ensure remaining AI interactions in quota',
    importance: 'critical',
    actionUrl: '/analytics/ai-usage',
    actionLabel: 'Check Usage',
    status: data.aiInteractionsRemaining > 0 ? 'completed' : 'blocked',
    blockedReason: data.aiInteractionsRemaining <= 0 ? 'No AI interactions remaining' : undefined,
  });

  // Calculate category scores
  const categoryMap: Record<ChecklistCategoryId, { name: string; description: string; weight: number }> = {
    onboarding: { name: 'Onboarding', description: 'Complete initial setup', weight: 25 },
    channels: { name: 'Channel Activation', description: 'Activate communication channels', weight: 25 },
    ai_config: { name: 'AI Configuration', description: 'Customize AI behavior', weight: 20 },
    knowledge: { name: 'Knowledge Base', description: 'Provide AI context', weight: 10 },
    leads: { name: 'Lead Pipeline', description: 'Have leads for qualification', weight: 10 },
    subscription: { name: 'Subscription', description: 'Adequate plan for AI', weight: 10 },
  };

  const categories: ChecklistCategoryData[] = (Object.keys(categoryMap) as ChecklistCategoryId[]).map(catId => {
    const catItems = items.filter(i => i.category === catId);
    const completedCount = catItems.filter(i => i.status === 'completed').length;
    return {
      id: catId,
      name: categoryMap[catId].name,
      description: categoryMap[catId].description,
      items: catItems,
      completedCount,
      totalCount: catItems.length,
      isComplete: completedCount === catItems.length,
    };
  });

  // Calculate scores
  const categoryScores = {
    onboarding: calculateCategoryScore(categories.find(c => c.id === 'onboarding')!),
    channels: calculateCategoryScore(categories.find(c => c.id === 'channels')!),
    aiConfig: calculateCategoryScore(categories.find(c => c.id === 'ai_config')!),
    knowledge: calculateCategoryScore(categories.find(c => c.id === 'knowledge')!),
    leads: calculateCategoryScore(categories.find(c => c.id === 'leads')!),
    subscription: calculateCategoryScore(categories.find(c => c.id === 'subscription')!),
  };

  const overallScore = Math.round(
    categoryScores.onboarding * 0.25 +
    categoryScores.channels * 0.25 +
    categoryScores.aiConfig * 0.20 +
    categoryScores.knowledge * 0.10 +
    categoryScores.leads * 0.10 +
    categoryScores.subscription * 0.10
  );

  const blockedItems = items.filter(i => i.status === 'blocked');
  const pendingCritical = items.filter(i => i.status === 'pending' && i.importance === 'critical');
  const pendingImportant = items.filter(i => i.status === 'pending' && i.importance === 'important');
  const pendingRecommended = items.filter(i => i.status === 'pending' && i.importance === 'recommended');
  const allPendingItems = [...pendingCritical, ...pendingImportant, ...pendingRecommended];
  const nextActions = allPendingItems.slice(0, 5);

  // isFullyReady only when score is 100% AND no pending/blocked items
  const isFullyReady = overallScore >= 100 && blockedItems.length === 0 && allPendingItems.length === 0;

  return {
    businessId: '',
    businessName: '',
    score: {
      overallScore,
      categories: categoryScores,
      isFullyReady,
      blockedItems,
      nextActions,
    },
    categories,
    lastUpdated: new Date().toISOString(),
    hasCompletedOnboarding: data.onboardingComplete,
    hasActiveChannels: data.activeChannels.length > 0,
    hasConfiguredAI: data.bantWeightsConfigured && data.autoResponseEnabled,
    hasKnowledgeBase: data.knowledgeBasePopulated,
    hasLeads: data.leadCount > 0,
    hasAdequateSubscription: isPaidPlan,
  };
}

function calculateCategoryScore(category: ChecklistCategoryData): number {
  if (category.totalCount === 0) return 100;
  return Math.round((category.completedCount / category.totalCount) * 100);
}

export const aiReadinessService = {
  /**
   * Get AI readiness checklist for current business
   */
  getReadinessChecklist: async (): Promise<AIReadinessChecklist> => {
    const response = await apiClient.get<AIReadinessChecklist>('/ai-readiness/checklist');
    return response.data;
  },

  /**
   * Calculate readiness from local data (fallback when API unavailable)
   */
  calculateLocalReadiness: (data: BusinessReadinessData): AIReadinessChecklist => {
    return calculateReadiness(data);
  },

  /**
   * Get quick readiness score
   */
  getQuickScore: async (): Promise<{ score: number; isReady: boolean; nextAction?: ChecklistItem }> => {
    const response = await apiClient.get<{ score: number; isReady: boolean; nextAction?: ChecklistItem }>(
      '/ai-readiness/quick-score'
    );
    return response.data;
  },
};

export default aiReadinessService;
