namespace QualiFlow.Infrastructure.Constants;

/// <summary>
/// Constants for email-related values used throughout the application.
/// Centralizes sender information, URLs, subjects, and settings.
/// </summary>
#pragma warning disable S1075 // URIs should not be hardcoded - These are intentional application URLs
public static class EmailConstants
{
    // ============================================================================
    // SENDER INFORMATION
    // ============================================================================

    /// <summary>
    /// Default no-reply email address for transactional emails.
    /// </summary>
    public const string NoReplyEmail = "noreply@qualiflow.ai";

    /// <summary>
    /// Support email address for customer inquiries.
    /// </summary>
    public const string SupportEmail = "support@qualiflow.ai";

    /// <summary>
    /// Default sender name for all QualiFlow emails.
    /// </summary>
    public const string FromName = "QualiFlow";

    // ============================================================================
    // APPLICATION URLS
    // ============================================================================

    /// <summary>
    /// Base URL for the QualiFlow application.
    /// </summary>
    public const string AppBaseUrl = "https://app.qualiflow.ai";

    /// <summary>
    /// URL to the main dashboard.
    /// </summary>
    public const string DashboardUrl = "https://app.qualiflow.ai/dashboard";

    /// <summary>
    /// URL to the settings page.
    /// </summary>
    public const string SettingsUrl = "https://app.qualiflow.ai/settings";

    /// <summary>
    /// URL to the billing/subscription settings page.
    /// </summary>
    public const string BillingUrl = "https://app.qualiflow.ai/settings/subscription";

    /// <summary>
    /// URL to the payment methods page.
    /// </summary>
    public const string PaymentMethodsUrl = "https://app.qualiflow.ai/settings/subscription/payment-methods";

    /// <summary>
    /// URL to the pricing page for plan comparison.
    /// </summary>
    public const string PricingUrl = "https://qualiflow.ai/pricing";

    // ============================================================================
    // EMAIL SUBJECTS (with format placeholders)
    // ============================================================================

    /// <summary>
    /// Subject for subscription confirmation emails. {0} = plan name.
    /// </summary>
    public const string SubscriptionConfirmationSubject = "Welcome to {0}! Your Subscription is Active";

    /// <summary>
    /// Subject for trial expiring notifications. {0} = days remaining.
    /// </summary>
    public const string TrialExpiringSubject = "Your QualiFlow Trial Expires in {0} Days";

    /// <summary>
    /// Subject for subscription suspended notifications.
    /// </summary>
    public const string SubscriptionSuspendedSubject = "Action Required: Your QualiFlow Subscription is Suspended";

    /// <summary>
    /// Subject for payment failed notifications.
    /// </summary>
    public const string PaymentFailedSubject = "Payment Failed for Your QualiFlow Subscription";

    /// <summary>
    /// Subject for subscription cancelled notifications.
    /// </summary>
    public const string SubscriptionCancelledSubject = "Your QualiFlow Subscription Has Been Cancelled";

    // ============================================================================
    // TRIAL SETTINGS
    // ============================================================================

    /// <summary>
    /// Number of days before trial expiration to send warning email.
    /// </summary>
    public const int TrialExpirationWarningDays = 3;

    // ============================================================================
    // PAYMENT RETRY SETTINGS
    // ============================================================================

    /// <summary>
    /// Maximum number of payment retry attempts before suspending subscription.
    /// </summary>
    public const int MaxPaymentRetryAttempts = 3;

    /// <summary>
    /// Number of days within which to retry failed payments.
    /// </summary>
    public const int PaymentRetryWindowDays = 7;

    // ============================================================================
    // EMAIL TAGS
    // ============================================================================

    /// <summary>
    /// Tag type for subscription confirmation emails.
    /// </summary>
    public const string TagTypeSubscriptionConfirmation = "subscription_confirmation";

    /// <summary>
    /// Tag type for trial expiring emails.
    /// </summary>
    public const string TagTypeTrialExpiring = "trial_expiring";

    /// <summary>
    /// Tag type for subscription suspended emails.
    /// </summary>
    public const string TagTypeSubscriptionSuspended = "subscription_suspended";

    /// <summary>
    /// Tag type for payment failed emails.
    /// </summary>
    public const string TagTypePaymentFailed = "payment_failed";

    /// <summary>
    /// Tag type for subscription cancelled emails.
    /// </summary>
    public const string TagTypeSubscriptionCancelled = "subscription_cancelled";
}
#pragma warning restore S1075

