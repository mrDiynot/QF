namespace QualiFlow.Domain.Constants;

/// <summary>
/// Constants for subscription plan names and billing used throughout the application.
/// These values are used across all layers (Domain, Application, Infrastructure).
/// </summary>
public static class PlanConstants
{
    // ============================================================================
    // PLAN NAMES (internal identifiers)
    // ============================================================================

    /// <summary>
    /// The default plan name assigned to new registrations (free tier).
    /// </summary>
    public const string FreeFlow = "freeflow";

    /// <summary>
    /// Smart Flow plan name (starter paid tier).
    /// </summary>
    public const string SmartFlow = "smartflow";

    /// <summary>
    /// Ultra Flow plan name (professional paid tier).
    /// </summary>
    public const string UltraFlow = "ultraflow";

    /// <summary>
    /// Enterprise plan name (custom enterprise tier).
    /// </summary>
    public const string Enterprise = "enterprise";

    // ============================================================================
    // BILLING INTERVALS
    // ============================================================================

    /// <summary>
    /// Monthly billing interval value.
    /// </summary>
    public const string BillingMonthly = "monthly";

    /// <summary>
    /// Yearly billing interval value.
    /// </summary>
    public const string BillingYearly = "yearly";

    // ============================================================================
    // CURRENCY
    // ============================================================================

    /// <summary>
    /// Default currency for subscription billing.
    /// </summary>
    public const string DefaultCurrency = "USD";
}

