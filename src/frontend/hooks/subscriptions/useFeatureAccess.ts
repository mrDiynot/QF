/**
 * Feature Access Hook (API-Driven)
 * Checks if user's subscription plan has access to specific features
 * Uses feature keys from the API instead of hardcoded mappings
 *
 * Feature keys match the database `features.feature_key` column:
 * - Channels: voice_inbound, voice_outbound, sms, email, webchat, social_fb, social_ig, whatsapp, forms_surveys, qr_codes
 * - AI Modules: ai_voice_agents, ai_chat, ai_sms, ai_email, ai_followup, ai_qualification, ai_scoring, lead_routing
 * - Automation: prebuilt_journeys, journey_builder, ai_driven_actions, conditional_logic, multi_step_workflows
 * - Booking: smart_calendar, multi_calendar_routing, no_show_ai, booking_reminders
 * - CRM: builtin_crm, hubspot, salesforce, gohighlevel, zoho, pipedrive
 * - Platform: team_management, knowledge_base, audit_logs, api_access, custom_branding, dedicated_support
 * Note: knowledge_base is available on SmartFlow+ plans
 */

import { useCurrentSubscription, usePlans } from './useSubscriptions';
import { useMemo, useEffect, useState } from 'react';

/**
 * Feature key type - matches database feature_key values
 */
export type FeatureKey = string;

/**
 * Plan hierarchy for upgrade recommendations
 */
const PLAN_HIERARCHY = ['freeflow', 'smartflow', 'ultraflow', 'enterprise'] as const;
const PLAN_DISPLAY_NAMES: Record<string, string> = {
  freeflow: 'Free Flow',
  smartflow: 'Smart Flow',
  ultraflow: 'Ultra Flow',
  enterprise: 'Enterprise',
};

/**
 * Mapping from onboarding UI values to database feature keys
 * This maps user-facing channel names to actual feature keys in the database
 * 
 * IMPORTANT: Feature keys MUST match the database `features.feature_key` column exactly!
 * 
 * Database feature keys (from seed data):
 * - ai_email, ai_voice, ai_sms, webchat, instagram, facebook, whatsapp
 * - custom_branding, api_access, dedicated_support
 * 
 * Feature availability by plan (from database plan_features):
 * - FreeFlow: ai_email, webchat (basic tier)
 * - SmartFlow: ai_email, ai_voice, ai_sms, webchat, instagram, facebook
 * - UltraFlow: All SmartFlow + whatsapp, custom_branding, api_access
 * - Enterprise: All features + dedicated_support
 */
