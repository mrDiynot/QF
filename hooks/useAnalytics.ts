/**
 * Analytics Hook
 * Provides convenient methods for tracking user events and behavior
 */

import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import * as Sentry from '@sentry/nextjs';
import {
  trackEvent,
  identifyUser,
  resetUser,
  setUserProperties,
  isFeatureEnabled,
  getFeatureFlag,
} from '@/lib/posthog';

// Analytics event types
export type AnalyticsEvent =
  // Auth events
  | 'user_registered'
  | 'user_logged_in'
  | 'user_logged_out'
  | 'oauth_started'
  | 'oauth_completed'
  | 'oauth_failed'
  // Onboarding events
  | 'onboarding_started'
  | 'onboarding_step_completed'
  | 'onboarding_steps_completed'
  | 'onboarding_completed'
  | 'onboarding_skipped'
  | 'onboarding_payment_redirect'
  | 'onboarding_payment_completed'
  | 'onboarding_checkout_plan_not_found'
  | 'ai_recommendations_applied'
  | 'ai_recommendations_skipped'
  | 'ai_channel_recommendations_requested'
  | 'ai_channel_recommendations_received'
  // Lead events
  | 'lead_created'
  | 'lead_viewed'
  | 'lead_qualified'
  | 'lead_assigned'
  | 'lead_exported'
  // Conversation events
  | 'conversation_started'
  | 'message_sent'
  | 'message_received'
  | 'conversation_closed'
  // Form events
  | 'form_created'
  | 'form_published'
  | 'form_submitted'
  // Feature usage
  | 'feature_used'
  | 'settings_changed'
  | 'subscription_upgraded'
  | 'subscription_downgraded'
  // Payment events
  | 'payment_canceled_dialog_shown'
  | 'payment_resumed'
  | 'payment_completed'
  | 'payment_failed'
  // Free tier events
  | 'free_tier_activated';

export function useAnalytics() {
  const { data: session } = useSession();

  // Track an event with optional properties
  const track = useCallback(
    (event: AnalyticsEvent, properties?: Record<string, unknown>) => {
      trackEvent(event, {
        ...properties,
        userId: session?.user?.id,
        businessId: session?.user?.businessId,
        timestamp: new Date().toISOString(),
      });
    },
    [session]
  );

  // Identify user after login/registration
  const identify = useCallback(() => {
    if (!session?.user?.id) return;

    const fullName = `${session.user.firstName} ${session.user.lastName}`.trim();

    // Identify in PostHog
    identifyUser(session.user.id, {
      email: session.user.email,
      name: fullName,
      businessId: session.user.businessId,
      role: session.user.role,
    });

    // Set Sentry user context
    Sentry.setUser({
      id: session.user.id,
      email: session.user.email || undefined,
      username: fullName || undefined,
    });
  }, [session]);

  // Reset user identity on logout
  const reset = useCallback(() => {
    resetUser();
    Sentry.setUser(null);
  }, []);

  // Set additional user properties
  const setProperties = useCallback(
    (properties: Record<string, unknown>) => {
      setUserProperties(properties);
    },
    []
  );

  // Check if a feature flag is enabled
  const checkFeature = useCallback((flagKey: string): boolean => {
    return isFeatureEnabled(flagKey);
  }, []);

  // Get feature flag value
  const getFeature = useCallback(<T = boolean | string>(flagKey: string): T | undefined => {
    return getFeatureFlag<T>(flagKey);
  }, []);

  // Track an error
  const trackError = useCallback(
    (error: Error, context?: Record<string, unknown>) => {
      Sentry.captureException(error, {
        extra: {
          ...context,
          userId: session?.user?.id,
          businessId: session?.user?.businessId,
        },
      });
    },
    [session]
  );

  return {
    track,
    identify,
    reset,
    setProperties,
    checkFeature,
    getFeature,
    trackError,
  };
}

