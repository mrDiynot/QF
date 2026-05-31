/**
 * Onboarding Call API Service
 * Handles booking, rescheduling, and cancelling onboarding calls via Cal.com integration
 */

import { apiClient } from '@/lib/axios';

// ============================================================================
// Types
// ============================================================================

export interface OnboardingCallSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface AvailableSlotsResponse {
  slots: OnboardingCallSlot[];
}

export interface BookOnboardingCallRequest {
  scheduledAt: string;
  timezone?: string;
  notes?: string;
}

export interface BookOnboardingCallResponse {
  success: boolean;
  bookingUid?: string;
  scheduledAt?: string;
  errorMessage?: string;
}

export interface RescheduleOnboardingCallRequest {
  newScheduledAt: string;
  reason?: string;
}

export interface CancelOnboardingCallRequest {
  reason?: string;
}

// ============================================================================
// Service
// ============================================================================

export const onboardingCallService = {
  /**
   * Get available time slots for the next 2 weeks
   * GET /api/v1/onboarding/call/slots
   */
  getAvailableSlots: async (): Promise<AvailableSlotsResponse> => {
    const response = await apiClient.get<AvailableSlotsResponse>('/onboarding/call/slots');
    return response.data;
  },

  /**
   * Book an onboarding call
   * POST /api/v1/onboarding/call/book
   */
  bookCall: async (request: BookOnboardingCallRequest): Promise<BookOnboardingCallResponse> => {
    const response = await apiClient.post<BookOnboardingCallResponse>('/onboarding/call/book', request);
    return response.data;
  },

  /**
   * Reschedule an existing onboarding call
   * POST /api/v1/onboarding/call/reschedule
   */
  rescheduleCall: async (request: RescheduleOnboardingCallRequest): Promise<BookOnboardingCallResponse> => {
    const response = await apiClient.post<BookOnboardingCallResponse>('/onboarding/call/reschedule', request);
    return response.data;
  },

  /**
   * Cancel an existing onboarding call
   * POST /api/v1/onboarding/call/cancel
   */
  cancelCall: async (request: CancelOnboardingCallRequest): Promise<{ success: boolean }> => {
    const response = await apiClient.post<{ success: boolean }>('/onboarding/call/cancel', request);
    return response.data;
  },
};