export const ONBOARDING_TO_FEATURE_KEY: Record<string, FeatureKey | null> = {
  // Channels (Step 6) - maps to database feature keys
  sms: 'ai_sms',                 // SmartFlow+ (ai_sms in database)
  phone: 'ai_voice',             // SmartFlow+ (ai_voice in database)
  phone_outbound: 'ai_voice',    // SmartFlow+ (uses ai_voice)
  email: 'ai_email',             // SmartFlow+ (ai_email in database) - FreeFlow has it too but limited
  web_chat: null,                // webchat available on all plans
  web_forms: null,               // Available on all plans (no restriction)
  social: 'facebook',            // SmartFlow+ (facebook in database)
  instagram: 'instagram',        // SmartFlow+ (instagram in database)
  facebook: 'facebook',          // SmartFlow+ (facebook in database)
  whatsapp: 'whatsapp',          // UltraFlow+ (whatsapp in database)

  // AI Features - maps to database feature keys
  ai_chat: null,                 // Available on all plans (webchat covers this)
  ai_sms: 'ai_sms',              // SmartFlow+
  ai_email: 'ai_email',          // SmartFlow+ (FreeFlow has limited)
  ai_voice: 'ai_voice',          // SmartFlow+
  ai_qualification: null,        // Available on all plans
  ai_scoring: null,              // Available on all plans (UI preference, not a DB feature)

  // Automation (Step 7) - All 10 pre-built journeys with feature requirements
  // FreeFlow: lead_qualification, review_survey (basic)
  // SmartFlow+: missed_call, no_show_recovery, cold_lead_revival, retention, proposal_creation, abandoned_form
  // UltraFlow+: proposal_sending (full automation), post_purchase (advanced)
  lead_qualification: null,           // Available on all plans (core feature)
  missed_call: 'ai_voice',            // SmartFlow+ (requires AI voice)
  no_show_recovery: 'ai_sms',         // SmartFlow+ (requires SMS for follow-up)
  review_survey: null,                // Available on all plans (basic feedback)
  cold_lead_revival: 'ai_email',      // SmartFlow+ (requires AI email)
  retention_reengagement: 'ai_email', // SmartFlow+ (requires AI email)
  proposal_creation: 'ai_email',      // SmartFlow+ (requires email)
  proposal_sending: 'api_access',     // UltraFlow+ (advanced automation)
  abandoned_form: 'ai_sms',           // SmartFlow+ (requires SMS for recovery)
  post_purchase: 'api_access',        // UltraFlow+ (advanced automation)
  // Legacy alias for backward compatibility
  proposal: 'ai_email',               // SmartFlow+ (legacy, maps to proposal_creation)

  // Workflows - New workflow system features
  workflows: null,                    // Available on all plans (view pre-built workflows)
  prebuilt_journeys: null,            // Available on all plans (activate pre-built workflows)
  workflow_builder: 'api_access',     // UltraFlow+ (custom workflow builder)
  custom_workflows: 'api_access',     // UltraFlow+ (create custom workflows)
  workflow_approval: 'api_access',    // UltraFlow+ (request premium workflows)
  journey_builder: 'api_access',      // UltraFlow+ (legacy alias for workflow_builder)
  conditional_logic: 'api_access',    // UltraFlow+ (advanced workflow logic)
  multi_step_workflows: null,         // Available on all plans (basic multi-step)

  // Booking - not explicitly in database, use ai_voice as proxy
  booking: 'ai_voice',           // SmartFlow+
  multi_calendar: 'api_access',  // UltraFlow+

  // CRM (Step 3) - All CRMs available on all plans for now
  hubspot: null,                 // Available on all plans
  salesforce: 'api_access',      // UltraFlow+ (enterprise CRM)
  zoho: null,                    // Available on all plans
  pipedrive: null,               // Available on all plans
  gohighlevel: 'api_access',     // UltraFlow+ (premium integration)
  builtin: null,                 // Available on all plans
  monday: null,                  // Available on all plans
  close: null,                   // Available on all plans
  freshsales: null,              // Available on all plans
  activecampaign: null,          // Available on all plans
  copper: null,                  // Available on all plans

  // Phone Setup (Step 8) - UI preferences, not DB features
  existing: null,                // Available on all plans
  qualiflow_twilio: null,        // Available on all plans (provisioning handled separately)

  // Call Handling (Step 9)
  sms_on_missed: 'ai_sms',       // SmartFlow+
  outbound_ai: 'ai_voice',       // SmartFlow+

  // Objectives (Step 5) - All available on all plans
  sales: null,                   // Available on all plans
  automation: null,              // Available on all plans
  communication: null,           // Available on all plans
  meetings: null,                // Available on all plans
  proposals: 'ai_email',         // SmartFlow+ (requires email for proposals)
  organize: null,                // Available on all plans

  // AI Tone (Step 10) - UI preferences, not DB features
  professional: null,            // Available on all plans
  friendly: null,                // Available on all plans
  casual: null,                  // Available on all plans
  enthusiastic: null,            // Available on all plans

  // Business Hours (Step 10) - UI preferences, not DB features
  '9-5': null,                   // Available on all plans
  '8-6': null,                   // Available on all plans
  '24-7': null,                  // Available on all plans
  custom: null,                  // Available on all plans

  // Follow-up Speed (Step 10) - UI preferences, not DB features
  standard: null,                // Available on all plans
  fast: null,                    // Available on all plans
  immediate: null,               // Available on all plans
};

/**
 * Hook to check if user has access to features based on their subscription
 * Uses API data (featureKeys) instead of hardcoded plan-to-feature mapping
 *
 * Priority for determining feature access:
 * 1. confirmedPlanName from sessionStorage (set after payment success, before webhook processes)
 * 2. pendingPlanId from localStorage (set during registration when user selects a paid plan)
 * 3. Current subscription from API (actual subscription in database)
 */
