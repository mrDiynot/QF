// -----------------------------------------------------------------------
// <copyright file="IAIFeedbackService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.Interfaces;

/// <summary>
/// Service interface for recording and analyzing AI generation feedback.
/// Provides methods to capture user feedback on AI outputs and aggregate quality metrics.
/// </summary>
public interface IAIFeedbackService
{
    /// <summary>
    /// Records user feedback on an AI generation.
    /// </summary>
    /// <param name="request">The feedback details.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if feedback was recorded successfully; false if the audit record was not found.</returns>
    Task<bool> RecordFeedbackAsync(
        RecordFeedbackRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets quality metrics for AI generations within a date range.
    /// Includes acceptance rates, rejection rates, and satisfaction scores by task type.
    /// </summary>
    /// <param name="request">The metrics request with date range.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Quality metrics aggregated by task type.</returns>
    Task<AIQualityMetricsResponse> GetQualityMetricsAsync(
        GetQualityMetricsRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a summary of recent feedback for a business.
    /// Useful for dashboard widgets showing AI quality trends.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="daysBack">Number of days to look back (default: 30).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Feedback summary with counts and trends.</returns>
    Task<FeedbackSummaryResponse> GetFeedbackSummaryAsync(
        Guid businessId,
        int daysBack = 30,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Request to record feedback on an AI generation.
/// </summary>
public sealed record RecordFeedbackRequest
{
    /// <summary>Gets the business ID for multi-tenancy.</summary>
    public required Guid BusinessId { get; init; }

    /// <summary>Gets the AI generation audit ID to provide feedback on.</summary>
    public required Guid AuditId { get; init; }

    /// <summary>Gets the feedback type.</summary>
    public required string FeedbackType { get; init; }

    /// <summary>Gets an optional comment explaining the feedback.</summary>
    public string? Comment { get; init; }

    /// <summary>Gets the optional user ID who provided the feedback.</summary>
    public Guid? UserId { get; init; }
}

/// <summary>
/// Request to get quality metrics.
/// </summary>
public sealed record GetQualityMetricsRequest
{
    /// <summary>Gets the business ID.</summary>
    public required Guid BusinessId { get; init; }

    /// <summary>Gets the start date for the metrics period.</summary>
    public required DateTime StartDate { get; init; }

    /// <summary>Gets the end date for the metrics period.</summary>
    public required DateTime EndDate { get; init; }

    /// <summary>Gets an optional task type filter.</summary>
    public string? TaskType { get; init; }
}

/// <summary>
/// Response containing AI quality metrics.
/// </summary>
public sealed record AIQualityMetricsResponse
{
    /// <summary>Gets the business ID.</summary>
    public required Guid BusinessId { get; init; }

    /// <summary>Gets the start date of the period.</summary>
    public required DateTime StartDate { get; init; }

    /// <summary>Gets the end date of the period.</summary>
    public required DateTime EndDate { get; init; }

    /// <summary>Gets the total number of generations with feedback.</summary>
    public required int TotalWithFeedback { get; init; }

    /// <summary>Gets the overall acceptance rate (0-1).</summary>
    public required float AcceptanceRate { get; init; }

    /// <summary>Gets the overall rejection rate (0-1).</summary>
    public required float RejectionRate { get; init; }

    /// <summary>Gets the satisfaction score (0-100 based on thumbs up/down ratio).</summary>
    public required int SatisfactionScore { get; init; }

    /// <summary>Gets metrics broken down by task type.</summary>
    public required IReadOnlyList<TaskTypeQualityMetrics> MetricsByTaskType { get; init; }
}

/// <summary>
/// Quality metrics for a specific task type.
/// </summary>
public sealed record TaskTypeQualityMetrics(
    string TaskType,
    int TotalGenerations,
    int WithFeedback,
    int AcceptedCount,
    int ModifiedCount,
    int RejectedCount,
    int ThumbsUpCount,
    int ThumbsDownCount,
    float AcceptanceRate,
    float SatisfactionScore);

/// <summary>
/// Summary of feedback for a business.
/// </summary>
public sealed record FeedbackSummaryResponse
{
    /// <summary>Gets the business ID.</summary>
    public required Guid BusinessId { get; init; }

    /// <summary>Gets the period in days.</summary>
    public required int DaysBack { get; init; }

    /// <summary>Gets the total generations in the period.</summary>
    public required int TotalGenerations { get; init; }

    /// <summary>Gets how many have feedback.</summary>
    public required int WithFeedback { get; init; }

    /// <summary>Gets the feedback coverage rate (0-1).</summary>
    public float FeedbackCoverage => TotalGenerations > 0 ? (float)WithFeedback / TotalGenerations : 0;

    /// <summary>Gets acceptance counts.</summary>
    public required FeedbackCounts Counts { get; init; }

    /// <summary>Gets trend compared to previous period (positive = improving).</summary>
    public required float AcceptanceRateTrend { get; init; }
}

/// <summary>
/// Feedback counts breakdown.
/// </summary>
public sealed record FeedbackCounts(int Accepted, int Modified, int Rejected, int ThumbsUp, int ThumbsDown);

