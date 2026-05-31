'use client';

/**
 * Onboarding Wizard Container
 * Professional, personalized onboarding experience
 * Features: Business name display, user greeting, subscription info, progress tracking
 * Integrated with backend APIs for data persistence
 * Includes analytics tracking for onboarding funnel
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, AlertTriangle, Clock, Building2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/shared/logo';
import { ProgressIndicator } from './ProgressIndicator';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AIBackgroundAnimation } from './AIBackgroundAnimation';
import { EnhancedStep1Industry } from './EnhancedStep1Industry';
import { Step2Goals } from './Step2Goals';
import { Step3LeadSources } from './Step3LeadSources';
import { Step6Channels } from './Step6Channels';
import { Step4LeadType } from './Step4LeadType';
import { Step3CRM } from './Step3CRM';
import { Step2TeamSize } from './Step2TeamSize';
import { Step8PhoneSetup } from './Step8PhoneSetup';
import { Step9BusinessHours } from './Step9BusinessHours';
import { Step10Calendar } from './Step10Calendar';
import { Step11OnboardingSupport } from './Step11OnboardingSupport';
import { OnboardingCelebration } from './OnboardingCelebration';
import { AIRecommendationsPanel } from './AIRecommendationsPanel';
import { OnboardingFormData } from '@/types/onboarding';
import { GradientButton } from '@/components/shared/gradient-button';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalBody,
  ModalTitle,
  ModalFooter,
} from '@/components/modals';
import {
  useBusinessProfile,
  useChannelSetup,
  useAIConfiguration,
  useCompleteOnboarding,
  useSkipOnboarding,
  useOnboardingStatus,
  useSaveStepProgress,
} from '@/hooks/onboarding/useOnboarding';
import { useOnboardingCheckout } from '@/hooks/onboarding/useOnboardingCheckout';
import { usePlans, useCurrentSubscription } from '@/hooks/subscriptions/useSubscriptions';
import { useOnboardingValidation } from '@/hooks/onboarding/useOnboardingValidation';
import { useOfflineResilience, useNetworkStatus } from '@/hooks/onboarding/useOfflineResilience';
import { ValidationSummary } from './shared/ValidationError';
import { SubscriptionBanner } from './shared/SubscriptionBanner';
import { toast } from 'sonner';
import { subscriptionsService } from '@/services/api/subscriptions.service';
import { onboardingService } from '@/services/api/onboarding.service';

/** Steps that trigger backend API calls */
const BUSINESS_PROFILE_STEP = 7; // After team size (steps 1-7: business info)
const CHANNEL_SETUP_STEP = 4; // After channels (steps 3-4: lead sources & channels)
const AI_CONFIG_STEP = 10; // After calendar (steps 8-10: phone, hours, calendar)
const ONBOARDING_SUPPORT_STEP = 11; // Optional step - only shown for plans with optional onboarding

