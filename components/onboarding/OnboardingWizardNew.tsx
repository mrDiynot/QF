'use client';

/**
 * Onboarding Wizard - Dashboard Native (3-Step Redesign)
 * Responsive split-screen layout for Step 2 (40% goals / 60% AI preview)
 * Mobile: Stacked layout with bottom sheet for AI preview
 * Breakpoints: Mobile (<640px), Tablet (640-1023px), Desktop (≥1024px)
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, ArrowRight, ArrowLeft, Sparkles, Bot, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingLayout } from './OnboardingLayout';
import { OnboardingStepCard, type StepStatus } from './OnboardingStepCard';
import { ProgressBreadcrumb } from './ProgressBreadcrumb';
import { Step1BusinessTypeSimplified } from './steps/Step1BusinessTypeSimplified';
import { Step2GoalsSimplified } from './steps/Step2GoalsSimplified';
import { Step3ChannelsSimplified } from './steps/Step3ChannelsSimplified';
import { LiveAIPreview } from './LiveAIPreview';
import { OnboardingCelebration } from './OnboardingCelebration';
import { OnboardingFormData } from '@/types/onboarding';
import { GradientButton } from '@/components/shared/gradient-button';
import { Button } from '@/components/ui/button';

import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  useBusinessProfile,
  useChannelSetup,
  useCompleteOnboarding,
  useSkipOnboarding,
  useOnboardingStatus,
} from '@/hooks/onboarding/useOnboarding';
import { useOnboardingCheckout } from '@/hooks/onboarding/useOnboardingCheckout';
import { usePlans, useCurrentSubscription } from '@/hooks/subscriptions/useSubscriptions';
import { useAIOnboardingRecommendations } from '@/hooks/api/useAIOnboardingRecommendations';
import { useAnalytics } from '@/hooks/useAnalytics';
import { toast } from 'sonner';
import type { Channel } from '@/types/onboarding';

const TOTAL_STEPS = 3;

// Step labels for breadcrumb
const STEP_LABELS = [
  { label: 'Business Type', description: 'Tell us about your industry' },
  { label: 'Your Goal', description: 'What do you want to achieve?' },
  { label: 'Channels', description: 'How do leads reach you?' },
];

export function OnboardingWizardNew() {
  const _router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [showCelebration, setShowCelebration] = useState(false);

  // Check if returning from Stripe checkout
  const checkoutSuccess = searchParams.get('checkout_success') === 'true';
  const isReturningFromCheckoutSuccess = checkoutSuccess ||
    (typeof window !== 'undefined' && sessionStorage.getItem('paymentConfirmed') === 'true');
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [formData, setFormData] = useState<OnboardingFormData>({
    businessType: '',
    industry: '',
    goals: [],
    objective: '',
    leadCaptureSources: [],
    channels: [],
    leadType: '',
    crm: '',
    teamSize: '',
    phoneSetup: { type: '' },
    businessHours: null,
    calendarProvider: '',
    onboardingSupport: { wantsSupport: false },
    automations: [],
    callHandling: { sendSMSOnMissed: false, enableOutboundAI: false },
    finalTouches: { aiTone: '', enableAutoResponse: false },
  });

  // Backend integration hooks
  const { data: onboardingStatus, isLoading: isLoadingStatus } = useOnboardingStatus();
  const businessProfileMutation = useBusinessProfile();
  const channelSetupMutation = useChannelSetup();
  const completeOnboardingMutation = useCompleteOnboarding({ skipRedirect: true });
  const skipOnboardingMutation = useSkipOnboarding();

  // Payment/checkout integration
  const checkout = useOnboardingCheckout();
  const { data: plans } = usePlans();
  const { data: subscription } = useCurrentSubscription();

  // Analytics
  const { track } = useAnalytics();
  const hasTrackedStart = useRef(false);

  // AI Channel Recommendations
  const aiRecommendationsMutation = useAIOnboardingRecommendations();
  const [aiRecommendedChannels, setAiRecommendedChannels] = useState<Channel[]>([]);

  // Get user data from NextAuth session (primary) or sessionStorage (fallback)
  const userData = useMemo(() => {
    // Primary: Use NextAuth session
    if (session?.user) {
      return {
        id: session.user.id,
        email: session.user.email,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        businessId: session.user.businessId,
      };
    }
    // Fallback: Try sessionStorage (for registration flow before NextAuth session is established)
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
  }, [session]);

  const userFirstName = userData?.firstName || 'there';
  const userInitials = userData?.firstName && userData?.lastName
    ? `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase()
    : userData?.email?.[0]?.toUpperCase() || 'U';
  const userEmail = userData?.email || '';
  const planName = subscription?.planName || 'Free Plan';
  // Business name from onboarding status (fetched from API) or sessionStorage fallback
  const businessName = onboardingStatus?.businessName || userData?.businessName || '';

  // Determine step statuses
  const getStepStatus = (stepNumber: number): StepStatus => {
    switch (stepNumber) {
      case 1:
        return formData.businessType ? 'completed' : 'in_progress';
      case 2:
        return formData.goals.length > 0
          ? 'completed'
          : formData.businessType
          ? 'in_progress'
          : 'not_started';
      case 3:
        return formData.channels.length > 0
          ? 'completed'
          : formData.goals.length > 0
          ? 'in_progress'
          : 'not_started';
      default:
        return 'not_started';
    }
  };

  // Explicit step state (not auto-calculated from form data)
  const [currentStep, setCurrentStep] = useState(1);

  // Initialize step based on existing form data
  useEffect(() => {
    if (formData.businessType && currentStep === 1) {
      setCurrentStep(2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const _progressPercentage = Math.round((currentStep / TOTAL_STEPS) * 100);
  const isAllComplete = getStepStatus(1) === 'completed' &&
                       getStepStatus(2) === 'completed' &&
                       getStepStatus(3) === 'completed';

  // Track onboarding started (only once)
  useEffect(() => {
    if (!hasTrackedStart.current && !isLoadingStatus) {
      hasTrackedStart.current = true;
      track('onboarding_started', { version: '3_step_dashboard_native' });
    }
  }, [isLoadingStatus, track]);

  // Check if any mutation is in progress
  const isSaving =
    businessProfileMutation.isPending ||
    channelSetupMutation.isPending ||
    completeOnboardingMutation.isPending ||
    skipOnboardingMutation.isPending ||
    aiRecommendationsMutation.isPending;

  // Form data update helper (defined early for use in handleNext)
  const updateFormData = useCallback((field: keyof OnboardingFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  /**
   * Handle successful payment return from Stripe
   * Shows celebration after successful payment verification
   */
  useEffect(() => {
    if (checkout.paymentCompleted && !showCelebration) {
      console.log('[OnboardingWizardNew] Payment completed! Showing celebration screen...');
      track('onboarding_payment_completed');
      // Trigger welcome email via complete-with-payment endpoint
      checkout.completeWithPayment();
      setShowCelebration(true);
    }
  }, [checkout.paymentCompleted, checkout, showCelebration, track]);

  // Handle next step navigation
  const handleNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      // When moving from step 2 to step 3, fetch AI recommendations (non-blocking)
      if (currentStep === 2 && formData.businessType && formData.goals.length > 0) {
        track('ai_channel_recommendations_requested', {
          businessType: formData.businessType,
          goalsCount: formData.goals.length,
        });

        // Fetch recommendations in background - don't block step transition
        aiRecommendationsMutation.mutateAsync({
          industry: formData.businessType,
          goals: formData.goals,
          mainObjective: formData.goals[0],
        }).then((result) => {
          if (result.success && result.recommendedChannels.length > 0) {
            // Map AI channel types to our Channel type
            const channelTypeMap: Record<string, Channel> = {
              sms: 'sms',
              voice: 'phone',
              phone: 'phone',
              webchat: 'web_chat',
              web_chat: 'web_chat',
              email: 'email',
              whatsapp: 'whatsapp',
              instagram: 'social',
              facebook: 'social',
              web_forms: 'web_forms',
            };

            const aiChannels = result.recommendedChannels
              .filter(c => c.isHighlyRecommended || c.priority >= 70)
              .map(c => channelTypeMap[c.channelType.toLowerCase()])
              .filter((c): c is Channel => !!c);

            // Remove duplicates - only mark as AI recommended, do NOT pre-select
            const uniqueChannels = [...new Set(aiChannels)];
            setAiRecommendedChannels(uniqueChannels);

            // NOTE: Per product spec, AI recommendations are displayed with badge only
            // User must explicitly select channels (no auto-selection)

            track('ai_channel_recommendations_received', {
              recommendedCount: uniqueChannels.length,
              channels: uniqueChannels,
            });
          }
        }).catch((error) => {
          console.error('[Onboarding] AI recommendations failed:', error);
          // Fall back to default recommendations
          setAiRecommendedChannels(['sms', 'phone', 'web_chat']);
        });
      }

      // Move to next step immediately (non-blocking)
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, formData.businessType, formData.goals, aiRecommendationsMutation, track]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Auto-advance from Step 1 when business type is selected
  useEffect(() => {
    if (formData.businessType && currentStep === 1) {
      // Small delay for visual feedback before advancing
      const timer = setTimeout(() => setCurrentStep(2), 300);
      return () => clearTimeout(timer);
    }
  }, [formData.businessType, currentStep]);

  // Save business profile + channels
  const saveOnboardingData = useCallback(async () => {
    try {
      // Save business profile (Step 1 + 2)
      await businessProfileMutation.mutateAsync({
        companyName: userData?.businessName || '',
        industry: formData.businessType || 'other',
        companySize: 'just_me', // Default for 3-step flow
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        crmPlatform: undefined, // Deferred to dashboard checklist
        leadType: undefined, // Deferred to dashboard checklist
        mainObjective: formData.goals[0] || undefined,
      });

      // Save channels (Step 3)
      await channelSetupMutation.mutateAsync({
        channels: formData.channels.map(channel => ({
          type: channel,
          enabled: true,
        })),
        automations: [],
      });

      track('onboarding_step_completed', {
        step: 'all_steps',
        businessType: formData.businessType,
        goalsCount: formData.goals.length,
        channelsCount: formData.channels.length,
      });
    } catch (error) {
      console.error('[Onboarding] Save failed:', error);
      throw error;
    }
  }, [businessProfileMutation, channelSetupMutation, formData, userData, track]);

  // Handle complete setup
  const handleCompleteSetup = useCallback(async () => {
    if (!isAllComplete) {
      toast.error('Please complete all 3 steps before continuing');
      return;
    }

    try {
      // Save all data first
      await saveOnboardingData();

      // Complete onboarding
      await completeOnboardingMutation.mutateAsync();

      track('onboarding_completed', {
        businessType: formData.businessType,
        goals: formData.goals,
        channels: formData.channels,
        version: '3_step_dashboard_native',
      });

      // Check if payment required
      const pendingPlanId = localStorage.getItem('pendingPlanId');
      const hasPendingPaidPlan = pendingPlanId &&
        pendingPlanId !== 'free-flow' &&
        pendingPlanId !== 'freeflow' &&
        !pendingPlanId.includes('1111'); // Exclude free plan UUID

      console.log('[Onboarding] Checking payment requirement:', {
        pendingPlanId,
        hasPendingPaidPlan,
        availablePlans: plans?.map(p => ({ id: p.id, name: p.name })),
      });

      if (hasPendingPaidPlan && plans) {
        // Normalize the pending plan ID for matching
        const normalizedPendingId = pendingPlanId.toLowerCase().replace(/-/g, '').replace(/\s+/g, '');

        // Try to find the plan by:
        // 1. Exact UUID match
        // 2. Name match (e.g., "smartflow" === "smartflow")
        // 3. Slug-to-name match (e.g., "smart-flow" -> "smartflow")
        const targetPlan = plans.find(p => {
          const planId = p.id.toLowerCase();
          const planName = p.name.toLowerCase().replace(/\s+/g, '');

          return planId === pendingPlanId.toLowerCase() || // UUID match
                 planName === normalizedPendingId;          // Name/slug match
        });

        console.log('[Onboarding] Plan matching result:', {
          normalizedPendingId,
          targetPlan: targetPlan ? { id: targetPlan.id, name: targetPlan.name } : null,
        });

        if (targetPlan) {
          const billingInterval = (localStorage.getItem('pendingBillingInterval') as 'monthly' | 'quarterly' | 'yearly') || 'monthly';
          console.log('[Onboarding] Starting checkout for plan:', targetPlan.name, 'interval:', billingInterval);
          checkout.startCheckout(targetPlan.id, billingInterval, false);
          return;
        } else {
          console.warn('[Onboarding] Could not find matching plan for:', pendingPlanId);
          track('onboarding_checkout_plan_not_found', { pendingPlanId });
        }
      }

      // No payment required - trigger welcome email via free tier endpoint and show celebration
      // CRITICAL: Use async version to ensure email is sent before showing celebration
      console.log('[Onboarding] No payment required - calling completeWithFreeTier to send welcome email');
      try {
        await checkout.completeWithFreeTierAsync();
        console.log('[Onboarding] Welcome email triggered successfully');
      } catch (emailError) {
        // Non-blocking - log but don't prevent celebration
        console.error('[Onboarding] Failed to trigger welcome email:', emailError);
      }
      setShowCelebration(true);
    } catch (error) {
      console.error('[Onboarding] Complete failed:', error);
      toast.error('Failed to complete setup. Please try again.');
    }
  }, [isAllComplete, saveOnboardingData, completeOnboardingMutation, formData, track, plans, checkout]);

  // Handle skip
  const handleSkip = useCallback(async () => {
    try {
      await skipOnboardingMutation.mutateAsync();
      track('onboarding_skipped', { completedSteps: currentStep - 1, version: '3_step_dashboard_native' });
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('[Onboarding] Skip failed:', error);
      toast.error('Failed to skip setup. Please try again.');
    }
  }, [skipOnboardingMutation, track, currentStep]);

  const handleCelebrationContinue = useCallback(() => {
    window.location.href = '/dashboard';
  }, []);

  // Show payment verification loading when returning from Stripe checkout
  if (isReturningFromCheckoutSuccess && !showCelebration && !checkout.paymentCompleted && checkout.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 blur-xl opacity-50 animate-pulse" />
            <Loader2 className="relative size-12 animate-spin text-green-600" />
          </div>
          <p className="text-lg font-medium text-gray-700">Verifying your payment...</p>
          <p className="text-sm text-muted-foreground">Just a moment while we confirm your subscription.</p>
        </div>
      </div>
    );
  }

  // Show regular loading state
  if (isLoadingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="size-12 animate-spin text-brand-orange mx-auto" />
          <p className="text-muted-foreground">Loading your setup...</p>
        </div>
      </div>
    );
  }

  // Show celebration screen
  if (showCelebration) {
    return (
      <OnboardingCelebration
        businessName={businessName || 'your business'}
        userName={userFirstName}
        onContinue={handleCelebrationContinue}
        paymentCompleted={checkout.paymentCompleted}
        businessType={formData.businessType}
        goals={formData.goals}
      />
    );
  }

  // Redirect if already complete
  if (onboardingStatus?.isComplete || onboardingStatus?.isSkipped) {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
    return null;
  }

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      userName={userFirstName}
      userEmail={userEmail}
      userInitials={userInitials}
      planName={planName}
    >
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-16">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 sm:space-y-6 mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="size-6 sm:size-7 text-brand-orange" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              QualiFlow AI Setup{businessName ? ` for ${businessName}` : ''}
            </h1>
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl">
            Welcome{userFirstName !== 'there' ? `, ${userFirstName}` : ''}! Complete these 3 steps to activate your AI.
          </p>

          {/* Progress Breadcrumb */}
          <ProgressBreadcrumb steps={STEP_LABELS} currentStep={currentStep} />
        </motion.div>

        {/* Step Content with Animations */}
        <AnimatePresence mode="wait">
          {/* Step 1: Business Type */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <OnboardingStepCard
                stepNumber={1}
                title="Business Type"
                description="Tell us about your industry"
                status={getStepStatus(1)}
                colSpan={4}
              >
                <Step1BusinessTypeSimplified
                  value={formData.businessType || formData.industry || ''}
                  onChange={(value) => {
                    updateFormData('businessType', value);
                    updateFormData('industry', value);
                  }}
                />
              </OnboardingStepCard>
            </motion.div>
          )}

          {/* Step 2: Goals + Live AI Preview (Split Screen) */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Desktop/Tablet: Split Screen Layout */}
              <div className="hidden lg:grid lg:grid-cols-5 gap-6 min-h-[500px]">
                {/* Left Panel: Goals (40%) */}
                <div className="lg:col-span-2">
                  <OnboardingStepCard
                    stepNumber={2}
                    title="Your Goal"
                    description="What do you want to achieve?"
                    status={getStepStatus(2)}
                    colSpan={4}
                    className="h-full"
                  >
                    <div className="max-h-[420px] overflow-y-auto pr-2 -mr-2">
                      <Step2GoalsSimplified
                        value={formData.goals}
                        onChange={(value) => updateFormData('goals', value)}
                      />
                    </div>
                  </OnboardingStepCard>
                </div>

                {/* Right Panel: Live AI Preview (60%) */}
                <div className="lg:col-span-3">
                  <div className="h-full rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/80 via-white to-orange-50/30 p-6 shadow-sm">
                    <LiveAIPreview
                      businessType={formData.businessType}
                      goal={formData.goals[0]}
                    />
                  </div>
                </div>
              </div>

              {/* Mobile/Tablet: Stacked Layout with Preview Button */}
              <div className="lg:hidden space-y-4">
                <OnboardingStepCard
                  stepNumber={2}
                  title="Your Goal"
                  description="What do you want to achieve?"
                  status={getStepStatus(2)}
                  colSpan={4}
                >
                  <Step2GoalsSimplified
                    value={formData.goals}
                    onChange={(value) => updateFormData('goals', value)}
                  />
                </OnboardingStepCard>

                {/* Mobile Preview Trigger */}
                <button
                  onClick={() => setShowMobilePreview(true)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-purple-200 bg-purple-50/50 hover:bg-purple-100/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Bot className="size-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">See Your AI in Action</p>
                      <p className="text-sm text-muted-foreground">Tap to preview a live demo</p>
                    </div>
                  </div>
                  <ArrowRight className="size-5 text-purple-500" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Channels */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <OnboardingStepCard
                stepNumber={3}
                title="Communication Channels"
                description={aiRecommendedChannels.length > 0
                  ? "AI has selected the best channels for your business"
                  : "How do your leads reach you?"}
                status={getStepStatus(3)}
                colSpan={4}
              >
                  <Step3ChannelsSimplified
                  value={formData.channels}
                  onChange={(value) => updateFormData('channels', value)}
                  recommendedChannels={aiRecommendedChannels.length > 0
                    ? aiRecommendedChannels
                    : ['sms', 'phone', 'web_chat']}
                  isLoadingRecommendations={aiRecommendationsMutation.isPending}
                />
              </OnboardingStepCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile AI Preview Bottom Sheet */}
        <Sheet open={showMobilePreview} onOpenChange={setShowMobilePreview}>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0">
            <div className="flex flex-col h-full">
              {/* Sheet Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-gray-900">Live AI Demo</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobilePreview(false)}
                  className="size-8 p-0"
                >
                  <X className="size-5" />
                </Button>
              </div>
              {/* Preview Content */}
              <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-purple-50/80 via-white to-orange-50/30">
                <LiveAIPreview
                  businessType={formData.businessType}
                  goal={formData.goals[0]}
                />
              </div>
              {/* Sheet Footer */}
              <div className="p-4 border-t bg-white">
                <Button
                  className="w-full"
                  onClick={() => setShowMobilePreview(false)}
                >
                  Close Preview
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Action Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between pt-6 mt-6 sm:mt-8 border-t border-gray-200"
        >
          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSaving}
                className="gap-2"
              >
                <ArrowLeft className="size-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={isSaving}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </Button>
          </div>

          {/* Step 2: Next button to move to channels */}
          {currentStep === 2 && (
            <GradientButton
              onClick={handleNext}
              disabled={formData.goals.length === 0 || isSaving}
              className="gap-2 px-6 sm:px-8 shadow-lg"
              showArrow
            >
              Next: Choose Channels
            </GradientButton>
          )}

          {/* Step 3: Complete Setup button */}
          {currentStep === 3 && (
            <GradientButton
              onClick={handleCompleteSetup}
              disabled={formData.channels.length === 0 || isSaving}
              className="gap-2 px-6 sm:px-8 shadow-lg"
              showArrow={!isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span className="hidden sm:inline">Saving...</span>
                </>
              ) : (
                'Complete Setup'
              )}
            </GradientButton>
          )}
        </motion.div>
      </div>
    </OnboardingLayout>
  );
}
