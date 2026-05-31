namespace QualiFlow.Domain.Enums;

/// <summary>
/// Subscription tier levels for QualiFlow platform.
/// Aligned with Figma pricing specification.
/// </summary>
public enum SubscriptionTier
{
    /// <summary>
    /// Free Flow tier - $0 (view-only access to journeys).
    /// 3 test voice calls, limited SMS, 5MB knowledge base, 1 user.
    /// Prebuilt journeys: View only (0 active instances).
    /// </summary>
    FreeFlow = 0,

    /// <summary>
    /// Smart Flow tier - $199/month.
    /// 10,000 AI interactions, 100 voice minutes, 500 SMS, 20MB knowledge base, 3 users.
    /// Prebuilt journeys: Full (all 10 journeys, 5 instances each).
    /// </summary>
    SmartFlow = 1,

    /// <summary>
    /// Ultra Flow tier - $699/month.
    /// 50,000 AI interactions, 500 voice minutes, 2,500 SMS, 100MB knowledge base, 10 users.
    /// Prebuilt journeys: Full+Advanced (all 10 journeys, 20 instances each).
    /// Includes advanced automations, multi-calendar routing, dedicated success manager.
    /// </summary>
    UltraFlow = 2,

    /// <summary>
    /// Enterprise tier - Custom pricing.
    /// Unlimited AI interactions, voice minutes, SMS, 250MB+ knowledge base, unlimited users.
    /// Prebuilt journeys: Full+Custom (all 10 journeys, unlimited instances).
    /// Includes custom AI training, SOC2-ready security, custom integrations, priority support.
    /// </summary>
    Enterprise = 3
}