export const useFeatureAccess = () => {
  const { data: subscription, isLoading: subscriptionLoading } = useCurrentSubscription();
  const { data: plans, isLoading: plansLoading } = usePlans();
  const [confirmedPlanName, setConfirmedPlanName] = useState<string | null>(null);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

  // Check for confirmed plan name from payment success (webhook may not have processed yet)
  // Also check for pending plan from registration (user selected paid plan, awaiting payment)
  useEffect(() => {
    const storedConfirmedPlan = sessionStorage.getItem('confirmedPlanName');
    if (storedConfirmedPlan) {
      setConfirmedPlanName(storedConfirmedPlan);
    }

    const storedPendingPlan = localStorage.getItem('pendingPlanId');
    if (storedPendingPlan) {
      setPendingPlanId(storedPendingPlan);
      console.log('[FeatureAccess] Found pendingPlanId in localStorage:', storedPendingPlan);
    }
  }, []);

  const isLoading = subscriptionLoading || plansLoading;

  // Get current plan name - prefer confirmed plan, then pending plan, then subscription
  const currentPlanName = useMemo(() => {
    // If we have a confirmed plan from payment success, use it
    if (confirmedPlanName) {
      return confirmedPlanName.toLowerCase().replace(/\s+/g, '');
    }
    // If we have a pending plan from registration, use it (user intends to pay for this plan)
    if (pendingPlanId) {
      return pendingPlanId.toLowerCase().replace(/-/g, '');
    }
    return subscription?.planName?.toLowerCase().replace(/\s+/g, '').replace('flow', 'flow') || 'freeflow';
  }, [subscription?.planName, confirmedPlanName, pendingPlanId]);

  const isTrial = !confirmedPlanName && !pendingPlanId && subscription?.status === 'trialing';

  // Get feature keys for current subscription and track any errors
  const { currentFeatureKeys, featureAccessError } = useMemo(() => {
    // Helper to normalize plan names for comparison
    const normalizePlanName = (name: string) =>
      name.toLowerCase().replace(/[\s-_]+/g, '').replace('flow', '');

    // Priority 1: Confirmed plan from payment success (webhook may not have processed yet)
    if (confirmedPlanName && plans) {
      const normalizedConfirmed = normalizePlanName(confirmedPlanName);
      console.log('[FeatureAccess] Looking for confirmed plan:', confirmedPlanName, 'normalized:', normalizedConfirmed);

      const confirmedPlan = plans.find(p => {
        const normalizedName = normalizePlanName(p.name || '');
        const normalizedDisplay = normalizePlanName(p.displayName || '');
        return normalizedName === normalizedConfirmed ||
               normalizedDisplay === normalizedConfirmed ||
               p.name?.toLowerCase().includes(normalizedConfirmed) ||
               p.displayName?.toLowerCase().includes(normalizedConfirmed);
      });

      if (confirmedPlan?.featureKeys) {
        console.log('[FeatureAccess] Found confirmed plan:', confirmedPlan.name, 'with', confirmedPlan.featureKeys.length, 'features');
        return { currentFeatureKeys: new Set(confirmedPlan.featureKeys), featureAccessError: null };
      } else {
        console.error('[FeatureAccess] Could not find plan matching:', confirmedPlanName, 'Available plans:', plans.map(p => p.name));
        return {
          currentFeatureKeys: new Set<string>(),
          featureAccessError: `Unable to load features for your ${confirmedPlanName} plan. Please refresh the page or contact support if this persists.`
        };
      }
    }

    // Priority 2: Pending plan from registration (user selected paid plan, awaiting payment)
    // During onboarding, we want to unlock features for the plan the user intends to pay for
    if (pendingPlanId && plans) {
      const normalizedPending = normalizePlanName(pendingPlanId);
      console.log('[FeatureAccess] Looking for pending plan:', pendingPlanId, 'normalized:', normalizedPending);

      const pendingPlan = plans.find(p => {
        const normalizedName = normalizePlanName(p.name || '');
        const normalizedDisplay = normalizePlanName(p.displayName || '');
        return normalizedName === normalizedPending ||
               normalizedDisplay === normalizedPending ||
               p.name?.toLowerCase().includes(normalizedPending) ||
               p.displayName?.toLowerCase().includes(normalizedPending);
      });

      if (pendingPlan?.featureKeys) {
        console.log('[FeatureAccess] Found pending plan:', pendingPlan.name, 'with', pendingPlan.featureKeys.length, 'features');
        return { currentFeatureKeys: new Set(pendingPlan.featureKeys), featureAccessError: null };
      } else {
        console.warn('[FeatureAccess] Could not find plan matching pendingPlanId:', pendingPlanId, 'Available plans:', plans.map(p => p.name));
        // Don't error out - fall through to subscription check
      }
    }

    // Priority 3: If we have featureKeys directly from subscription, use them
    if (subscription?.featureKeys && subscription.featureKeys.length > 0) {
      console.log('[FeatureAccess] Using subscription featureKeys:', subscription.featureKeys.length, 'features');
      return { currentFeatureKeys: new Set(subscription.featureKeys), featureAccessError: null };
    }

    // Fallback: Find the plan from plans list and get its feature keys
    if (plans && subscription?.planId) {
      const currentPlan = plans.find(p => p.id === subscription.planId);
      if (currentPlan?.featureKeys) {
        console.log('[FeatureAccess] Found plan by ID:', currentPlan.name, 'with', currentPlan.featureKeys.length, 'features');
        return { currentFeatureKeys: new Set(currentPlan.featureKeys), featureAccessError: null };
      }
    }
    
    // Also try matching by planName from subscription
    if (plans && subscription?.planName) {
      const normalizedSubPlan = normalizePlanName(subscription.planName);
      const matchedPlan = plans.find(p => 
        normalizePlanName(p.name || '') === normalizedSubPlan ||
        normalizePlanName(p.displayName || '') === normalizedSubPlan
      );
      if (matchedPlan?.featureKeys) {
        console.log('[FeatureAccess] Found plan by name:', matchedPlan.name, 'with', matchedPlan.featureKeys.length, 'features');
        return { currentFeatureKeys: new Set(matchedPlan.featureKeys), featureAccessError: null };
      }
    }

    // No fallback - return empty set with error message
    // This ensures users see their actual plan features, not a default set
    if (!isLoading && (subscription || confirmedPlanName || pendingPlanId)) {
      console.error('[FeatureAccess] Could not determine features for subscription:', subscription?.planName || confirmedPlanName || pendingPlanId);
      return {
        currentFeatureKeys: new Set<string>(),
        featureAccessError: 'Unable to load your subscription features. Please refresh the page or contact support if this persists.'
      };
    }

    // Still loading - return empty set without error
    return { currentFeatureKeys: new Set<string>(), featureAccessError: null };
  }, [subscription, plans, confirmedPlanName, pendingPlanId, isLoading]);

  /**
   * Check if user has access to a specific feature by key
   */
  const hasFeatureAccess = (featureKey: FeatureKey): boolean => {
    if (!featureKey) return true; // No feature restriction
    return currentFeatureKeys.has(featureKey);
  };

  /**
   * Check if user has access by onboarding option value
   */
  const hasAccessByOption = (optionValue: string): boolean => {
    const featureKey = ONBOARDING_TO_FEATURE_KEY[optionValue];
    if (featureKey === null) return true; // No restriction
    if (featureKey === undefined) return true; // Unknown option, allow by default
    return hasFeatureAccess(featureKey);
  };

  /**
   * Get the minimum plan required for a feature
   * Returns the first plan in hierarchy that includes this feature
   */
  const getRequiredPlan = (featureKey: FeatureKey): string => {
    if (!plans || !featureKey) return 'Free Flow';

    for (const planName of PLAN_HIERARCHY) {
      const plan = plans.find(p => p.name?.toLowerCase() === planName);
      if (plan?.featureKeys?.includes(featureKey)) {
        return plan.displayName || PLAN_DISPLAY_NAMES[planName] || planName;
      }
    }

    return 'Enterprise'; // If not found, assume enterprise
  };

  /**
   * Get upgrade message for a locked feature
   */
  const getUpgradeMessage = (featureKey: FeatureKey): string => {
    const requiredPlan = getRequiredPlan(featureKey);
    return `Upgrade to ${requiredPlan} to unlock this feature`;
  };

  /**
   * Get all available feature keys for the current plan
   */
  const getAvailableFeatures = (): string[] => {
    return Array.from(currentFeatureKeys);
  };

  return {
    hasFeatureAccess,
    hasAccessByOption,
    getRequiredPlan,
    getUpgradeMessage,
    getAvailableFeatures,
    isLoading,
    currentPlan: currentPlanName,
    isTrial,
    featureKeys: currentFeatureKeys,
    /** Error message if features could not be loaded - display to user */
    error: featureAccessError,
    /** Whether there's an error loading features */
    hasError: !!featureAccessError,
  };
};

/**
 * Quick check if an onboarding option requires upgrade
 * Returns the feature key if restricted, null if freely available
 */
export const requiresUpgrade = (optionValue: string): FeatureKey | null => {
  const featureKey = ONBOARDING_TO_FEATURE_KEY[optionValue];
  // Return the feature key if it exists (for checking), null if no restriction
  return featureKey ?? null;
};

/**
 * Legacy type alias for backward compatibility
 * @deprecated Use FeatureKey instead
 */
export type PremiumFeature = FeatureKey;

