// -----------------------------------------------------------------------
// <copyright file="IAIGenerationAuditService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Features.AI.DTOs;

namespace QualiFlow.Application.Features.AI.Interfaces;

/// <summary>
/// Service interface for AI generation audit logging and analytics.
/// Provides methods to log AI generations, capture feedback, and retrieve usage analytics.
/// </summary>
public interface IAIGenerationAuditService
{
    /// <summary>
    /// Logs an AI generation event.
    /// Call this after every AI generation to track usage, cost, and performance.
    /// </summary>
    /// <param name="request">The generation details to log.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created audit record response.</returns>
    Task<LogAIGenerationResponse> LogAIGenerationAsync(
        LogAIGenerationRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates feedback on a previously logged AI generation.
    /// Call this when a user accepts, modifies, or rejects AI-generated content.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="request">The feedback details.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if feedback was updated; false if audit not found.</returns>
    Task<bool> UpdateFeedbackAsync(
        Guid businessId,
        UpdateAIFeedbackRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets AI usage analytics for a business within a date range.
    /// Provides aggregated statistics, task type breakdown, and feedback analysis.
    /// </summary>
    /// <param name="request">The analytics request with date range.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The usage analytics response.</returns>
    Task<AIUsageAnalyticsResponse> GetAIUsageAnalyticsAsync(
        GetAIUsageAnalyticsRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets recent AI generations for a business with optional filtering.
    /// Useful for displaying generation history in the UI.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="taskType">Optional filter by task type.</param>
    /// <param name="skip">Number of records to skip.</param>
    /// <param name="take">Maximum records to return.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of recent generation records.</returns>
    Task<IReadOnlyList<AIGenerationAuditDto>> GetRecentGenerationsAsync(
        Guid businessId,
        string? taskType = null,
        int skip = 0,
        int take = 20,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// DTO for AI generation audit record.
/// </summary>
public sealed record AIGenerationAuditDto
{
    /// <summary>Gets the audit ID.</summary>
    public required Guid Id { get; init; }

    /// <summary>Gets the task type.</summary>
    public required string TaskType { get; init; }

    /// <summary>Gets the model used.</summary>
    public required string ModelUsed { get; init; }

    /// <summary>Gets the input token count.</summary>
    public required int InputTokens { get; init; }

    /// <summary>Gets the output token count.</summary>
    public required int OutputTokens { get; init; }

    /// <summary>Gets the total token count.</summary>
    public int TotalTokens => InputTokens + OutputTokens;

    /// <summary>Gets the duration in milliseconds.</summary>
    public required int DurationMs { get; init; }

    /// <summary>Gets the estimated cost.</summary>
    public required decimal EstimatedCostUsd { get; init; }

    /// <summary>Gets a value indicating whether the generation was successful.</summary>
    public required bool IsSuccess { get; init; }

    /// <summary>Gets the feedback type if provided.</summary>
    public string? Feedback { get; init; }

    /// <summary>Gets when the generation occurred.</summary>
    public required DateTime CreatedAt { get; init; }
}

