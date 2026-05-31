using QualiFlow.Application.Features.Onboarding.DTOs;

namespace QualiFlow.Application.Features.Onboarding.Services;

/// <summary>
/// Service for generating industry-specific default configurations.
/// </summary>
public interface IIndustryDefaultsService
{
    /// <summary>
    /// Gets the default AI configuration for the specified industry.
    /// </summary>
    /// <param name="industry">The industry sector.</param>
    /// <returns>The industry-specific AI configuration defaults.</returns>
    ConfigureAIRequest GetAIDefaultsForIndustry(string? industry);

    /// <summary>
    /// Gets the default qualification threshold for the specified industry.
    /// </summary>
    /// <param name="industry">The industry sector.</param>
    /// <returns>The recommended qualification threshold (0-100).</returns>
    int GetQualificationThreshold(string? industry);

    /// <summary>
    /// Gets the default BANT scoring weights for the specified industry.
    /// </summary>
    /// <param name="industry">The industry sector.</param>
    /// <returns>The industry-specific BANT weights.</returns>
    ScoringWeightsDto GetScoringWeights(string? industry);

    /// <summary>
    /// Gets the default AI persona for the specified industry.
    /// </summary>
    /// <param name="industry">The industry sector.</param>
    /// <returns>The recommended persona (professional, friendly, casual, formal).</returns>
    string GetDefaultPersona(string? industry);
}
