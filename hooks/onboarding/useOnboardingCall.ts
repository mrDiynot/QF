/**
 * Onboarding Call Hooks
 * React Query hooks for booking, rescheduling, and cancelling onboarding calls
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/axios';
import {
  onboardingCallService,
  BookOnboardingCallRequest,
  RescheduleOnboardingCallRequest,
  CancelOnboardingCallRequest,
} from '@/services/api/onboardingCall.service';

// Query keys
export const onboardingCallKeys = {
  all: ['onboarding-call'] as const,
  slots: () => [...onboardingCallKeys.all, 'slots'] as const,
};

/**
 * Hook to fetch available time slots for onboarding calls
 */
export const useAvailableSlots = () => {
  return useQuery({
    queryKey: onboardingCallKeys.slots(),
    queryFn: onboardingCallService.getAvailableSlots,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to book an onboarding call
 */
export const useBookOnboardingCall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BookOnboardingCallRequest) => onboardingCallService.bookCall(request),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Onboarding call booked successfully!');
        // Invalidate onboarding status to refresh the call scheduled state
        queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
        queryClient.invalidateQueries({ queryKey: onboardingCallKeys.all });
      } else {
        toast.error(response.errorMessage || 'Failed to book onboarding call');
      }
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to reschedule an onboarding call
 */
export const useRescheduleOnboardingCall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RescheduleOnboardingCallRequest) => onboardingCallService.rescheduleCall(request),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Onboarding call rescheduled successfully!');
        queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
        queryClient.invalidateQueries({ queryKey: onboardingCallKeys.all });
      } else {
        toast.error(response.errorMessage || 'Failed to reschedule onboarding call');
      }
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to cancel an onboarding call
 */
export const useCancelOnboardingCall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CancelOnboardingCallRequest) => onboardingCallService.cancelCall(request),
    onSuccess: () => {
      toast.success('Onboarding call cancelled');
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
      queryClient.invalidateQueries({ queryKey: onboardingCallKeys.all });
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

