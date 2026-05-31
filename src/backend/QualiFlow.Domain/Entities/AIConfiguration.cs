using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents the AI configuration for a business's lead qualification system.
/// Stores business-specific AI scoring criteria, persona, and thresholds.
/// </summary>
public class AIConfiguration : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant ID) for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the AI persona/tone for conversations.
    /// Valid values: "professional", "friendly", "casual", "formal".
    /// </summary>
    public string Persona { get; set; } = "professional";

    /// <summary>
    /// Gets or sets the qualification threshold score (0-100).
    /// Leads with scores above this threshold are considered qualified.
    /// </summary>
    public int QualificationThreshold { get; set; } = 70;

    /// <summary>
    /// Gets or sets the scoring weights as a JSON object.
    /// Format: {"budget":25,"timeline":25,"authority":25,"need":25}.
    /// Weights must sum to 100%.
    /// </summary>
    public string ScoringWeights { get; set; } = "{\"budget\":25,\"timeline\":25,\"authority\":25,\"need\":25}";

    /// <summary>
    /// Gets or sets the custom greeting message for AI conversations.
    /// </summary>
    public string GreetingMessage { get; set; } = "Hi! How can we help you today?";

    /// <summary>
    /// Gets or sets a value indicating whether to use industry-specific questions.
    /// </summary>
    public bool UseIndustryQuestions { get; set; } = true;

    /// <summary>
    /// Gets or sets the AI tone/personality (Step 10 of onboarding).
    /// Options: "friendly", "professional", "playful".
    /// </summary>
    public string AITone { get; set; } = "professional";

    /// <summary>
    /// Gets or sets the formality level for AI communication.
    /// Options: "formal", "semi-formal", "informal".
    /// </summary>
    public string Formality { get; set; } = "formal";

    /// <summary>
    /// Gets or sets the personality traits as a JSON array.
    /// Example: ["helpful", "knowledgeable", "friendly"].
    /// </summary>
    public string PersonalityTraits { get; set; } = "[\"helpful\", \"knowledgeable\"]";

    /// <summary>
    /// Gets or sets the business hours (Step 10 of onboarding).
    /// Options: "9-5", "8-6", "24-7", "custom".
    /// </summary>
    public string BusinessHours { get; set; } = "9-5";

    /// <summary>
    /// Gets or sets the follow-up preference (Step 10 of onboarding).
    /// Options: "sms-first", "email-first", "call-first".
    /// </summary>
    public string FollowUpPreference { get; set; } = "sms-first";

    /// <summary>
    /// Gets or sets the out-of-hours auto-response message.
    /// </summary>
    public string? OutOfHoursMessage { get; set; }

    /// <summary>
    /// Gets or sets the business hours start time (HH:mm format).
    /// </summary>
    public string? BusinessHoursStart { get; set; }

    /// <summary>
    /// Gets or sets the business hours end time (HH:mm format).
    /// </summary>
    public string? BusinessHoursEnd { get; set; }

    // ============================================================================
    // Configuration Tracking Fields
    // These fields track whether settings were explicitly configured by the user
    // vs using default values. This enables accurate AI Readiness checklist status.
    // ============================================================================

    /// <summary>
    /// Gets or sets a value indicating whether BANT scoring weights were explicitly configured by the user.
    /// Becomes true when user saves custom weights.
    /// </summary>
    public bool IsBantWeightsConfigured { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the qualification threshold was explicitly configured.
    /// Becomes true when user sets a custom threshold.
    /// </summary>
    public bool IsQualificationThresholdConfigured { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the AI persona was explicitly selected by the user.
    /// Becomes true when user chooses a persona.
    /// </summary>
    public bool IsPersonaConfigured { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether AI auto-response is enabled.
    /// User must explicitly enable auto-responses.
    /// </summary>
    public bool IsAutoResponseEnabled { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when BANT weights were last configured.
    /// </summary>
    public DateTime? BantWeightsConfiguredAt { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when qualification threshold was last configured.
    /// </summary>
    public DateTime? QualificationThresholdConfiguredAt { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when AI persona was last configured.
    /// </summary>
    public DateTime? PersonaConfiguredAt { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when auto-response setting was last changed.
    /// </summary>
    public DateTime? AutoResponseConfiguredAt { get; set; }

    // ============================================================================
    // Navigation Properties
    // ============================================================================

    /// <summary>
    /// Gets or sets the business this AI configuration belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;
}
