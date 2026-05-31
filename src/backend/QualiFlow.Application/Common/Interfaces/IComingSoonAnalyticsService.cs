// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using QualiFlow.Application.Features.ComingSoonAnalytics.Dtos;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Service interface for Coming Soon page analytics.
/// </summary>
public interface IComingSoonAnalyticsService
{
    /// <summary>
    /// Gets the overview metrics for the Coming Soon analytics dashboard.
    /// </summary>
    /// <returns>Overview metrics DTO.</returns>
    Task<ComingSoonOverviewDto> GetOverviewAsync(
        Guid businessId,
        DateTimeOffset? startDate = null,
        DateTimeOffset? endDate = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a paginated list of chat sessions.
    /// </summary>
    /// <returns>Tuple of sessions list and total count.</returns>
    Task<(IReadOnlyList<ChatSessionSummaryDto> sessions, int totalCount)> GetChatSessionsAsync(
        Guid businessId,
        int page = 1,
        int pageSize = 20,
        string? status = null,
        string? searchTerm = null,
        DateTimeOffset? startDate = null,
        DateTimeOffset? endDate = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets detailed information about a specific chat session including messages.
    /// </summary>
    /// <returns>Chat session detail or null if not found.</returns>
    Task<ChatSessionDetailDto?> GetChatSessionDetailAsync(
        Guid businessId,
        Guid sessionId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets AI usage analytics.
    /// </summary>
    /// <returns>AI usage summary DTO.</returns>
    Task<AIUsageSummaryDto> GetAIUsageSummaryAsync(
        Guid businessId,
        DateTimeOffset? startDate = null,
        DateTimeOffset? endDate = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets waitlist analytics summary.
    /// </summary>
    /// <returns>Waitlist summary DTO.</returns>
    Task<WaitlistSummaryDto> GetWaitlistSummaryAsync(
        Guid businessId,
        DateTimeOffset? startDate = null,
        DateTimeOffset? endDate = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a paginated list of waitlist entries.
    /// </summary>
    /// <returns>Tuple of entries list and total count.</returns>
    Task<(IReadOnlyList<WaitlistEntryDto> entries, int totalCount)> GetWaitlistEntriesAsync(
        Guid businessId,
        int page = 1,
        int pageSize = 20,
        string? source = null,
        string? searchTerm = null,
        DateTimeOffset? startDate = null,
        DateTimeOffset? endDate = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets intent distribution from chat messages.
    /// </summary>
    /// <returns>List of intent distribution DTOs.</returns>
    Task<IReadOnlyList<IntentDistributionDto>> GetIntentDistributionAsync(
        Guid businessId,
        DateTimeOffset? startDate = null,
        DateTimeOffset? endDate = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets conversion funnel metrics.
    /// </summary>
    /// <returns>Conversion funnel DTO.</returns>
    Task<ConversionFunnelDto> GetConversionFunnelAsync(
        Guid businessId,
        DateTimeOffset? startDate = null,
        DateTimeOffset? endDate = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Exports waitlist entries to CSV format.
    /// </summary>
    /// <returns>CSV file contents as byte array.</returns>
    Task<byte[]> ExportWaitlistToCsvAsync(
        Guid businessId,
        DateTimeOffset? startDate = null,
        DateTimeOffset? endDate = null,
        CancellationToken cancellationToken = default);
}