export function OnboardingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showResumePaymentDialog, setShowResumePaymentDialog] = useState(false);
  const [pendingPlanName, setPendingPlanName] = useState<string | null>(null);
  const [isResumingPayment, setIsResumingPayment] = useState(false);
  const [isActivatingFreeTier, setIsActivatingFreeTier] = useState(false);
  // Track if we're handling a cancelled checkout (prevents redirect loop)
  const [isHandlingCancelledCheckout, setIsHandlingCancelledCheckout] = useState(() => {
    // Initialize from session storage (set by onboarding layout)
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('handlingCancelledCheckout') === 'true';
    }
    return false;
  });
  const [formData, setFormData] = useState<OnboardingFormData>({
    // Step 1: Business Type
    businessType: '',
    industry: '', // backward compat
    // Step 2: Goals (multi-select)
    goals: [],
    objective: '', // backward compat
    // Step 3: Lead Capture Sources
    leadCaptureSources: [],
    // Step 4: Channels
    channels: [],
    // Step 5: Lead Type
    leadType: '',
    // Step 6: CRM
    crm: '',
    // Step 7: Team Size
    teamSize: '',
    // Step 8: Phone Setup
    phoneSetup: { type: '' },
    // Step 9: Business Hours
    businessHours: null,
    // Step 10: Calendar
    calendarProvider: '',
    // Step 11: Onboarding Support
    onboardingSupport: { wantsSupport: false },
    // Legacy fields for backward compat
    automations: [],
    callHandling: { sendSMSOnMissed: false, enableOutboundAI: false },
    finalTouches: { aiTone: '', enableAutoResponse: false },
  });

  // AI Recommendations Panel state
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [hasShownAIRecommendations, setHasShownAIRecommendations] = useState(false);

  // Backend integration hooks
  const { data: onboardingStatus, isLoading: isLoadingStatus } = useOnboardingStatus();
  const businessProfileMutation = useBusinessProfile();
  const channelSetupMutation = useChannelSetup();
  const aiConfigMutation = useAIConfiguration();
  const completeOnboardingMutation = useCompleteOnboarding({ skipRedirect: true });
  const skipOnboardingMutation = useSkipOnboarding();
  const saveStepProgressMutation = useSaveStepProgress();

  // Payment/checkout integration
  const checkout = useOnboardingCheckout();
  const { data: plans } = usePlans();
  const { data: subscription } = useCurrentSubscription();

  // Analytics
  const { track } = useAnalytics();
  const hasTrackedStart = useRef(false);
  const hasCheckedPaymentCanceled = useRef(false);

  // Form validation
  const validation = useOnboardingValidation(formData);

  /**
   * Determine if onboarding support step should be shown based on plan configuration
   * API-driven: Uses plan's onboardingPrice and onboardingRequired from backend
   *
   * Plan Onboarding Configuration (from CMS/API):
   * - Free Flow: onboardingPrice = null → No onboarding available, skip Step 11
   * - Smart Flow: onboardingRequired = false, onboardingPrice = $700 → Show Step 11, user chooses
   * - Ultra Flow: onboardingRequired = true, onboardingPrice = $1500 → Skip Step 11, auto-add to checkout (mandatory)
   * - Enterprise: onboardingPrice = null → Custom handling, skip Step 11
   *
   * Key distinction:
   * - onboardingRequired = true means onboarding is MANDATORY (must pay), not free/included
   * - We skip Step 11 for required plans because the user has no choice - it's auto-added at checkout
   */
  const { showOnboardingStep, currentPlanOnboardingPrice, isOnboardingRequired } = useMemo(() => {
    // Check for confirmed plan name from payment success (webhook may not have processed yet)
    const confirmedPlanName = typeof window !== 'undefined'
      ? sessionStorage.getItem('confirmedPlanName')
      : null;

    // Get the effective plan name (confirmed from payment or from subscription)
    const effectivePlanName = confirmedPlanName || subscription?.planName;

    // Find the plan in the plans list to get onboarding configuration
    const currentPlan = plans?.find(p =>
      p.name.toLowerCase() === effectivePlanName?.toLowerCase().replace(/\s+/g, '') ||
      p.displayName.toLowerCase() === effectivePlanName?.toLowerCase()
    );

    // If we can't find the plan, default to showing the step (safe fallback)
    if (!currentPlan) {
      return { showOnboardingStep: true, currentPlanOnboardingPrice: undefined, isOnboardingRequired: false };
    }

    // If onboarding is required (mandatory purchase), skip Step 11 - auto-add at checkout
    // User has no choice, onboarding will be added to their checkout automatically
    if (currentPlan.onboardingRequired) {
      return { showOnboardingStep: false, currentPlanOnboardingPrice: currentPlan.onboardingPrice, isOnboardingRequired: true };
    }

    // If there's an optional onboarding price, show Step 11 so user can choose
    if (currentPlan.onboardingPrice && currentPlan.onboardingPrice > 0) {
      return { showOnboardingStep: true, currentPlanOnboardingPrice: currentPlan.onboardingPrice, isOnboardingRequired: false };
    }

    // No onboarding available (Free Flow, Enterprise), don't show the step
    return { showOnboardingStep: false, currentPlanOnboardingPrice: undefined, isOnboardingRequired: false };
  }, [plans, subscription?.planName]);

  // Calculate dynamic total steps based on whether onboarding step is shown
  const TOTAL_STEPS = showOnboardingStep ? 11 : 10;
  const FINAL_STEP = TOTAL_STEPS;

  // Average time per step in minutes
  const TIME_PER_STEP = 0.5;

  // Step descriptions for context - dynamically adjusted based on total steps
  const STEP_INFO = useMemo((): Record<number, { title: string; description: string; phase: string }> => {
    const baseSteps: Record<number, { title: string; description: string; phase: string }> = {
      1: { title: 'Business Type', description: 'Tell us about your business', phase: 'Business Profile' },
      2: { title: 'Goals', description: 'What do you want to achieve?', phase: 'Business Profile' },
      3: { title: 'Lead Sources', description: 'Where do your leads come from?', phase: 'Lead Capture' },
      4: { title: 'Channels', description: 'Choose communication channels', phase: 'Lead Capture' },
      5: { title: 'Lead Types', description: 'B2B, B2C, or both?', phase: 'Business Profile' },
      6: { title: 'CRM', description: 'Connect your existing tools', phase: 'Business Profile' },
      7: { title: 'Team Size', description: 'How big is your team?', phase: 'Business Profile' },
      8: { title: 'Phone Setup', description: 'Set up voice and SMS', phase: 'Configuration' },
      9: { title: 'Business Hours', description: 'When are you available?', phase: 'Configuration' },
      10: { title: 'Calendar', description: 'Connect your calendar', phase: showOnboardingStep ? 'Configuration' : 'Complete' },
    };

    if (showOnboardingStep) {
      baseSteps[11] = { title: 'Onboarding Support', description: 'Get help with setup', phase: 'Complete' };
    }

    return baseSteps;
  }, [showOnboardingStep]);

  // Get user data from sessionStorage (set during registration)
  const userData = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const userStr = sessionStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as {
        id?: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        businessId?: string;
        businessName?: string;
      };
    } catch {
      return null;
    }
  }, []);

  // Derived user display values
  const userFirstName = userData?.firstName || 'there';

  // Get business name - prioritize pendingCompanyName from OAuth registration
  const pendingCompanyName = typeof window !== 'undefined' ? sessionStorage.getItem('pendingCompanyName') : null;
  const businessName = pendingCompanyName || onboardingStatus?.businessName || userData?.businessName || 'Your Business';
  const hasValidBusinessName = businessName &&
    businessName.trim() !== '' &&
    !businessName.toLowerCase().includes('your business') &&
    !businessName.toLowerCase().includes('(oauth)'); // Exclude default OAuth names
  const displayBusinessName = hasValidBusinessName ? businessName : null;
  const userInitials = userData?.firstName && userData?.lastName
    ? `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase()
    : userData?.email?.[0]?.toUpperCase() || 'U';
  const userEmail = userData?.email || '';

  // Calculate estimated time remaining
  const stepsRemaining = TOTAL_STEPS - currentStep + 1;
  const estimatedMinutes = Math.ceil(stepsRemaining * TIME_PER_STEP);
  const currentStepInfo = STEP_INFO[currentStep];

  // Callback to restore saved data from localStorage
  // Only restore if the backend confirms we're mid-onboarding (currentStep > 1)
  const handleRestoreData = useCallback((savedFormData: OnboardingFormData, savedStep: number) => {
    // Only restore if backend status indicates we're in progress (not a fresh start)
    // This prevents restoring stale data when onboarding was reset
    if (onboardingStatus && onboardingStatus.currentStep > 1 && !onboardingStatus.isComplete) {
      setFormData(savedFormData);
      setCurrentStep(savedStep);
    }
  }, [onboardingStatus]);

  // Offline resilience - save form data locally and restore on mount
  const { clearSavedData } = useOfflineResilience(formData, currentStep, handleRestoreData);

  // Clear localStorage when starting fresh onboarding (backend says step 1)
  useEffect(() => {
    if (onboardingStatus && onboardingStatus.currentStep === 1 && !onboardingStatus.isComplete && !onboardingStatus.isSkipped) {
      // Fresh onboarding - clear any stale localStorage data
      clearSavedData();
    }
  }, [onboardingStatus, clearSavedData]);

  // Network status for offline indicator
  const [isOffline, setIsOffline] = useState(false);
  useNetworkStatus(
    () => setIsOffline(false), // onOnline
    () => setIsOffline(true)   // onOffline
  );

  // Helper to clear the cancelled checkout state (session storage + local state)
  // Defined early so it can be used in useEffect hooks
  const clearCancelledCheckoutState = useCallback(() => {
    sessionStorage.removeItem('handlingCancelledCheckout');
    setIsHandlingCancelledCheckout(false);
  }, []);

  // Track onboarding started (only once)
  useEffect(() => {
    if (!hasTrackedStart.current && !isLoadingStatus) {
      hasTrackedStart.current = true;
      track('onboarding_started', { step: 1 });
    }
  }, [isLoadingStatus, track]);

  // Handle payment_canceled or checkout_cancelled query parameter - show resume payment dialog
  useEffect(() => {
    if (hasCheckedPaymentCanceled.current) return;

    const paymentCanceled = searchParams.get('payment_canceled');
    const checkoutCancelled = searchParams.get('checkout_cancelled');
    const planFromUrl = searchParams.get('plan');

    if (paymentCanceled === 'true' || checkoutCancelled === 'true') {
      hasCheckedPaymentCanceled.current = true;

      // Check localStorage first for pending plan (synchronous check)
      const pendingPlanId = localStorage.getItem('pendingPlanId');

      // If there's a pending plan in localStorage, show the dialog immediately
      // This prevents race conditions with the async API call
      if (pendingPlanId) {
        const displayName = pendingPlanId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        setPendingPlanName(displayName);
        setShowResumePaymentDialog(true);
        track('payment_canceled_dialog_shown', {
          planName: pendingPlanId,
          planDisplayName: displayName,
          source: checkoutCancelled ? 'onboarding_checkout' : 'registration',
        });
      } else if (planFromUrl) {
        // Fallback to URL param
        setPendingPlanName(planFromUrl);
        setShowResumePaymentDialog(true);
      } else {
        // No pending plan - clear state and let user proceed to dashboard
        console.log('[Onboarding] No pending payment intent found, redirecting to dashboard');
        clearCancelledCheckoutState();
        window.location.href = '/dashboard';
        return;
      }

      // Clean up URL immediately
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('payment_canceled');
      newUrl.searchParams.delete('checkout_cancelled');
      newUrl.searchParams.delete('plan');
      window.history.replaceState({}, '', newUrl.toString());

      // NOTE: Don't clear isHandlingCancelledCheckout here - wait until dialog is dismissed
      // This prevents the redirect to dashboard while dialog is shown
    }
  }, [searchParams, track, clearCancelledCheckoutState]);

  // Handle resume payment
  const handleResumePayment = async () => {
    setIsResumingPayment(true);
    try {
      const pendingIntent = await subscriptionsService.getPendingIntent();
      if (!pendingIntent) {
        toast.error('No pending payment found. Please select a plan from Settings.');
        setShowResumePaymentDialog(false);
        return;
      }

      const checkoutResponse = await subscriptionsService.createCheckoutSession({
        planId: pendingIntent.planName,
        billingInterval: pendingIntent.billingInterval,
        includeOnboarding: pendingIntent.includeOnboarding,
        successUrl: `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/onboarding?payment_canceled=true&plan=${pendingIntent.planName}`,
      });

      track('payment_resumed', {
        planName: pendingIntent.planName,
        billingInterval: pendingIntent.billingInterval,
      });

      window.location.href = checkoutResponse.checkoutUrl;
    } catch (error) {
      console.error('Failed to resume payment:', error);
      toast.error('Failed to resume payment. Please try again from Settings.');
      setShowResumePaymentDialog(false);
      clearCancelledCheckoutState();
    } finally {
      setIsResumingPayment(false);
    }
  };

  // Handle continue with free tier (when user cancels payment and chooses free plan)
  const handleContinueWithFreeTier = async () => {
    setIsActivatingFreeTier(true);
    try {
      // Clear the pending plan from localStorage
      localStorage.removeItem('pendingPlanId');
      localStorage.removeItem('pendingBillingInterval');

      // Activate free tier with trial - API will complete onboarding and send welcome email
      await onboardingService.completeWithFreeTier();

      track('free_tier_activated', {
        previousPendingPlan: pendingPlanName,
        source: 'cancelled_checkout_dialog',
      });

      toast.success('Welcome! You\'re now on the free plan. You can upgrade anytime from Settings.');
      setShowResumePaymentDialog(false);
      clearCancelledCheckoutState();
      setShowCelebration(true);
    } catch (error) {
      console.error('Failed to activate free tier:', error);
      toast.error('Failed to activate free plan. Please try again.');
    } finally {
      setIsActivatingFreeTier(false);
    }
  };

  // Check if returning from checkout success (need to show celebration)
  const isReturningFromCheckoutSuccess = typeof window !== 'undefined' &&
    (new URLSearchParams(window.location.search).get('checkout_success') === 'true' ||
     sessionStorage.getItem('paymentConfirmed') === 'true');

  // Redirect to dashboard if onboarding is already complete or skipped
  // BUT skip redirect if we're showing the celebration screen or handling cancelled checkout
  useEffect(() => {
    // Don't redirect if we're showing the celebration screen
    if (showCelebration) return;

    // Don't redirect if we're handling a cancelled checkout (show Resume Payment Dialog)
    if (isHandlingCancelledCheckout) return;

    // Don't redirect if we're showing the resume payment dialog
    if (showResumePaymentDialog) return;

    // Don't redirect if we're returning from checkout success - need to show celebration!
    // This gives the checkout verification time to complete
    if (isReturningFromCheckoutSuccess) {
      console.log('[OnboardingWizard] Returning from checkout success, waiting for verification...');
      return;
    }

    if (onboardingStatus?.isComplete || onboardingStatus?.isSkipped) {
      // User has already completed or skipped onboarding, redirect to dashboard
      window.location.href = '/dashboard';
    }
  }, [onboardingStatus, showCelebration, isHandlingCancelledCheckout, showResumePaymentDialog, isReturningFromCheckoutSuccess]);

  // Resume from saved progress
  useEffect(() => {
    if (onboardingStatus && !onboardingStatus.isComplete && !onboardingStatus.isSkipped && onboardingStatus.currentStep > 1) {
      setCurrentStep(onboardingStatus.currentStep);
    }
  }, [onboardingStatus]);

  // Check if any mutation is in progress
  const isSaving =
    businessProfileMutation.isPending ||
    channelSetupMutation.isPending ||
    aiConfigMutation.isPending ||
    completeOnboardingMutation.isPending ||
    skipOnboardingMutation.isPending;

  /**
   * Save business profile data to backend (Steps 1-7)
   * Sends: businessType, goals, leadType, crm, teamSize
   */
  const saveBusinessProfile = useCallback(async () => {
    const pendingCompanyName = typeof window !== 'undefined'
      ? sessionStorage.getItem('pendingCompanyName') || ''
      : '';

    await businessProfileMutation.mutateAsync({
      companyName: pendingCompanyName,
      industry: formData.businessType || formData.industry || 'other', // Use new field with fallback
      companySize: formData.teamSize || 'just_me',
      timezone: formData.businessHours?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      crmPlatform: formData.crm || undefined,
      leadType: formData.leadType || undefined,
      mainObjective: formData.goals.length > 0 ? formData.goals[0] : (formData.objective || undefined),
    });

    if (pendingCompanyName) {
      sessionStorage.removeItem('pendingCompanyName');
    }
  }, [businessProfileMutation, formData.businessType, formData.industry, formData.teamSize, formData.crm, formData.leadType, formData.goals, formData.objective, formData.businessHours]);

  /**
   * Save channel setup data to backend (Steps 3-4)
   * Sends: lead capture sources and communication channels
   */
  const saveChannelSetup = useCallback(async () => {
    await channelSetupMutation.mutateAsync({
      channels: formData.channels.map(channel => ({
        type: channel,
        enabled: true,
      })),
      automations: formData.automations || [],
    });
  }, [channelSetupMutation, formData.channels, formData.automations]);

  /**
   * Save AI configuration to backend (Steps 8-10)
   * Sends: phone setup, business hours, calendar provider
   */
  const saveAIConfiguration = useCallback(async () => {
    await aiConfigMutation.mutateAsync({
      budget: 25,
      authority: 25,
      need: 25,
      timeline: 25,
      phoneSetup: formData.phoneSetup.type ? {
        type: formData.phoneSetup.type,
      } : undefined,
      callHandling: {
        forwardNumber: formData.callHandling?.forwardNumber,
        sendSmsOnMissed: formData.callHandling?.sendSMSOnMissed ?? false,
        enableOutboundAi: formData.callHandling?.enableOutboundAI ?? false,
      },
      persona: formData.finalTouches?.aiTone || 'professional',
      businessHours: formData.businessHours ? JSON.stringify(formData.businessHours) : undefined,
      calendarProvider: formData.calendarProvider || undefined,
      enableAutoResponse: formData.finalTouches?.enableAutoResponse ?? false,
    });
  }, [aiConfigMutation, formData.phoneSetup, formData.callHandling, formData.finalTouches, formData.businessHours, formData.calendarProvider]);

  /**
   * Complete onboarding - redirects to payment if required, otherwise shows celebration
   * Per requirements: celebration only shown after successful payment
   *
   * Onboarding support handling (API-driven):
   * - If isOnboardingRequired (Ultra Flow): onboarding is mandatory, auto-add to checkout
   * - If showOnboardingStep was true: user chose whether to add optional support (Smart Flow)
   * - If no onboarding available (Free Flow, Enterprise): no support option
   */
  const handleComplete = useCallback(async () => {
    // CRITICAL: Read localStorage DIRECTLY here to avoid stale closure issues
    // The checkout hook state might be stale due to React's closure capture
    const pendingPlanIdFromStorage = typeof window !== 'undefined'
      ? localStorage.getItem('pendingPlanId')
      : null;
    const pendingBillingIntervalFromStorage = (typeof window !== 'undefined'
      ? localStorage.getItem('pendingBillingInterval')
      : 'monthly') || 'monthly';
    const pendingIncludeOnboardingFromStorage = typeof window !== 'undefined'
      ? localStorage.getItem('pendingIncludeOnboarding') === 'true'
      : false;
    const hasPendingPaidPlan = pendingPlanIdFromStorage !== null && pendingPlanIdFromStorage !== 'free-flow';

    // Debug: Log both checkout state AND fresh localStorage values
    console.log('[OnboardingWizard] handleComplete called:', {
      // Fresh from localStorage (source of truth)
      pendingPlanIdFromStorage,
      pendingBillingIntervalFromStorage,
      pendingIncludeOnboardingFromStorage,
      hasPendingPaidPlan,
      // From checkout hook (might be stale)
      checkoutRequiresCheckout: checkout.requiresCheckout,
      checkoutPendingPlanId: checkout.pendingPlanId,
      checkoutIsFreeTier: checkout.isFreeTier,
      checkoutIsOnTrial: checkout.isOnTrial,
    });

    // First, complete onboarding on backend (but don't send welcome email yet)
    await completeOnboardingMutation.mutateAsync();
    clearSavedData();

    // Determine if onboarding support should be included in checkout
    // - If onboarding is required by plan (Ultra Flow), always include it (mandatory purchase)
    // - If user opted for optional onboarding (Smart Flow), include if they chose it
    // - Otherwise, don't include (Free Flow, Enterprise)
    const includeOnboardingSupport = isOnboardingRequired || formData.onboardingSupport.wantsSupport;

    track('onboarding_steps_completed', {
      businessType: formData.businessType,
      goals: formData.goals,
      teamSize: formData.teamSize,
      channels: formData.channels,
      wantsOnboardingSupport: includeOnboardingSupport,
      isOnboardingRequired: isOnboardingRequired,
    });

    // CRITICAL FIX: Check localStorage directly instead of relying on checkout hook state
    // This ensures we always have the freshest data
    const requiresPayment = hasPendingPaidPlan || checkout.requiresCheckout;
    console.log('[OnboardingWizard] Checking if checkout required:', {
      hasPendingPaidPlan,
      checkoutRequiresCheckout: checkout.requiresCheckout,
      finalDecision: requiresPayment,
    });

    if (requiresPayment && hasPendingPaidPlan) {
      // Use the user's pending plan from localStorage (set during registration)
      // This is the plan they SELECTED, not their current subscription (which is freeflow)
      const pendingPlanId = pendingPlanIdFromStorage;
      const pendingBillingInterval = pendingBillingIntervalFromStorage as 'monthly' | 'quarterly' | 'yearly';
      console.log('[OnboardingWizard] Checkout required, pendingPlanId:', pendingPlanId);

      // Find the plan by matching the slug (e.g., 'ultra-flow' matches 'Ultra Flow')
      console.log('[OnboardingWizard] Looking for plan, available plans:', plans?.map(p => ({ id: p.id, name: p.name })));
      let targetPlan = null;
      if (pendingPlanId) {
        // Normalize the pending plan ID for matching (e.g., 'ultra-flow' -> 'ultraflow')
        const normalizedPending = pendingPlanId.toLowerCase().replace(/-/g, '');
        console.log('[OnboardingWizard] Searching for normalized plan:', normalizedPending);
        targetPlan = plans?.find(p => {
          const normalizedPlanName = p.name.toLowerCase().replace(/\s+/g, '');
          console.log('[OnboardingWizard] Comparing:', { normalizedPlanName, normalizedPending, match: normalizedPlanName === normalizedPending });
          return normalizedPlanName === normalizedPending;
        });
      }

      // Fallback to SmartFlow or first paid plan if no pending plan found
      if (!targetPlan) {
        console.log('[OnboardingWizard] No exact match found, using fallback');
        targetPlan = plans?.find(p => p.name.toLowerCase().includes('smart')) || plans?.[1];
      }

      console.log('[OnboardingWizard] Target plan resolved:', targetPlan ? { id: targetPlan.id, name: targetPlan.name } : null);

      if (targetPlan) {
        // Use the stored includeOnboarding preference if plan is required, otherwise use current selection
        // CRITICAL: Use fresh localStorage value instead of potentially stale checkout state
        const shouldIncludeOnboarding = isOnboardingRequired ||
          pendingIncludeOnboardingFromStorage ||
          includeOnboardingSupport;

        track('onboarding_payment_redirect', {
          planId: targetPlan.id,
          planName: targetPlan.name,
          pendingPlanId: pendingPlanId,
          billingInterval: pendingBillingInterval,
          includeOnboarding: shouldIncludeOnboarding,
          wasUserSelection: !!pendingPlanId,
        });
        checkout.startCheckout(targetPlan.id, pendingBillingInterval, shouldIncludeOnboarding);
        return;
      } else {
        // CRITICAL: User has a pending paid plan but we couldn't find it in the plans list
        // This should not happen - log error and redirect to subscription page as fallback
        console.error('[OnboardingWizard] CRITICAL: Could not find target plan for checkout!', {
          pendingPlanId,
          availablePlans: plans?.map(p => p.name),
        });
        track('onboarding_checkout_plan_not_found', { pendingPlanId });
        // Redirect to direct checkout page (skips plan selection, goes straight to Stripe)
        router.push(`/checkout?plan=${pendingPlanId}&returnTo=/onboarding`);
        return;
      }
    }

    // No payment required (already subscribed or on trial) - trigger welcome email and show celebration
    track('onboarding_completed', { paymentRequired: false });

    // CRITICAL: Trigger welcome email for users who don't require payment
    // This ensures all users receive the welcome email regardless of payment flow
    try {
      console.log('[OnboardingWizard] Triggering welcome email for non-payment flow...');
      await checkout.completeWithPaymentAsync();
      console.log('[OnboardingWizard] Welcome email triggered successfully');
    } catch (emailError) {
      // Non-blocking - log but don't prevent celebration
      console.error('[OnboardingWizard] Failed to trigger welcome email:', emailError);
    }

    setShowCelebration(true);
  }, [completeOnboardingMutation, clearSavedData, track, formData, checkout, plans, isOnboardingRequired, router]);

  /**
   * Handle successful payment return from Stripe
   * Shows celebration after successful payment verification
   * Note: Welcome email is already triggered in the success page before redirecting here
   */
  useEffect(() => {
    if (checkout.paymentCompleted && !showCelebration) {
      console.log('[OnboardingWizard] Payment completed! Showing celebration screen...');
      track('onboarding_payment_completed');
      // Note: Welcome email was already triggered in /subscription/success page
      // We don't call completeWithPayment here to avoid duplicate emails
      setShowCelebration(true);
    }
  }, [checkout.paymentCompleted, showCelebration, track, checkout]);

  /**
   * Handle celebration continue - navigate to dashboard
   */
  const handleCelebrationContinue = useCallback(() => {
    window.location.href = '/dashboard';
  }, []);

  const handleNext = async () => {
    // Validate current step before proceeding
    if (!validation.validateAndProceed(currentStep)) {
      return; // Validation failed, errors will be shown
    }

    // Show AI recommendations panel after step 2 (goals) if not already shown
    if (currentStep === 2 && !hasShownAIRecommendations && formData.businessType) {
      setShowAIRecommendations(true);
      setHasShownAIRecommendations(true);
      return; // Wait for user to apply or skip recommendations
    }

    if (currentStep < TOTAL_STEPS) {
      const nextStep = currentStep + 1;

      // Track step completion
      track('onboarding_step_completed', {
        step: currentStep,
        stepName: getStepName(currentStep),
      });

      // Save data at checkpoint steps with user feedback
      try {
        if (currentStep === CHANNEL_SETUP_STEP) {
          await saveChannelSetup();
          toast.success('Lead capture channels saved!', { duration: 2000 });
        } else if (currentStep === BUSINESS_PROFILE_STEP) {
          await saveBusinessProfile();
          toast.success('Business profile complete!', { duration: 2000 });
        } else if (currentStep === AI_CONFIG_STEP) {
          await saveAIConfiguration();
          toast.success('AI configuration saved!', { duration: 2000 });
        }

        // Always save step progress for resume functionality
        saveStepProgressMutation.mutate(nextStep);

        setCurrentStep(nextStep);
      } catch {
        // Error is handled by mutation onError callback
      }
    } else if (currentStep === FINAL_STEP) {
      // Save Step 10 data (AI Tone, Business Hours, Follow-up) before completing
      try {
        await saveAIConfiguration();
        await handleComplete();
      } catch {
        // Error is handled by mutation onError callback
      }
    }
  };

  // Helper to get step name for analytics (11 steps)
  const getStepName = (step: number): string => {
    const stepNames: Record<number, string> = {
      1: 'business_type',
      2: 'goals',
      3: 'lead_sources',
      4: 'channels',
      5: 'lead_type',
      6: 'crm',
      7: 'team_size',
      8: 'phone_setup',
      9: 'business_hours',
      10: 'calendar',
      11: 'onboarding_support',
    };
    return stepNames[step] || `step_${step}`;
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipClick = () => {
    setShowSkipDialog(true);
  };

  const handleConfirmSkip = async () => {
    setShowSkipDialog(false);

    // Track skip event
    track('onboarding_skipped', {
      skippedAtStep: currentStep,
      stepName: getStepName(currentStep),
      completedSteps: currentStep - 1,
    });

    // Save any partial data before skipping
    try {
      if (currentStep >= 1 && formData.industry) {
        await saveBusinessProfile();
      }
      if (currentStep >= 6 && formData.channels.length > 0) {
        await saveChannelSetup();
      }
    } catch {
      // Continue with skip even if save fails
    }
    // Mark as skipped (not complete)
    await skipOnboardingMutation.mutateAsync();
  };

  const updateFormData = (field: keyof OnboardingFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return formData.businessType !== '' || formData.industry !== '';
      case 2: return formData.goals.length > 0; // At least one goal required
      case 3: return formData.leadCaptureSources.length > 0;
      case 4: return formData.channels.length > 0;
      case 5: return formData.leadType !== '';
      case 6: return formData.crm !== '';
      case 7: return formData.teamSize !== '';
      case 8: return formData.phoneSetup.type !== '';
      case 9: return true; // Business hours have defaults
      case 10: return formData.calendarProvider !== '';
      case 11: return true; // Onboarding support is optional (has default)
      default: return false;
    }
  };

  /**
   * Map AI channel types to frontend channel types
   * AI returns: sms, voice, whatsapp, webchat, email, instagram, facebook
   * Frontend expects: sms, phone, whatsapp, email, web_chat, web_forms, social
   */
  const mapAIChannelToFrontend = (aiChannel: string): string | null => {
    const mapping: Record<string, string> = {
      'sms': 'sms',
      'voice': 'phone',
      'phone': 'phone',
      'whatsapp': 'whatsapp',
      'webchat': 'web_chat',
      'web_chat': 'web_chat',
      'email': 'email',
      'instagram': 'social',
      'facebook': 'social',
      'social': 'social',
      'web_forms': 'web_forms',
    };
    return mapping[aiChannel.toLowerCase()] || null;
  };

  /**
   * Handle applying AI channel recommendations
   * Pre-selects channels based on AI analysis
   */
  const handleApplyAIChannels = (channels: string[]) => {
    // Map and filter AI channels to frontend channel types
    const mappedChannels = channels
      .map(mapAIChannelToFrontend)
      .filter((c): c is string => c !== null);

    if (mappedChannels.length > 0) {
      setFormData(prev => ({
        ...prev,
        channels: [...new Set([...prev.channels, ...mappedChannels])] as typeof prev.channels,
      }));
    }

    // Track AI recommendations applied
    track('ai_recommendations_applied', {
      channelsApplied: channels.length,
      mappedChannels: mappedChannels.length,
      industry: formData.businessType,
    });

    // Close panel and continue to next step
    setShowAIRecommendations(false);
    setCurrentStep(3); // Move to lead sources step
  };

  /**
   * Handle skipping AI recommendations
   */
  const handleSkipAIRecommendations = () => {
    track('ai_recommendations_skipped', {
      industry: formData.businessType,
    });
    setShowAIRecommendations(false);
    setCurrentStep(3); // Move to lead sources step
  };

  // Show loading state while checking onboarding status
  if (isLoadingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <AIBackgroundAnimation variant="light" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-xl opacity-50 animate-pulse" />
            <Loader2 className="relative size-12 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground">Loading your setup...</p>
        </div>
      </div>
    );
  }

  // Check if returning from successful checkout (need to show celebration before redirecting)
  const isReturningFromCheckoutSuccessRender = searchParams.get('checkout_success') === 'true' ||
    (typeof window !== 'undefined' && sessionStorage.getItem('paymentConfirmed') === 'true');

  // Show loading while verifying payment from checkout success
  if (isReturningFromCheckoutSuccessRender && !showCelebration && !checkout.paymentCompleted && checkout.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <AIBackgroundAnimation variant="light" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 blur-xl opacity-50 animate-pulse" />
            <Loader2 className="relative size-12 animate-spin text-green-600" />
          </div>
          <p className="text-muted-foreground font-medium">Verifying your payment...</p>
          <p className="text-muted-foreground/60 text-sm">Almost there! Just a moment.</p>
        </div>
      </div>
    );
  }

  // If onboarding is already complete or skipped, redirect to dashboard immediately
  // This check happens BEFORE rendering the wizard to prevent flash of step 1
  // EXCEPTIONS - don't redirect, show appropriate UI instead:
  // - If handling cancelled checkout (show Resume Payment Dialog)
  // - If returning from successful checkout (show Celebration)
  // - If showCelebration is already true
  // - If showResumePaymentDialog is already true
  if (
    !showCelebration &&
    !isHandlingCancelledCheckout &&
    !showResumePaymentDialog &&
    !isReturningFromCheckoutSuccessRender && // Don't redirect if coming from successful checkout
    (onboardingStatus?.isComplete || onboardingStatus?.isSkipped)
  ) {
    // Show loading while redirect happens
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <AIBackgroundAnimation variant="light" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-xl opacity-50 animate-pulse" />
            <Loader2 className="relative size-12 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground">Setup already complete, redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // Show celebration screen after successful completion
  if (showCelebration) {
    return (
      <OnboardingCelebration
        businessName={userData?.businessName || 'your business'}
        userName={userData?.firstName || 'there'}
        onContinue={handleCelebrationContinue}
        paymentCompleted={checkout.paymentCompleted}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* AI-Themed Animated Background - Light variant */}
      <AIBackgroundAnimation variant="light" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Professional Header - Light theme matching landing page */}
        <header className="pt-6 pb-4 border-b border-border/50 bg-white/80 backdrop-blur-xl">
          <div className="container mx-auto max-w-5xl px-6">
            {/* Top Bar: Logo, User Info, Skip */}
            <div className="flex items-center justify-between">
              {/* Logo and Branding */}
              <div className="flex items-center gap-3">
                <Logo showText={true} size="md" variant="dark" />
              </div>

              {/* User Badge & Skip */}
              <div className="flex items-center gap-4">
                {/* User Avatar & Email */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/40 border border-border">
                  <Avatar className="h-6 w-6 border border-border">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-medium">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-foreground/80 text-sm max-w-32 truncate">{userEmail}</span>
                </div>

                <button
                  onClick={handleSkipClick}
                  disabled={isSaving}
                  className="text-sm text-primary hover:text-primary transition-colors disabled:opacity-50 whitespace-nowrap font-medium"
                >
                  Skip Setup →
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Title Section */}
        <div className="container mx-auto max-w-5xl px-6 py-6">
          <div className="text-center mb-6">
            {/* Dynamic Title with Business Name */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                {displayBusinessName
                  ? `Qualiflow AI Setup for ${displayBusinessName}`
                  : `Qualiflow AI Setup`
                }
              </h1>
              <Sparkles className="w-5 h-5 text-muted-foreground animate-pulse" />
            </div>

            {/* Personalized Welcome Message */}
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
              {currentStep === 1
                ? `Welcome${userFirstName !== 'there' ? `, ${userFirstName}` : ''}! Let's configure your AI-powered lead qualification system.`
                : `Great progress${userFirstName !== 'there' ? `, ${userFirstName}` : ''}! ${currentStepInfo.description}.`
              }
            </p>

            {/* Info Pills Row */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              {/* Subscription Badge with Upgrade Option */}
              <SubscriptionBanner
                compact
                variant="light"
                showUpgrade
                onPlanChange={(planId, _isUpgrade) => {
                  track('subscription_upgraded', { planId, source: 'onboarding' });
                  // Refresh the page to get updated subscription data
                  window.location.reload();
                }}
              />

              {/* Time Estimate */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted/40 border border-border text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>~{estimatedMinutes} min remaining</span>
              </div>

              {/* Current Phase */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 border border-primary/20 text-primary">
                <Building2 className="w-3.5 h-3.5" />
                <span>{currentStepInfo.phase}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Offline Indicator */}
        {isOffline && (
          <div className="container mx-auto max-w-4xl px-6 mb-4">
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-amber-800 text-sm">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>You&apos;re offline. Your progress is saved locally and will sync when you reconnect.</span>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="container mx-auto max-w-4xl px-6 mb-6">
          <ProgressIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} variant="light" />
        </div>

        {/* Main Content Card */}
        <div className="container mx-auto max-w-4xl px-6 flex-1">
          <div className="relative">
            {/* Subtle shadow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 rounded-3xl blur-xl opacity-50" />

            <div className="relative rounded-2xl bg-white p-10 shadow-xl border border-border/50">
              <AnimatePresence mode="wait">
                {/* Step 1: Business Type (9 categories) - Enhanced Competitive Design */}
                {currentStep === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <EnhancedStep1Industry
                      value={formData.businessType || formData.industry || ''}
                      onChange={(value) => {
                        updateFormData('businessType', value);
                        updateFormData('industry', value); // backward compat
                      }}
                    />
                  </motion.div>
                )}
                {/* Step 2: Goals (multi-select) */}
                {currentStep === 2 && !showAIRecommendations && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <Step2Goals
                      value={formData.goals}
                      onChange={(value) => updateFormData('goals', value)}
                    />
                  </motion.div>
                )}
                {/* AI Recommendations Panel - shown after Step 2, only if we have a valid industry */}
                {currentStep === 2 && showAIRecommendations && (formData.businessType?.trim() || formData.industry?.trim()) && (
                  <motion.div
                    key="step-2-ai"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="space-y-6"
                  >
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                      <Sparkles className="size-6 text-primary" />
                      Personalized Recommendations
                    </h2>
                    <p className="text-muted-foreground mt-2">
                      Based on your {formData.businessType?.replace(/_/g, ' ')} business, here&apos;s what we recommend.
                    </p>
                  </div>
                  <AIRecommendationsPanel
                    industry={formData.businessType?.trim() || formData.industry?.trim() || ''}
                    companySize={formData.teamSize}
                    goals={formData.goals}
                    leadType={formData.leadType}
                    mainObjective={formData.goals[0]}
                    leadSources={formData.leadCaptureSources}
                    onApplyChannels={handleApplyAIChannels}
                    onSkip={handleSkipAIRecommendations}
                  />
                  </motion.div>
                )}
                {/* Skip AI recommendations if no valid industry - auto-proceed to next step */}
                {currentStep === 2 && showAIRecommendations && !(formData.businessType?.trim() || formData.industry?.trim()) && (
                  <motion.div
                    key="step-2-ai-skip"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="space-y-6"
                  >
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                      <Sparkles className="size-6 text-primary" />
                      Personalized Recommendations
                    </h2>
                    <p className="text-muted-foreground mt-2">
                      Complete step 1 to get personalized recommendations.
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <Button onClick={handleSkipAIRecommendations}>
                      Continue Setup
                    </Button>
                  </div>
                  </motion.div>
                )}
                {/* Step 3: Lead Capture Sources */}
                {currentStep === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <Step3LeadSources
                      value={formData.leadCaptureSources}
                      onChange={(value) => updateFormData('leadCaptureSources', value)}
                    />
                  </motion.div>
                )}
                {/* Step 4: Channels */}
                {currentStep === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <Step6Channels
                      value={formData.channels}
                      onChange={(value) => updateFormData('channels', value)}
                    />
                  </motion.div>
                )}
                {/* Step 5: Lead Types */}
                {currentStep === 5 && (
                  <motion.div
                    key="step-5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <Step4LeadType
                      value={formData.leadType}
                      onChange={(value) => updateFormData('leadType', value)}
                    />
                  </motion.div>
                )}
                {/* Step 6: CRM */}
                {currentStep === 6 && (
                  <motion.div
                    key="step-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <Step3CRM
                      value={formData.crm}
                      onChange={(value) => updateFormData('crm', value)}
                    />
                  </motion.div>
                )}
                {/* Step 7: Team Size */}
                {currentStep === 7 && (
                  <motion.div
                    key="step-7"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <Step2TeamSize
                      value={formData.teamSize}
                      onChange={(value) => updateFormData('teamSize', value)}
                    />
                  </motion.div>
                )}
                {/* Step 8: Phone Setup */}
                {currentStep === 8 && (
                  <motion.div
                    key="step-8"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <Step8PhoneSetup
                      value={formData.phoneSetup}
                      onChange={(value) => updateFormData('phoneSetup', value)}
                    />
                  </motion.div>
                )}
                {/* Step 9: Business Hours */}
                {currentStep === 9 && (
                  <motion.div
                    key="step-9"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <Step9BusinessHours
                      value={formData.businessHours}
                      onChange={(value) => updateFormData('businessHours', value)}
                    />
                  </motion.div>
                )}
                {/* Step 10: Calendar Integration */}
                {currentStep === 10 && (
                  <motion.div
                    key="step-10"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <Step10Calendar
                      value={formData.calendarProvider}
                      onChange={(value) => updateFormData('calendarProvider', value)}
                    />
                  </motion.div>
                )}
                {/* Step 11: Onboarding Support Upsell - Only shown for plans with optional onboarding */}
                {currentStep === ONBOARDING_SUPPORT_STEP && showOnboardingStep && (
                  <motion.div
                    key="step-11"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <Step11OnboardingSupport
                      value={formData.onboardingSupport}
                      onChange={(value) => updateFormData('onboardingSupport', value)}
                      price={currentPlanOnboardingPrice}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Validation Errors */}
              <ValidationSummary
                errors={validation.getStepErrors(currentStep)}
                className="mt-6"
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="container mx-auto max-w-4xl px-6 py-8">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1 || isSaving}
              className="flex items-center gap-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all disabled:opacity-30"
            >
              <ArrowLeft className="size-5" />
              Back
            </Button>

            <GradientButton
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all cursor-pointer"
              showArrow={!isSaving}
              disabled={!isStepValid() || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : currentStep === FINAL_STEP ? (
                'Complete Setup'
              ) : (
                'Continue'
              )}
            </GradientButton>
          </div>
        </div>
      </div>

      {/* Skip Confirmation Dialog */}
      <Modal open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <ModalContent size="md">
          <ModalHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="size-5 text-amber-600" />
              </div>
              <ModalTitle>Skip Setup?</ModalTitle>
            </div>
            <ModalDescription className="pt-2">
              You can skip the setup wizard and access your dashboard immediately.
              Your current progress will be saved, and you can resume setup anytime
              from your dashboard.
            </ModalDescription>
          </ModalHeader>
          <ModalBody>
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              <strong>Note:</strong> Some features may be limited until you complete the setup.
            </div>
          </ModalBody>
          <ModalFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowSkipDialog(false)}
            >
              Continue Setup
            </Button>
            <Button
              variant="default"
              onClick={handleConfirmSkip}
              disabled={skipOnboardingMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {skipOnboardingMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Skipping...
                </>
              ) : (
                'Skip for Now'
              )}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Resume Payment Dialog */}
      <Modal open={showResumePaymentDialog} onOpenChange={setShowResumePaymentDialog}>
        <ModalContent size="md">
          <ModalHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted/50">
                <Sparkles className="size-5 text-info" />
              </div>
              <ModalTitle>Complete Your Subscription</ModalTitle>
            </div>
            <ModalDescription className="pt-2">
              You have an incomplete payment for the <strong>{pendingPlanName}</strong> plan.
              Would you like to complete your subscription now?
            </ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-info">
              <strong>Tip:</strong> Completing your subscription unlocks all premium features immediately.
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
              <strong>Or</strong> continue with our free plan and explore the platform.
              You can upgrade anytime from Settings.
            </div>
          </ModalBody>
          <ModalFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleContinueWithFreeTier}
              disabled={isResumingPayment || isActivatingFreeTier}
            >
              {isActivatingFreeTier ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Activating...
                </>
              ) : (
                'Start Free Plan'
              )}
            </Button>
            <GradientButton
              onClick={handleResumePayment}
              disabled={isResumingPayment || isActivatingFreeTier}
            >
              {isResumingPayment ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Redirecting...
                </>
              ) : (
                'Complete Payment'
              )}
            </GradientButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}