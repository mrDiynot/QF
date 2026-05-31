// -----------------------------------------------------------------------
// <copyright file="GenerateSmsTemplateRequest.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Request to generate SMS templates using AI.
/// </summary>
public record GenerateSmsTemplateRequest
{
    /// <summary>Gets the business ID for multi-tenancy.</summary>
    public required Guid BusinessId { get; init; }

    /// <summary>Gets the user ID who initiated the request.</summary>
    public required Guid UserId { get; init; }

    /// <summary>Gets the purpose or use case for the templates (e.g., "appointment reminders", "follow-up messages").</summary>
    public required string Purpose { get; init; }

    /// <summary>Gets the industry context for tailored messaging.</summary>
    public string? Industry { get; init; }

    /// <summary>Gets the desired tone (Professional, Friendly, Casual).</summary>
    public string Tone { get; init; } = "Professional";

    /// <summary>Gets the category for the generated templates.</summary>
    public string Category { get; init; } = "General";

    /// <summary>Gets the number of template variations to generate (1-5).</summary>
    public int VariationCount { get; init; } = 3;

    /// <summary>Gets optional context about the business or product.</summary>
    public string? BusinessContext { get; init; }

    /// <summary>Gets optional example templates to use as reference.</summary>
    public IReadOnlyList<string>? ExampleTemplates { get; init; }

    /// <summary>Gets a value indicating whether to include variable placeholders like {{name}}, {{date}}.</summary>
    public bool IncludeVariables { get; init; } = true;
}

/// <summary>
/// A single generated SMS template.
/// </summary>
public record GeneratedSmsTemplate
{
    /// <summary>Gets the template name.</summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>Gets the template content with optional variable placeholders.</summary>
    public string Content { get; init; } = string.Empty;

    /// <summary>Gets the template category.</summary>
    public string Category { get; init; } = "General";

    /// <summary>Gets the character count of the content.</summary>
    public int CharacterCount { get; init; }

    /// <summary>Gets the estimated SMS segment count (160 chars per segment).</summary>
    public int SegmentCount { get; init; }

    /// <summary>Gets the list of variables used in the template.</summary>
    public IReadOnlyList<string> Variables { get; init; } = [];
}

/// <summary>
/// Result of SMS template generation.
/// </summary>
public record SmsTemplateGenerationResult
{
    /// <summary>Gets a value indicating whether the generation was successful.</summary>
    public bool Success { get; init; }

    /// <summary>Gets the generated templates.</summary>
    public IReadOnlyList<GeneratedSmsTemplate> Templates { get; init; } = [];

    /// <summary>Gets the error message if generation failed.</summary>
    public string? ErrorMessage { get; init; }

    /// <summary>Gets the audit ID for tracking.</summary>
    public Guid? AuditId { get; init; }

    /// <summary>Gets the total tokens used.</summary>
    public int TokensUsed { get; init; }

    /// <summary>Gets the estimated cost in USD.</summary>
    public decimal EstimatedCostUsd { get; init; }

    /// <summary>Gets the generation duration in milliseconds.</summary>
    public long DurationMs { get; init; }

    /// <summary>Gets a value indicating whether the usage limit was exceeded.</summary>
    public bool LimitExceeded { get; init; }

    /// <summary>
    /// Creates a successful result.
    /// </summary>
    /// <param name="templates">The generated templates.</param>
    /// <param name="auditId">The audit ID for tracking.</param>
    /// <param name="tokensUsed">The total tokens used.</param>
    /// <param name="estimatedCost">The estimated cost in USD.</param>
    /// <param name="durationMs">The generation duration in milliseconds.</param>
    /// <returns>A successful generation result.</returns>
    public static SmsTemplateGenerationResult Succeeded(
        IReadOnlyList<GeneratedSmsTemplate> templates,
        Guid auditId,
        int tokensUsed,
        decimal estimatedCost,
        long durationMs)
    {
        return new SmsTemplateGenerationResult
        {
            Success = true,
            Templates = templates,
            AuditId = auditId,
            TokensUsed = tokensUsed,
            EstimatedCostUsd = estimatedCost,
            DurationMs = durationMs,
        };
    }

    /// <summary>
    /// Creates a failed result.
    /// </summary>
    /// <param name="errorMessage">The error message.</param>
    /// <param name="limitExceeded">Whether the usage limit was exceeded.</param>
    /// <returns>A failed generation result.</returns>
    public static SmsTemplateGenerationResult Failed(string errorMessage, bool limitExceeded = false)
    {
        return new SmsTemplateGenerationResult
        {
            Success = false,
            ErrorMessage = errorMessage,
            LimitExceeded = limitExceeded,
        };
    }
}

