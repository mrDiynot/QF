using QualiFlow.Domain.Constants;

namespace QualiFlow.Infrastructure.Constants;

/// <summary>
/// Constants for subscription-related values used throughout the application.
/// Centralizes plan names, billing intervals, currency, and job settings.
/// References PlanConstants from Domain layer for core plan values.
/// </summary>
public static class SubscriptionConstants
{
    // ============================================================================
    // DEFAULT PLAN (delegated to Domain.Constants.PlanConstants)
    // ============================================================================

    /// <summary>
    /// The default plan name assigned to new registrations (free tier).
    /// </summary>
    public const string DefaultPlanName = PlanConstants.FreeFlow;

    /// <summary>
    /// Smart Flow plan name.
    /// </summary>
    public const string SmartFlowPlanName = PlanConstants.SmartFlow;

    /// <summary>
    /// Ultra Flow plan name.
    /// </summary>
    public const string UltraFlowPlanName = PlanConstants.UltraFlow;

    /// <summary>
    /// Enterprise plan name.
    /// </summary>
    public const string EnterprisePlanName = PlanConstants.Enterprise;

    // ============================================================================
    // BILLING INTERVALS (delegated to Domain.Constants.PlanConstants)
    // ============================================================================

    /// <summary>
    /// Monthly billing interval value.
    /// </summary>
    public const string BillingIntervalMonthly = PlanConstants.BillingMonthly;

    /// <summary>
    /// Yearly billing interval value.
    /// </summary>
    public const string BillingIntervalYearly = PlanConstants.BillingYearly;

    // ============================================================================
    // CURRENCY (delegated to Domain.Constants.PlanConstants)
    // ============================================================================

    /// <summary>
    /// Default currency for subscription billing.
    /// </summary>
    public const string DefaultCurrency = PlanConstants.DefaultCurrency;

    // ============================================================================
    // BOOKING REMINDER JOB SETTINGS
    // ============================================================================

    /// <summary>
    /// Hours before booking to send 24-hour reminder.
    /// </summary>
    public const int BookingReminderHours24 = 24;

    /// <summary>
    /// Hours before booking to send 1-hour reminder.
    /// </summary>
    public const int BookingReminderHours1 = 1;

    /// <summary>
    /// Minimum minutes range for 24-hour reminder window (23 hours).
    /// </summary>
    public const int BookingReminder24HoursMinRange = 23;

    /// <summary>
    /// Maximum hours range for 24-hour reminder window (25 hours).
    /// </summary>
    public const int BookingReminder24HoursMaxRange = 25;

    /// <summary>
    /// Minimum minutes range for 1-hour reminder window (55 minutes).
    /// </summary>
    public const int BookingReminder1HourMinMinutes = 55;

    /// <summary>
    /// Maximum minutes range for 1-hour reminder window (65 minutes).
    /// </summary>
    public const int BookingReminder1HourMaxMinutes = 65;

    // ============================================================================
    // SUBSCRIPTION STATUS CHECK SETTINGS
    // ============================================================================

    /// <summary>
    /// Number of days before trial expiration to send warning.
    /// </summary>
    public const int TrialExpirationWarningDays = 3;

    /// <summary>
    /// Number of days to look back for failed payments in retry job.
    /// </summary>
    public const int FailedPaymentLookbackDays = 7;

    /// <summary>
    /// Maximum number of failed payment attempts before suspension.
    /// </summary>
    public const int MaxFailedPaymentAttempts = 3;

    // ============================================================================
    // STRIPE WEBHOOK EVENT TYPES
    // ============================================================================

    /// <summary>
    /// Stripe event type for completed checkout session.
    /// </summary>
    public const string StripeEventCheckoutCompleted = "checkout.session.completed";

    /// <summary>
    /// Stripe event type for subscription updated.
    /// </summary>
    public const string StripeEventSubscriptionUpdated = "customer.subscription.updated";

    /// <summary>
    /// Stripe event type for subscription deleted.
    /// </summary>
    public const string StripeEventSubscriptionDeleted = "customer.subscription.deleted";

    /// <summary>
    /// Stripe event type for invoice paid.
    /// </summary>
    public const string StripeEventInvoicePaid = "invoice.paid";

    /// <summary>
    /// Stripe event type for invoice payment failed.
    /// </summary>
    public const string StripeEventInvoicePaymentFailed = "invoice.payment_failed";
}

