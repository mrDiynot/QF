/**
 * Onboarding API hooks
 *
 * Aligned with backend 10-step onboarding flow:
 * - Steps 1-5: Business Profile (industry, teamSize, CRM, leadType, objective)
 * - Steps 6-7: Channel Setup (channels, automations)
 * - Steps 8-10: AI Configuration (phone setup, call handling, AI tone)
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiClient, handleApiError } from '@/lib/axios';
import { OnboardingStatus } from '@/types/onboarding';
import type { BusinessProfileFormData, ChannelSetupFormData, AIConfigurationFormData } from '@/lib/validations/onboarding';
import { queryConfig } from '@/lib/query-config';

/**
 * Hook to get onboarding status
 * Handles 402 errors gracefully (subscription/trial issues) - doesn't show toast
 */
export const useOnboardingStatus = () => {
  return useQuery({
    queryKey: ['onboarding-status'],
    queryFn: async () => {
      try {
        // Use relative path - apiClient already has baseURL set
        const response = await apiClient.get<OnboardingStatus>('/onboarding/status');
        return response.data;
      } catch (error: unknown) {
        // Handle 402 (Payment Required) gracefully - this can happen if:
        // 1. User just paid but webhook hasn't processed yet
        // 2. Trial status is being checked but subscription is active
        // In these cases, return a default status to allow onboarding to proceed
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 402) {
          console.warn('[Onboarding] 402 status received - returning default status (subscription webhook may be pending)');
          return {
            businessId: '',
            businessName: sessionStorage.getItem('pendingCompanyName') || undefined,
            currentStep: 1,
            completedSteps: [],
            isComplete: false,
            isSkipped: false,
            startedAt: new Date().toISOString(),
            progressPercentage: 0,
          } as OnboardingStatus;
        }
        // Handle 401 (Unauthorized) - user not authenticated
        if (axiosError.response?.status === 401) {
          console.warn('[Onboarding] 401 status received - user not authenticated');
          throw error; // Let React Query handle the error
        }
        // Network error — backend unreachable (dev environment)
        // Return a "skipped" default so the dashboard can render
        if (!axiosError.response) {
          console.warn('[Onboarding] Network error — backend unreachable, returning default status');
          return {
            businessId: '',
            currentStep: 1,
            completedSteps: [],
            isComplete: false,
            isSkipped: true,
            startedAt: new Date().toISOString(),
            progressPercentage: 0,
          } as OnboardingStatus;
        }
        throw error;
      }
    },
    ...queryConfig.realtime,
    retry: (failureCount, error) => {
      const axiosError = error as { response?: { status?: number } };
      // Never retry network errors or auth errors
      if (!axiosError.response) return false;
      if (axiosError.response?.status === 402 || axiosError.response?.status === 401) return false;
      return failureCount < 2;
    },
    // Don't run query if user is not authenticated (will be handled by layout)
    enabled: typeof window !== 'undefined',
  });
};

/**
 * Hook to save business profile data (Steps 1-5)
 * Saves: industry, teamSize, CRM platform, lead type, main objective
 */
export const useBusinessProfile = () => {
  return useMutation({
    mutationFn: async (data: BusinessProfileFormData) => {
      // Map form data to API format (Steps 1-5)
      const apiData = {
        businessName: data.companyName,
        industry: data.industry,
        companySize: data.companySize,
        timezone: data.timezone,
        crmPlatform: data.crmPlatform,
        leadType: data.leadType,
        mainObjective: data.mainObjective,
      };
      // Use relative path - apiClient already has baseURL set
      const response = await apiClient.post('/onboarding/business-profile', apiData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Business profile saved');
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to save channel and automation setup (Steps 6-7)
 * Saves: selected channels, selected automation priorities
 */
export const useChannelSetup = () => {
  return useMutation({
    mutationFn: async (data: ChannelSetupFormData) => {
      // Map form data to API format (Steps 6-7)
      const apiData = {
        selectedChannels: data.channels.filter(c => c.enabled).map(c => c.type),
        selectedAutomations: data.automations || [],
      };
      // Use relative path - apiClient already has baseURL set
      const response = await apiClient.post('/onboarding/channels', apiData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Channels and automations configured');
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to save AI and phone configuration (Steps 8-10)
 * Saves: phone setup, call handling, AI tone, business hours, follow-up preference
 */
export const useAIConfiguration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AIConfigurationFormData) => {
      // Map form data to API format (Steps 8-10)
      const apiData = {
        persona: data.persona || 'professional',
        scoringWeights: {
          budget: data.budget,
          authority: data.authority,
          need: data.need,
          timeline: data.timeline,
        },
        phoneSetup: data.phoneSetup,
        callHandling: data.callHandling,
        businessHours: data.businessHours,
        followUpPreference: data.followUpPreference,
        enableAutoResponse: data.enableAutoResponse ?? false,
      };
      // Use relative path - apiClient already has baseURL set
      const response = await apiClient.post('/onboarding/ai-configuration', apiData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate AI Training and AI Readiness caches so pages show fresh data
      queryClient.invalidateQueries({ queryKey: ['ai-training'] });
      queryClient.invalidateQueries({ queryKey: ['ai-readiness'] });
      toast.success('AI and phone configuration saved');
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to complete onboarding
 * @param options.skipRedirect - If true, don't auto-redirect to dashboard (for showing celebration screen)
 */
export const useCompleteOnboarding = (options?: { skipRedirect?: boolean }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const skipRedirect = options?.skipRedirect ?? false;

  return useMutation({
    mutationFn: async () => {
      // Use relative path - apiClient already has baseURL set
      const response = await apiClient.post('/onboarding/complete');
      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries so dashboard fetches fresh data
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['channels', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['ai-training'] });
      queryClient.invalidateQueries({ queryKey: ['ai-readiness'] });

      if (!skipRedirect) {
        toast.success('Onboarding completed! Welcome to Qualiflow AI.');
        router.push('/dashboard');
      }
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to skip onboarding and redirect to dashboard
 * Marks onboarding as skipped but not complete, allowing users to resume later.
 */
export const useSkipOnboarding = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Use relative path - apiClient already has baseURL set
      const response = await apiClient.post('/onboarding/skip');
      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries so dashboard fetches fresh data
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['channels', 'pending'] });
      toast.info('Setup skipped. You can complete it anytime from your dashboard.');
      router.push('/dashboard');
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to resume skipped onboarding
 */
export const useResumeOnboarding = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      // Use relative path - apiClient already has baseURL set
      const response = await apiClient.post('/onboarding/resume');
      return response.data;
    },
    onSuccess: () => {
      toast.success('Let\'s continue setting up your account!');
      router.push('/onboarding');
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to save current step progress (for step-by-step persistence)
 * Silently saves progress without toast notifications
 */
export const useSaveStepProgress = () => {
  return useMutation({
    mutationFn: async (step: number) => {
      // Use relative path - apiClient already has baseURL set
      const response = await apiClient.post(`/onboarding/step/${step}`);
      return response.data;
    },
    // Silent - no toast on success or error to avoid disrupting user flow
  });
};