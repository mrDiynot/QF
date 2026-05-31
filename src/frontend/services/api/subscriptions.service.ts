/**
 * Subscriptions API Service
 * Handles all subscription and billing-related API calls
 */

import { apiClient, publicApiClient } from '@/lib/axios';
import { AxiosError } from 'axios';

/** Error thrown when subscription data cannot be fetched */
export class SubscriptionError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_FOUND' | 'NETWORK_ERROR' | 'SERVER_ERROR' | 'UNAUTHORIZED',
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'SubscriptionError';
  }
}

/** Subscription fetch result - either data or error, never null fallback */
export interface SubscriptionResult {
  subscription: import('@/types/api').Subscription | null;
  error: SubscriptionError | null;
  isLoading: boolean;
}
import type {
  SubscriptionPlan,
  Subscription,
  SubscriptionUsage,
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
  BillingPortalResponse,
  CheckoutSessionDetails,
} from '@/types/api';

export const subscriptionsService = {
  /**
   * Get all available subscription plans (PUBLIC - no auth required)
   * GET /api/v1/subscriptions/plans
   * Note: This endpoint is [AllowAnonymous] for pricing page
   */
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await publicApiClient.get<SubscriptionPlan[]>('/subscriptions/plans');
    return response.data;
  },

  /**
   * Get current subscription for the authenticated user's business
   * GET /api/v1/subscriptions/current
   * 
   * IMPORTANT: Every business MUST have a subscription. A 404 indicates a data integrity issue.
   * This method throws SubscriptionError for proper error handling - never silently returns null.
   */
  getCurrentSubscription: async (): Promise<Subscription> => {
    try {
      // Backend returns nested structure: { subscription: {...}, limits: {...}, featureKeys: [...], usage: {...} }
      const response = await apiClient.get<{
        subscription: {
          id: string;
          planId: string;
          planName: string;
          status: string;
          currentPeriodStart: string;
          currentPeriodEnd: string;
          trialEnd?: string;
          cancelAtPeriodEnd: boolean;
          monthlyAmount?: number;
          currency?: string;
        };
        limits: Record<string, number>;
        featureKeys: string[];
        usage: Record<string, unknown>;
      }>('/subscriptions/current');
      
      // Extract and flatten the subscription data
      const { subscription, featureKeys } = response.data;
      return {
        ...subscription,
        featureKeys,
      } as Subscription;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const status = axiosError.response?.status;
      const message = axiosError.response?.data?.message || axiosError.message;
      
      if (status === 404) {
        // This should NEVER happen in production - every business must have a subscription
        throw new SubscriptionError(
          'Subscription not found. Please contact support.',
          'NOT_FOUND',
          404
        );
      }
      
      if (status === 401 || status === 403) {
        throw new SubscriptionError(
          'Authentication required to view subscription.',
          'UNAUTHORIZED',
          status
        );
      }
      
      if (!axiosError.response) {
        // Network error - no response received
        throw new SubscriptionError(
          'Unable to connect to server. Please check your connection.',
          'NETWORK_ERROR'
        );
      }
      
      // Server error (5xx) or other errors
      throw new SubscriptionError(
        message || 'Failed to load subscription data.',
        'SERVER_ERROR',
        status
      );
    }
  },

  /**
   * Get current usage for the authenticated user's business
   * GET /api/v1/subscriptions/usage
   */
  getUsage: async (): Promise<SubscriptionUsage> => {
    const response = await apiClient.get<SubscriptionUsage>('/subscriptions/usage');
    return response.data;
  },

  /**
   * Create a Stripe checkout session for subscription
   * POST /api/v1/subscriptions/checkout
   */
  createCheckoutSession: async (
    data: CreateCheckoutSessionRequest
  ): Promise<CreateCheckoutSessionResponse> => {
    const response = await apiClient.post<CreateCheckoutSessionResponse>(
      '/subscriptions/checkout',
      data
    );
    return response.data;
  },

  /**
   * Upgrade to a new plan
   * POST /api/v1/subscriptions/upgrade
   */
  upgradePlan: async (planId: string): Promise<Subscription> => {
    const response = await apiClient.post<Subscription>('/subscriptions/upgrade', {
      planId,
    });
    return response.data;
  },

  /**
   * Downgrade to a new plan (takes effect at end of billing period)
   * POST /api/v1/subscriptions/downgrade
   */
  downgradePlan: async (planId: string): Promise<Subscription> => {
    const response = await apiClient.post<Subscription>('/subscriptions/downgrade', {
      planId,
    });
    return response.data;
  },

  /**
   * Cancel subscription (takes effect at end of billing period)
   * POST /api/v1/subscriptions/cancel
   */
  cancelSubscription: async (): Promise<Subscription> => {
    const response = await apiClient.post<Subscription>('/subscriptions/cancel');
    return response.data;
  },

  /**
   * Reactivate a canceled subscription
   * POST /api/v1/subscriptions/reactivate
   */
  reactivateSubscription: async (): Promise<Subscription> => {
    const response = await apiClient.post<Subscription>('/subscriptions/reactivate');
    return response.data;
  },

  /**
   * Get Stripe billing portal URL
   * GET /api/v1/subscriptions/billing-portal
   */
  getBillingPortalUrl: async (returnUrl?: string): Promise<BillingPortalResponse> => {
    const response = await apiClient.get<BillingPortalResponse>('/subscriptions/billing-portal', {
      params: { returnUrl },
    });
    return response.data;
  },

  /**
   * Verify a checkout session and get details
   * GET /api/v1/subscriptions/verify-checkout/:sessionId
   */
  verifyCheckoutSession: async (sessionId: string): Promise<CheckoutSessionDetails> => {
    const response = await apiClient.get<CheckoutSessionDetails>(
      `/subscriptions/verify-checkout/${sessionId}`
    );
    return response.data;
  },

  /**
   * Get pending subscription intent for the current user's business.
   * Returns null if no pending intent exists.
   * GET /api/v1/subscriptions/pending-intent
   */
  getPendingIntent: async (): Promise<PendingIntentResponse | null> => {
    try {
      const response = await apiClient.get<PendingIntentResponse>('/subscriptions/pending-intent');
      return response.data;
    } catch (error) {
      const axiosError = error as { response?: { status?: number } };
      // 204 No Content means no pending intent
      if (axiosError.response?.status === 204) {
        return null;
      }
      // Other errors (401, 403, 500) should propagate
      throw error;
    }
  },

  // ============================================================================
  // INVOICE HISTORY (Sprint 36)
  // ============================================================================

  /**
   * Get invoice history for the current business
   * GET /api/v1/subscriptions/invoices
   */
  getInvoices: async (limit = 10, startingAfter?: string): Promise<InvoiceListResult> => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (startingAfter) {
      params.append('startingAfter', startingAfter);
    }
    const response = await apiClient.get<InvoiceListResult>(`/subscriptions/invoices?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a specific invoice by ID
   * GET /api/v1/subscriptions/invoices/:invoiceId
   */
  getInvoiceById: async (invoiceId: string): Promise<InvoiceDto> => {
    const response = await apiClient.get<InvoiceDto>(`/subscriptions/invoices/${invoiceId}`);
    return response.data;
  },

  // ============================================================================
  // PAYMENT METHODS (Sprint 36)
  // ============================================================================

  /**
   * Get all payment methods for the current business
   * GET /api/v1/subscriptions/payment-methods
   */
  getPaymentMethods: async (): Promise<PaymentMethodDto[]> => {
    const response = await apiClient.get<PaymentMethodDto[]>('/subscriptions/payment-methods');
    return response.data;
  },

  /**
   * Create a setup intent for adding a new payment method
   * POST /api/v1/subscriptions/payment-methods/setup-intent
   */
  createSetupIntent: async (): Promise<{ clientSecret: string }> => {
    const response = await apiClient.post<{ clientSecret: string }>('/subscriptions/payment-methods/setup-intent');
    return response.data;
  },

  /**
   * Set a payment method as the default
   * POST /api/v1/subscriptions/payment-methods/:paymentMethodId/default
   */
  setDefaultPaymentMethod: async (paymentMethodId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post<{ success: boolean }>(
      `/subscriptions/payment-methods/${paymentMethodId}/default`
    );
    return response.data;
  },

  /**
   * Delete a payment method
   * DELETE /api/v1/subscriptions/payment-methods/:paymentMethodId
   */
  deletePaymentMethod: async (paymentMethodId: string): Promise<void> => {
    await apiClient.delete(`/subscriptions/payment-methods/${paymentMethodId}`);
  },

  // ============================================================================
  // OVERAGE ALERTS (Sprint 36)
  // ============================================================================

  /**
   * Get overage alert settings for the current business
   * GET /api/v1/subscriptions/overage-alerts
   */
  getOverageAlertSettings: async (): Promise<OverageAlertSettingsDto> => {
    const response = await apiClient.get<OverageAlertSettingsDto>('/subscriptions/overage-alerts');
    return response.data;
  },

  /**
   * Update overage alert settings
   * PUT /api/v1/subscriptions/overage-alerts
   */
  updateOverageAlertSettings: async (settings: UpdateOverageAlertSettingsRequest): Promise<OverageAlertSettingsDto> => {
    const response = await apiClient.put<OverageAlertSettingsDto>('/subscriptions/overage-alerts', settings);
    return response.data;
  },
};

// ============================================================================
// Additional Types for Sprint 36 Features
// ============================================================================

export interface InvoiceDto {
  id: string;
  number: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  amountDue: number;
  amountPaid: number;
  currency: string;
  createdAt: string;
  dueDate?: string;
  paidAt?: string;
  description?: string;
  hostedInvoiceUrl?: string;
  invoicePdfUrl?: string;
  lineItems: InvoiceLineItemDto[];
}

export interface InvoiceLineItemDto {
  description: string;
  quantity: number;
  unitAmount: number;
  amount: number;
}

export interface InvoiceListResult {
  invoices: InvoiceDto[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface PaymentMethodDto {
  id: string;
  type: string;
  cardBrand?: string;
  cardLast4?: string;
  cardExpMonth?: number;
  cardExpYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface OverageAlertSettingsDto {
  isEnabled: boolean;
  emailNotificationsEnabled: boolean;
  inAppNotificationsEnabled: boolean;
  alertAt50Percent: boolean;
  alertAt75Percent: boolean;
  alertAt90Percent: boolean;
  alertAt100Percent: boolean;
  notifyEmails: string[];
}

export interface UpdateOverageAlertSettingsRequest {
  isEnabled?: boolean;
  emailNotificationsEnabled?: boolean;
  inAppNotificationsEnabled?: boolean;
  alertAt50Percent?: boolean;
  alertAt75Percent?: boolean;
  alertAt90Percent?: boolean;
  alertAt100Percent?: boolean;
  notifyEmails?: string[];
}

/**
 * Response for pending subscription intent.
 * Returned when user has an incomplete payment flow.
 */
export interface PendingIntentResponse {
  intentId: string;
  planId: string;
  planName: string;
  planDisplayName: string;
  billingInterval: 'monthly' | 'yearly';
  includeOnboarding: boolean;
  stripeCheckoutSessionId?: string;
  amountCents?: number;
  currency: string;
  createdAt: string;
  expiresAt?: string;
}
