// -----------------------------------------------------------------------
// <copyright file="OnboardingRecommendationRequest.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.ComponentModel.DataAnnotations;

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Request for AI-powered onboarding recommendations.
/// </summary>
public sealed record OnboardingRecommendationRequest
{
    /// <summary>Gets the business ID.</summary>
    public required Guid BusinessId { get; init; }

    /// <summary>Gets the industry/business type.</summary>
    [Required]
    [StringLength(100)]
    public required string Industry { get; init; }

    /// <summary>Gets the company size.</summary>
    [StringLength(50)]
    public string? CompanySize { get; init; }

    /// <summary>Gets the business goals (multi-select).</summary>
    public IReadOnlyList<string> Goals { get; init; } = [];

    /// <summary>Gets the lead type (B2B, B2C, or Both).</summary>
    [StringLength(20)]
    public string? LeadType { get; init; }

    /// <summary>Gets the main objective.</summary>
    [StringLength(100)]
    public string? MainObjective { get; init; }

    /// <summary>Gets the current lead sources.</summary>
    public IReadOnlyList<string> LeadSources { get; init; } = [];

    /// <summary>Gets the target audience description.</summary>
    [StringLength(500)]
    public string? TargetAudience { get; init; }
}

/// <summary>
/// Result of AI onboarding recommendations.
/// </summary>
public sealed record OnboardingRecommendationResult
{
    /// <summary>Gets a value indicating whether the generation was successful.</summary>
    public bool Success { get; init; }

    /// <summary>Gets the error message if failed.</summary>
    public string? ErrorMessage { get; init; }

    /// <summary>Gets the recommended channels with priority scores.</summary>
    public IReadOnlyList<ChannelRecommendation> RecommendedChannels { get; init; } = [];

    /// <summary>Gets the recommended workflow templates.</summary>
    public IReadOnlyList<WorkflowRecommendation> RecommendedWorkflows { get; init; } = [];

    /// <summary>Gets the recommended form configurations.</summary>
    public IReadOnlyList<FormRecommendation> RecommendedForms { get; init; } = [];

    /// <summary>Gets the recommended AI configuration settings.</summary>
    public AIConfigRecommendation? AIConfiguration { get; init; }

    /// <summary>Gets the recommended automation priorities.</summary>
    public IReadOnlyList<AutomationRecommendation> RecommendedAutomations { get; init; } = [];

    /// <summary>Gets the audit ID for feedback tracking.</summary>
    public Guid? AuditId { get; init; }

    /// <summary>Gets the number of tokens used.</summary>
    public int TokensUsed { get; init; }

    /// <summary>Gets the generation time in milliseconds.</summary>
    public int GenerationTimeMs { get; init; }

    /// <summary>Creates a failed result.</summary>
    /// <param name="errorMessage">The error message.</param>
    /// <returns>A failed OnboardingRecommendationResult.</returns>
    public static OnboardingRecommendationResult Failed(string errorMessage) =>
        new() { Success = false, ErrorMessage = errorMessage };
}

/// <summary>
/// Channel recommendation with priority and rationale.
/// </summary>
public sealed record ChannelRecommendation
{
    /// <summary>Gets the channel type (sms, voice, whatsapp, webchat, email, instagram, facebook).</summary>
    public required string ChannelType { get; init; }

    /// <summary>Gets the priority score (1-100).</summary>
    public int Priority { get; init; }

    /// <summary>Gets the rationale for this recommendation.</summary>
    public string? Rationale { get; init; }

    /// <summary>Gets a value indicating whether this channel is highly recommended.</summary>
    public bool IsHighlyRecommended { get; init; }

    /// <summary>Gets the expected impact description.</summary>
    public string? ExpectedImpact { get; init; }
}

/// <summary>
/// Workflow template recommendation.
/// </summary>
public sealed record WorkflowRecommendation
{
    /// <summary>Gets the workflow template name.</summary>
    public required string Name { get; init; }

    /// <summary>Gets the workflow description.</summary>
    public string? Description { get; init; }

    /// <summary>Gets the trigger type.</summary>
    public required string TriggerType { get; init; }

    /// <summary>Gets the workflow category.</summary>
    public string? Category { get; init; }

    /// <summary>Gets the priority score (1-100).</summary>
    public int Priority { get; init; }

    /// <summary>Gets the rationale for this recommendation.</summary>
    public string? Rationale { get; init; }
}

/// <summary>
/// Form configuration recommendation.
/// </summary>
public sealed record FormRecommendation
{
    /// <summary>Gets the form name.</summary>
    public required string Name { get; init; }

    /// <summary>Gets the form purpose.</summary>
    public string? Purpose { get; init; }

    /// <summary>Gets the recommended fields.</summary>
    public IReadOnlyList<string> RecommendedFields { get; init; } = [];

    /// <summary>Gets the BANT fields to include.</summary>
    public IReadOnlyList<string> BantFields { get; init; } = [];

    /// <summary>Gets the priority score (1-100).</summary>
    public int Priority { get; init; }

    /// <summary>Gets the rationale for this recommendation.</summary>
    public string? Rationale { get; init; }
}

/// <summary>
/// AI configuration recommendation.
/// </summary>
public sealed record AIConfigRecommendation
{
    /// <summary>Gets the recommended AI tone.</summary>
    public string? RecommendedTone { get; init; }

    /// <summary>Gets the recommended qualification threshold (0-100).</summary>
    public int QualificationThreshold { get; init; } = 70;

    /// <summary>Gets the recommended BANT scoring weights.</summary>
    public BantWeights? ScoringWeights { get; init; }

    /// <summary>Gets the recommended greeting message.</summary>
    public string? GreetingMessage { get; init; }

    /// <summary>Gets the recommended follow-up preference.</summary>
    public string? FollowUpPreference { get; init; }

    /// <summary>Gets the rationale for these recommendations.</summary>
    public string? Rationale { get; init; }
}

/// <summary>
/// BANT scoring weights.
/// </summary>
public sealed record BantWeights
{
    /// <summary>Gets the budget weight (0-100).</summary>
    public int Budget { get; init; } = 25;

    /// <summary>Gets the authority weight (0-100).</summary>
    public int Authority { get; init; } = 25;

    /// <summary>Gets the need weight (0-100).</summary>
    public int Need { get; init; } = 25;

    /// <summary>Gets the timeline weight (0-100).</summary>
    public int Timeline { get; init; } = 25;
}

/// <summary>
/// Automation recommendation.
/// </summary>
public sealed record AutomationRecommendation
{
    /// <summary>Gets the automation name.</summary>
    public required string Name { get; init; }

    /// <summary>Gets the automation description.</summary>
    public string? Description { get; init; }

    /// <summary>Gets the automation category.</summary>
    public string? Category { get; init; }

    /// <summary>Gets the priority score (1-100).</summary>
    public int Priority { get; init; }

    /// <summary>Gets the rationale for this recommendation.</summary>
    public string? Rationale { get; init; }

    /// <summary>Gets a value indicating whether this is a quick win.</summary>
    public bool IsQuickWin { get; init; }
}

