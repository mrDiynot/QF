// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using QualiFlow.Application.Common.Models;
using QualiFlow.Application.Features.OutboundCalls.DTOs;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for outbound call operations.
/// </summary>
public interface IOutboundCallRepository
{
    /// <summary>
    /// Gets an outbound call by ID.
    /// </summary>
    /// <param name="id">The call ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The outbound call or null if not found.</returns>
    Task<OutboundCall?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets an outbound call by Twilio Call SID.
    /// </summary>
    /// <param name="callSid">The Twilio Call SID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The outbound call or null if not found.</returns>
    Task<OutboundCall?> GetByTwilioCallSidAsync(string callSid, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a paged list of outbound calls for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="query">The query parameters.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A paged result of outbound calls.</returns>
    Task<PagedResult<OutboundCall>> GetPagedAsync(
        Guid businessId,
        OutboundCallListQuery query,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets scheduled calls that are due for execution.
    /// </summary>
    /// <param name="beforeTime">Get calls scheduled before this time.</param>
    /// <param name="limit">Maximum number of calls to return.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of scheduled calls.</returns>
    Task<IReadOnlyList<OutboundCall>> GetScheduledCallsDueAsync(
        DateTime beforeTime,
        int limit = 100,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets calls that need retry.
    /// </summary>
    /// <param name="limit">Maximum number of calls to return.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of calls needing retry.</returns>
    Task<IReadOnlyList<OutboundCall>> GetCallsNeedingRetryAsync(
        int limit = 100,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets call statistics for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="fromDate">Start date.</param>
    /// <param name="toDate">End date.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Call statistics.</returns>
    Task<OutboundCallStatistics> GetStatisticsAsync(
        Guid businessId,
        DateTime fromDate,
        DateTime toDate,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new outbound call.
    /// </summary>
    /// <param name="call">The call to add.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task AddAsync(OutboundCall call, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an outbound call.
    /// </summary>
    /// <param name="call">The call to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(OutboundCall call, CancellationToken cancellationToken = default);
}

/// <summary>
/// Statistics for outbound calls.
/// </summary>
public record OutboundCallStatistics
{
    /// <summary>
    /// Gets the total number of calls.
    /// </summary>
    public int TotalCalls { get; init; }

    /// <summary>
    /// Gets the number of completed calls.
    /// </summary>
    public int CompletedCalls { get; init; }

    /// <summary>
    /// Gets the number of connected calls.
    /// </summary>
    public int ConnectedCalls { get; init; }

    /// <summary>
    /// Gets the number of voicemail calls.
    /// </summary>
    public int VoicemailCalls { get; init; }

    /// <summary>
    /// Gets the number of failed calls.
    /// </summary>
    public int FailedCalls { get; init; }

    /// <summary>
    /// Gets the average call duration in seconds.
    /// </summary>
    public double AverageDurationSeconds { get; init; }

    /// <summary>
    /// Gets the connection rate (connected / total).
    /// </summary>
    public double ConnectionRate { get; init; }
}

