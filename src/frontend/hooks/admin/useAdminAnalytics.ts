/**
 * Admin Analytics Hook
 * Provides analytics tracking for admin portal actions using Sentry and PostHog
 */

'use client';

import { useCallback } from 'react';
import * as Sentry from '@sentry/nextjs';
import {
  trackEvent,
  identifyUser,
  resetUser,
  setUserProperties,
} from '@/lib/posthog';
import type { AdminUser } from '@/types/admin';

// Admin-specific event names
export const AdminEvents = {
  // Authentication
  ADMIN_LOGIN_ATTEMPTED: 'admin_login_attempted',
  ADMIN_LOGIN_SUCCESS: 'admin_login_success',
  ADMIN_LOGIN_FAILED: 'admin_login_failed',
  ADMIN_MFA_VERIFIED: 'admin_mfa_verified',
  ADMIN_MFA_SETUP_STARTED: 'admin_mfa_setup_started',
  ADMIN_MFA_SETUP_COMPLETED: 'admin_mfa_setup_completed',
  ADMIN_LOGOUT: 'admin_logout',
  ADMIN_SESSION_EXPIRED: 'admin_session_expired',

  // Business Management
  ADMIN_BUSINESS_VIEWED: 'admin_business_viewed',
  ADMIN_BUSINESS_SUSPENDED: 'admin_business_suspended',
  ADMIN_BUSINESS_REACTIVATED: 'admin_business_reactivated',
  ADMIN_BUSINESS_SEARCHED: 'admin_business_searched',

  // User Management
  ADMIN_USER_IMPERSONATION_STARTED: 'admin_user_impersonation_started',
  ADMIN_USER_IMPERSONATION_ENDED: 'admin_user_impersonation_ended',
  ADMIN_USER_VIEWED: 'admin_user_viewed',
  ADMIN_USER_SEARCHED: 'admin_user_searched',
  ADMIN_USER_SUSPENDED: 'admin_user_suspended',
  ADMIN_USER_REACTIVATED: 'admin_user_reactivated',
  ADMIN_PASSWORD_RESET_SENT: 'admin_password_reset_sent',

  // Audit Logs
  ADMIN_AUDIT_LOGS_VIEWED: 'admin_audit_logs_viewed',
  ADMIN_AUDIT_LOG_VIEWED: 'admin_audit_log_viewed',
  ADMIN_AUDIT_LOG_EXPORTED: 'admin_audit_log_exported',
  ADMIN_DATA_EXPORTED: 'admin_data_exported',

  // Admin User Management
  ADMIN_USER_CREATED: 'admin_user_created',
  ADMIN_USER_DEACTIVATED: 'admin_user_deactivated',
  ADMIN_USER_ROLE_CHANGED: 'admin_user_role_changed',

  // Dashboard
  ADMIN_DASHBOARD_VIEWED: 'admin_dashboard_viewed',
  ADMIN_DASHBOARD_REFRESHED: 'admin_dashboard_refreshed',

  // Settings
  ADMIN_SETTINGS_VIEWED: 'admin_settings_viewed',
  ADMIN_SETTINGS_UPDATED: 'admin_settings_updated',

  // Support Tickets
  ADMIN_SUPPORT_DASHBOARD_VIEWED: 'admin_support_dashboard_viewed',
  ADMIN_TICKET_VIEWED: 'admin_ticket_viewed',
  ADMIN_TICKET_SEARCHED: 'admin_ticket_searched',
  ADMIN_TICKET_STATUS_UPDATED: 'admin_ticket_status_updated',
  ADMIN_TICKET_ASSIGNED: 'admin_ticket_assigned',
  ADMIN_TICKET_PRIORITY_UPDATED: 'admin_ticket_priority_updated',
  ADMIN_TICKET_MESSAGE_SENT: 'admin_ticket_message_sent',
  ADMIN_TICKET_INTERNAL_NOTE_ADDED: 'admin_ticket_internal_note_added',

  // Subscriptions
  ADMIN_SUBSCRIPTION_VIEWED: 'admin_subscription_viewed',
  ADMIN_SUBSCRIPTION_SEARCHED: 'admin_subscription_searched',
  ADMIN_SUBSCRIPTION_PLAN_CHANGED: 'admin_subscription_plan_changed',
  ADMIN_SUBSCRIPTION_CANCELED: 'admin_subscription_canceled',
  ADMIN_SUBSCRIPTION_REACTIVATED: 'admin_subscription_reactivated',
  ADMIN_SUBSCRIPTION_TRIAL_EXTENDED: 'admin_subscription_trial_extended',
  ADMIN_SUBSCRIPTION_CREDIT_APPLIED: 'admin_subscription_credit_applied',

  // Errors
  ADMIN_ERROR_OCCURRED: 'admin_error_occurred',
} as const;

export type AdminEventName = (typeof AdminEvents)[keyof typeof AdminEvents];

export function useAdminAnalytics() {
  /**
   * Track an admin event
   */
  const track = useCallback(
    (eventName: AdminEventName, properties?: Record<string, unknown>) => {
      // Track in PostHog
      trackEvent(eventName, {
        ...properties,
        admin_portal: true,
        timestamp: new Date().toISOString(),
      });

      // Add Sentry breadcrumb for context
      Sentry.addBreadcrumb({
        category: 'admin-action',
        message: eventName,
        level: 'info',
        data: properties,
      });
    },
    []
  );

  /**
   * Identify admin user after login
   */
  const identifyAdmin = useCallback((adminUser: AdminUser) => {
    // Identify in PostHog with admin-specific properties
    identifyUser(`admin_${adminUser.id}`, {
      email: adminUser.email,
      name: adminUser.fullName,
      admin_role: adminUser.role,
      is_admin: true,
      two_factor_enabled: adminUser.twoFactorEnabled,
    });

    // Set Sentry user context
    Sentry.setUser({
      id: `admin_${adminUser.id}`,
      email: adminUser.email,
      username: adminUser.fullName,
    });

    // Set Sentry tags for admin context
    Sentry.setTag('admin_role', adminUser.role);
    Sentry.setTag('admin_portal', 'true');
  }, []);

  /**
   * Reset admin identity on logout
   */
  const resetAdminIdentity = useCallback(() => {
    resetUser();
    Sentry.setUser(null);
    Sentry.setTag('admin_role', null);
    Sentry.setTag('admin_portal', null);
  }, []);

  /**
   * Set additional admin properties
   */
  const setAdminProperties = useCallback(
    (properties: Record<string, unknown>) => {
      setUserProperties({
        ...properties,
        is_admin: true,
      });
    },
    []
  );

  /**
   * Track an error with admin context
   */
  const trackAdminError = useCallback(
    (error: Error, context?: Record<string, unknown>) => {
      // Capture in Sentry with admin context
      Sentry.captureException(error, {
        tags: {
          admin_portal: 'true',
        },
        extra: {
          ...context,
          admin_action: true,
        },
      });

      // Also track as event in PostHog
      track(AdminEvents.ADMIN_ERROR_OCCURRED, {
        error_name: error.name,
        error_message: error.message,
        ...context,
      });
    },
    [track]
  );

  /**
   * Track page view in admin portal
   */
  const trackAdminPageView = useCallback(
    (pageName: string, properties?: Record<string, unknown>) => {
      trackEvent('$pageview', {
        $current_url: window.location.href,
        page_name: pageName,
        admin_portal: true,
        ...properties,
      });
    },
    []
  );

  return {
    track,
    identifyAdmin,
    resetAdminIdentity,
    setAdminProperties,
    trackAdminError,
    trackAdminPageView,
    AdminEvents,
  };
}

