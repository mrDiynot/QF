namespace QualiFlow.Application.Features.AI.Interfaces;

/// <summary>
/// Service for managing AI persona configuration and building system prompts.
/// </summary>
public interface IAIPersonaService
{
    /// <summary>
    /// Gets the AI configuration for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The AI persona configuration.</returns>
    Task<AIPersonaConfiguration> GetConfigurationAsync(
        Guid businessId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Builds a system prompt for AI responses based on business configuration.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="intent">The detected intent of the conversation.</param>
    /// <param name="conversationContext">Optional context from the conversation.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The system prompt string for the AI model.</returns>
    Task<string> BuildSystemPromptAsync(
        Guid businessId,
        string intent,
        string? conversationContext = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the greeting message for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The greeting message.</returns>
    Task<string> GetGreetingMessageAsync(
        Guid businessId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if the current time is within business hours.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if within business hours, false otherwise.</returns>
    Task<bool> IsWithinBusinessHoursAsync(
        Guid businessId,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// AI persona configuration for a business.
/// </summary>
public record AIPersonaConfiguration
{
    /// <summary>
    /// Gets the AI persona/tone (professional, friendly, casual, formal).
    /// </summary>
    public required string Persona { get; init; }

    /// <summary>
    /// Gets the greeting message for new conversations.
    /// </summary>
    public required string GreetingMessage { get; init; }

    /// <summary>
    /// Gets the business hours setting.
    /// </summary>
    public required string BusinessHours { get; init; }

    /// <summary>
    /// Gets the follow-up preference (sms-first, email-first, call-first).
    /// </summary>
    public required string FollowUpPreference { get; init; }

    /// <summary>
    /// Gets the qualification threshold score (0-100).
    /// </summary>
    public int QualificationThreshold { get; init; }

    /// <summary>
    /// Gets the BANT scoring weights.
    /// </summary>
    public required ScoringWeights ScoringWeights { get; init; }

    /// <summary>
    /// Gets a value indicating whether to use industry-specific questions.
    /// </summary>
    public bool UseIndustryQuestions { get; init; }
}

/// <summary>
/// BANT scoring weights configuration.
/// </summary>
public record ScoringWeights
{
    /// <summary>
    /// Gets the weight for Budget criterion (0-100).
    /// </summary>
    public int Budget { get; init; } = 25;

    /// <summary>
    /// Gets the weight for Authority criterion (0-100).
    /// </summary>
    public int Authority { get; init; } = 25;

    /// <summary>
    /// Gets the weight for Need criterion (0-100).
    /// </summary>
    public int Need { get; init; } = 25;

    /// <summary>
    /// Gets the weight for Timeline criterion (0-100).
    /// </summary>
    public int Timeline { get; init; } = 25;
}
