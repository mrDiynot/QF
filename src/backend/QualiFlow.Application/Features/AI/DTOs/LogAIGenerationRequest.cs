// -----------------------------------------------------------------------
// <copyright file="LogAIGenerationRequest.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Request to log an AI generation event.
/// </summary>
public sealed record LogAIGenerationRequest
{
    /// <summary>Gets the business ID (tenant ID).</summary>
    public required Guid BusinessId { get; init; }

    /// <summary>Gets the optional user ID who triggered the generation.</summary>
    public Guid? UserId { get; init; }

    /// <summary>Gets the type of AI task performed.</summary>
    public required AITaskType TaskType { get; init; }

    /// <summary>Gets the input prompt sent to the AI.</summary>
    public required string InputPrompt { get; init; }

    /// <summary>Gets the output as JSON string.</summary>
    public required string OutputJson { get; init; }

    /// <summary>Gets the number of input tokens.</summary>
    public required int InputTokens { get; init; }

    /// <summary>Gets the number of output tokens.</summary>
    public required int OutputTokens { get; init; }

    /// <summary>Gets the model used for generation.</summary>
    public required string ModelUsed { get; init; }

    /// <summary>Gets the duration in milliseconds.</summary>
    public required int DurationMs { get; init; }

    /// <summary>Gets the estimated cost in USD.</summary>
    public required decimal EstimatedCostUsd { get; init; }

    /// <summary>Gets a value indicating whether the generation was successful.</summary>
    public bool IsSuccess { get; init; } = true;

    /// <summary>Gets the error message if failed.</summary>
    public string? ErrorMessage { get; init; }

    /// <summary>Gets optional metadata as JSON.</summary>
    public string? Metadata { get; init; }
}

/// <summary>
/// Response after logging an AI generation event.
/// </summary>
public sealed record LogAIGenerationResponse
{
    /// <summary>Gets the ID of the created audit record.</summary>
    public required Guid AuditId { get; init; }

    /// <summary>Gets the timestamp of creation.</summary>
    public required DateTime CreatedAt { get; init; }
}

/// <summary>
/// Request to update feedback on an AI generation.
/// </summary>
public sealed record UpdateAIFeedbackRequest
{
    /// <summary>Gets the audit record ID to update.</summary>
    public required Guid AuditId { get; init; }

    /// <summary>Gets the feedback type.</summary>
    public required string FeedbackType { get; init; }

    /// <summary>Gets optional feedback comment.</summary>
    public string? Comment { get; init; }
}

/// <summary>
/// Request to get AI usage analytics.
/// </summary>
public sealed record GetAIUsageAnalyticsRequest
{
    /// <summary>Gets the business ID.</summary>
    public required Guid BusinessId { get; init; }

    /// <summary>Gets the start date for the analytics period.</summary>
    public required DateTime StartDate { get; init; }

    /// <summary>Gets the end date for the analytics period.</summary>
    public required DateTime EndDate { get; init; }
}

/// <summary>
/// Response containing AI usage analytics.
/// </summary>
public sealed record AIUsageAnalyticsResponse
{
    /// <summary>Gets the business ID.</summary>
    public required Guid BusinessId { get; init; }

    /// <summary>Gets the start date of the period.</summary>
    public required DateTime StartDate { get; init; }

    /// <summary>Gets the end date of the period.</summary>
    public required DateTime EndDate { get; init; }

    /// <summary>Gets total generation count.</summary>
    public required int TotalGenerations { get; init; }

    /// <summary>Gets successful generation count.</summary>
    public required int SuccessfulGenerations { get; init; }

    /// <summary>Gets failed generation count.</summary>
    public required int FailedGenerations { get; init; }

    /// <summary>Gets the success rate (0-1).</summary>
    public required float SuccessRate { get; init; }

    /// <summary>Gets total input tokens used.</summary>
    public required int TotalInputTokens { get; init; }

    /// <summary>Gets total output tokens generated.</summary>
    public required int TotalOutputTokens { get; init; }

    /// <summary>Gets total tokens (input + output).</summary>
    public int TotalTokens => TotalInputTokens + TotalOutputTokens;

    /// <summary>Gets the total estimated cost in USD.</summary>
    public required decimal TotalCostUsd { get; init; }

    /// <summary>Gets the average latency in milliseconds.</summary>
    public required double AverageLatencyMs { get; init; }

    /// <summary>Gets usage breakdown by task type.</summary>
    public required IReadOnlyList<TaskTypeUsageDto> UsageByTaskType { get; init; }

    /// <summary>Gets feedback analytics.</summary>
    public required FeedbackAnalyticsDto FeedbackAnalytics { get; init; }
}

/// <summary>
/// Usage statistics for a specific task type.
/// </summary>
public sealed record TaskTypeUsageDto(string TaskType, int Count, int TotalTokens, decimal CostUsd);

/// <summary>
/// Feedback analytics summary.
/// </summary>
public sealed record FeedbackAnalyticsDto(
    int TotalWithFeedback,
    int AcceptedCount,
    int ModifiedCount,
    int RejectedCount,
    int ThumbsUpCount,
    int ThumbsDownCount,
    float AcceptanceRate);

