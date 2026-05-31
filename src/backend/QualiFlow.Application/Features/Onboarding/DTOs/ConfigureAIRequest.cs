namespace QualiFlow.Application.Features.Onboarding.DTOs;

/// <summary>
/// Request DTO for configuring AI and phone settings during onboarding (Steps 8-10).
/// Consolidates: Phone Setup, Call Handling, and AI Tone/Final Touches.
/// </summary>
public record ConfigureAIRequest
{
    /// <summary>
    /// Gets or sets the AI persona/tone (Step 10).
    /// Valid values: "professional", "friendly", "casual", "formal".
    /// </summary>
    public string Persona { get; set; } = "professional";

    /// <summary>
    /// Gets or sets the qualification threshold (0-100).
    /// </summary>
    public int QualificationThreshold { get; set; } = 70;

    /// <summary>
    /// Gets or sets the scoring weights.
    /// Must sum to 100.
    /// </summary>
    public ScoringWeightsDto ScoringWeights { get; set; } = new();

    /// <summary>
    /// Gets or sets the custom greeting message.
    /// </summary>
    public string GreetingMessage { get; set; } = "Hi! How can we help you today?";

    /// <summary>
    /// Gets or sets the phone setup configuration (Step 8).
    /// </summary>
    public PhoneSetupDto? PhoneSetup { get; set; }

    /// <summary>
    /// Gets or sets the call handling configuration (Step 9).
    /// </summary>
    public CallHandlingDto? CallHandling { get; set; }

    /// <summary>
    /// Gets or sets the business hours (Step 10).
    /// </summary>
    public string? BusinessHours { get; set; }

    /// <summary>
    /// Gets or sets the follow-up preference (Step 10).
    /// </summary>
    public string? FollowUpPreference { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether AI auto-response is enabled (Step 10).
    /// When enabled, AI will automatically respond to incoming messages.
    /// </summary>
    public bool EnableAutoResponse { get; set; }
}

/// <summary>
/// DTO for phone setup configuration (Step 8).
/// </summary>
public record PhoneSetupDto
{
    /// <summary>
    /// Gets or sets the phone setup type.
    /// Valid values: "existing", "new", "skip".
    /// </summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the existing phone number (if Type is "existing").
    /// </summary>
    public string? ExistingNumber { get; set; }

    /// <summary>
    /// Gets or sets the selected new AI phone number (if Type is "new").
    /// </summary>
    public string? NewNumber { get; set; }
}

/// <summary>
/// DTO for call handling configuration (Step 9).
/// </summary>
public record CallHandlingDto
{
    /// <summary>
    /// Gets or sets the call forwarding destination number.
    /// </summary>
    public string? ForwardNumber { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether to send SMS on missed calls.
    /// </summary>
    public bool SendSmsOnMissed { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether to enable outbound AI calling.
    /// </summary>
    public bool EnableOutboundAi { get; set; }
}
