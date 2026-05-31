// -----------------------------------------------------------------------
// <copyright file="IAIFormGenerationService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.Interfaces;

/// <summary>
/// Service interface for AI-powered form generation.
/// Generates optimized lead capture forms with BANT-mapped fields based on natural language descriptions.
/// </summary>
public interface IAIFormGenerationService
{
    /// <summary>
    /// Generates a form based on industry, purpose, and desired fields using AI.
    /// </summary>
    /// <param name="request">The form generation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The generated form with fields and metadata.</returns>
    Task<FormGenerationResult> GenerateFormAsync(
        GenerateFormRequest request,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Request to generate a form using AI.
/// </summary>
public sealed record GenerateFormRequest
{
    /// <summary>Gets the business ID for multi-tenancy.</summary>
    public required Guid BusinessId { get; init; }

    /// <summary>Gets the user ID requesting the generation.</summary>
    public Guid? UserId { get; init; }

    /// <summary>Gets the industry/vertical (e.g., "Real Estate", "Healthcare", "SaaS").</summary>
    public required string Industry { get; init; }

    /// <summary>Gets the purpose of the form (e.g., "Lead capture", "Demo request", "Contact us").</summary>
    public required string Purpose { get; init; }

    /// <summary>Gets optional desired fields to include.</summary>
    public IReadOnlyList<string>? DesiredFields { get; init; }

    /// <summary>Gets optional tone/style preferences (e.g., "Professional", "Casual", "Friendly").</summary>
    public string? Tone { get; init; }

    /// <summary>Gets a value indicating whether to include BANT qualification fields.</summary>
    public bool IncludeBantFields { get; init; } = true;

    /// <summary>Gets the maximum number of fields to generate (default: 8).</summary>
    public int MaxFields { get; init; } = 8;
}

/// <summary>
/// Result of AI form generation.
/// </summary>
public sealed record FormGenerationResult
{
    /// <summary>Gets a value indicating whether generation was successful.</summary>
    public required bool Success { get; init; }

    /// <summary>Gets the generated form data.</summary>
    public GeneratedFormData? Form { get; init; }

    /// <summary>Gets the AI generation audit ID for feedback tracking.</summary>
    public Guid? AuditId { get; init; }

    /// <summary>Gets the number of tokens used.</summary>
    public int TokensUsed { get; init; }

    /// <summary>Gets the estimated cost in USD.</summary>
    public decimal EstimatedCostUsd { get; init; }

    /// <summary>Gets the generation duration in milliseconds.</summary>
    public long DurationMs { get; init; }

    /// <summary>Gets the error message if generation failed.</summary>
    public string? ErrorMessage { get; init; }

    /// <summary>Gets a value indicating whether the failure was due to usage limits.</summary>
    public bool LimitExceeded { get; init; }

    /// <summary>
    /// Creates a successful result.
    /// </summary>
    /// <param name="form">The generated form data.</param>
    /// <param name="auditId">The AI generation audit ID.</param>
    /// <param name="tokensUsed">Number of tokens used.</param>
    /// <param name="estimatedCost">Estimated cost in USD.</param>
    /// <param name="durationMs">Duration in milliseconds.</param>
    /// <returns>A successful form generation result.</returns>
    public static FormGenerationResult Succeeded(
        GeneratedFormData form,
        Guid auditId,
        int tokensUsed,
        decimal estimatedCost,
        long durationMs)
    {
        return new FormGenerationResult
        {
            Success = true,
            Form = form,
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
    /// <param name="limitExceeded">Whether the failure was due to usage limits.</param>
    /// <returns>A failed form generation result.</returns>
    public static FormGenerationResult Failed(string errorMessage, bool limitExceeded = false)
    {
        return new FormGenerationResult
        {
            Success = false,
            ErrorMessage = errorMessage,
            LimitExceeded = limitExceeded,
        };
    }
}

/// <summary>
/// AI-generated form data.
/// </summary>
public sealed record GeneratedFormData
{
    /// <summary>Gets the suggested form name.</summary>
    public required string Name { get; init; }

    /// <summary>Gets the form description.</summary>
    public string? Description { get; init; }

    /// <summary>Gets the generated fields.</summary>
    public required IReadOnlyList<GeneratedFormField> Fields { get; init; }

    /// <summary>Gets the submit button text.</summary>
    public string SubmitButtonText { get; init; } = "Submit";

    /// <summary>Gets the success message after submission.</summary>
    public string? SuccessMessage { get; init; }
}

/// <summary>
/// A generated form field.
/// </summary>
public sealed record GeneratedFormField
{
    /// <summary>Gets the field ID.</summary>
    public required string Id { get; init; }

    /// <summary>Gets the field label.</summary>
    public required string Label { get; init; }

    /// <summary>Gets the field type (text, email, phone, select, radio, checkbox, textarea).</summary>
    public required string Type { get; init; }

    /// <summary>Gets a value indicating whether the field is required.</summary>
    public bool Required { get; init; }

    /// <summary>Gets the placeholder text.</summary>
    public string? Placeholder { get; init; }

    /// <summary>Gets the BANT category if applicable (Budget, Authority, Need, Timeline).</summary>
    public string? BantCategory { get; init; }

    /// <summary>Gets the options for select/radio/checkbox fields.</summary>
    public IReadOnlyList<string>? Options { get; init; }

    /// <summary>Gets optional validation rules.</summary>
    public FieldValidation? Validation { get; init; }

    /// <summary>Gets the display order.</summary>
    public int Order { get; init; }
}

/// <summary>
/// Validation rules for a form field.
/// </summary>
public sealed record FieldValidation
{
    /// <summary>Gets the regex pattern for validation.</summary>
    public string? Pattern { get; init; }

    /// <summary>Gets the error message for failed validation.</summary>
    public string? Message { get; init; }

    /// <summary>Gets the minimum length.</summary>
    public int? MinLength { get; init; }

    /// <summary>Gets the maximum length.</summary>
    public int? MaxLength { get; init; }
}

