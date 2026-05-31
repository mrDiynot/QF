// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

namespace QualiFlow.Application.Features.ComingSoonAnalytics.Dtos;

/// <summary>
/// Overview metrics for the Coming Soon page analytics dashboard.
/// </summary>
public record ComingSoonOverviewDto
{
    public int TotalChatSessions { get; init; }
    public int TotalMessages { get; init; }
    public int UniqueVisitors { get; init; }
    public int EmailsCaptured { get; init; }
    public int WaitlistSignups { get; init; }
    public decimal AverageSessionDuration { get; init; }
    public decimal AverageSentiment { get; init; }
    public int TotalAIResponses { get; init; }
    public decimal TotalAICostUsd { get; init; }
    public int TotalTokensUsed { get; init; }
    public DateTimeOffset PeriodStart { get; init; }
    public DateTimeOffset PeriodEnd { get; init; }
}

/// <summary>
/// Chat session summary for list views.
/// </summary>
public record ChatSessionSummaryDto
{
    public Guid Id { get; init; }
    public string? VisitorEmail { get; init; }
    public string? VisitorName { get; init; }
    public int MessageCount { get; init; }
    public string Status { get; init; } = string.Empty;
    public decimal? SentimentScore { get; init; }
    public string? DetectedIntent { get; init; }
    public int? QualificationScore { get; init; }
#pragma warning disable CA1056 // URI-like properties should not be strings
    public string? PageUrl { get; init; }
#pragma warning restore CA1056
#pragma warning disable CA1056 // URI-like properties should not be strings
    public string? ReferrerUrl { get; init; }
#pragma warning restore CA1056
    public DateTimeOffset StartedAt { get; init; }
    public DateTimeOffset? EndedAt { get; init; }
    public TimeSpan? Duration { get; init; }
}

/// <summary>
/// Detailed chat session with messages.
/// </summary>
public record ChatSessionDetailDto
{
    public Guid Id { get; init; }
    public string? VisitorEmail { get; init; }
    public string? VisitorName { get; init; }
    public string Status { get; init; } = string.Empty;
    public int? QualificationScore { get; init; }
#pragma warning disable CA1056 // URI-like properties should not be strings
    public string? PageUrl { get; init; }
#pragma warning restore CA1056
#pragma warning disable CA1056 // URI-like properties should not be strings
    public string? ReferrerUrl { get; init; }
#pragma warning restore CA1056
    public string? IpAddress { get; init; }
    public string? UserAgent { get; init; }
    public DateTimeOffset StartedAt { get; init; }
    public DateTimeOffset? EndedAt { get; init; }
    public IReadOnlyList<ChatMessageDto> Messages { get; init; } = [];
}

/// <summary>
/// Chat message details.
/// </summary>
public record ChatMessageDto
{
    public Guid Id { get; init; }
    public string Content { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string? SenderName { get; init; }
    public string? DetectedIntent { get; init; }
    public float? SentimentScore { get; init; }
    public DateTimeOffset SentAt { get; init; }
}

/// <summary>
/// AI usage summary for cost tracking.
/// </summary>
public record AIUsageSummaryDto
{
    public int TotalRequests { get; init; }
    public int SuccessfulRequests { get; init; }
    public int FailedRequests { get; init; }
    public int TotalInputTokens { get; init; }
    public int TotalOutputTokens { get; init; }
    public int TotalTokens { get; init; }
    public decimal TotalCostUsd { get; init; }
    public decimal AverageCostPerRequest { get; init; }
    public int AverageLatencyMs { get; init; }
    public IReadOnlyList<AIUsageByTaskTypeDto> ByTaskType { get; init; } = [];
    public IReadOnlyList<AIUsageByModelDto> ByModel { get; init; } = [];
    public IReadOnlyList<DailyAIUsageDto> DailyUsage { get; init; } = [];
    public DateTimeOffset PeriodStart { get; init; }
    public DateTimeOffset PeriodEnd { get; init; }
}

/// <summary>
/// AI usage grouped by task type.
/// </summary>
public record AIUsageByTaskTypeDto
{
    public string TaskType { get; init; } = string.Empty;
    public int Count { get; init; }
    public int TotalTokens { get; init; }
    public decimal TotalCostUsd { get; init; }
}

/// <summary>
/// AI usage grouped by model.
/// </summary>
public record AIUsageByModelDto
{
    public string Model { get; init; } = string.Empty;
    public int Count { get; init; }
    public int TotalTokens { get; init; }
    public decimal TotalCostUsd { get; init; }
}

/// <summary>
/// Daily AI usage for trend charts.
/// </summary>
public record DailyAIUsageDto
{
    public DateOnly Date { get; init; }
    public int Requests { get; init; }
    public int Tokens { get; init; }
    public decimal CostUsd { get; init; }
}

/// <summary>
/// Waitlist analytics summary.
/// </summary>
public record WaitlistSummaryDto
{
    public int TotalSignups { get; init; }
    public int SignupsToday { get; init; }
    public int SignupsThisWeek { get; init; }
    public int SignupsThisMonth { get; init; }
    public int FromChatWidget { get; init; }
    public int FromOtherSources { get; init; }
    public int SyncedToBrevo { get; init; }
    public int PendingSync { get; init; }
    public IReadOnlyList<WaitlistBySourceDto> BySource { get; init; } = [];
    public IReadOnlyList<DailyWaitlistDto> DailySignups { get; init; } = [];
}

/// <summary>
/// Waitlist signups grouped by source.
/// </summary>
public record WaitlistBySourceDto
{
    public string Source { get; init; } = string.Empty;
    public int Count { get; init; }
}

/// <summary>
/// Daily waitlist signups for trend charts.
/// </summary>
public record DailyWaitlistDto
{
    public DateOnly Date { get; init; }
    public int Count { get; init; }
}

/// <summary>
/// Waitlist entry for list views.
/// </summary>
public record WaitlistEntryDto
{
    public Guid Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public string? Source { get; init; }
#pragma warning disable CA1056 // URI-like properties should not be strings
    public string? PageUrl { get; init; }
#pragma warning restore CA1056
#pragma warning disable CA1056 // URI-like properties should not be strings
    public string? ReferrerUrl { get; init; }
#pragma warning restore CA1056
    public bool SyncedToBrevo { get; init; }
    public DateTimeOffset SignedUpAt { get; init; }
}

/// <summary>
/// Intent distribution for analytics.
/// </summary>
public record IntentDistributionDto
{
    public string Intent { get; init; } = string.Empty;
    public int Count { get; init; }
    public decimal Percentage { get; init; }
}

/// <summary>
/// Conversion funnel metrics.
/// </summary>
public record ConversionFunnelDto
{
    public int WidgetOpened { get; init; }
    public int ConversationStarted { get; init; }
    public int EmailCaptured { get; init; }
    public int WaitlistJoined { get; init; }
    public decimal WidgetToConversationRate { get; init; }
    public decimal ConversationToEmailRate { get; init; }
    public decimal EmailToWaitlistRate { get; init; }
    public decimal OverallConversionRate { get; init; }
}
