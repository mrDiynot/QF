// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Common.Models;
using QualiFlow.Application.Features.OutboundCalls.DTOs;

namespace QualiFlow.Application.Features.OutboundCalls.Services;

/// <summary>
/// Service interface for outbound call operations.
/// </summary>
public interface IOutboundCallService
{
    /// <summary>
    /// Initiates an outbound call to a lead.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="request">The call request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The initiated call details.</returns>
    Task<OutboundCallDto> InitiateCallAsync(
        Guid businessId,
        InitiateOutboundCallRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Schedules a follow-up call.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="request">The schedule request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The scheduled call details.</returns>
    Task<OutboundCallDto> ScheduleFollowUpCallAsync(
        Guid businessId,
        ScheduleFollowUpCallRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets an outbound call by ID.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="callId">The call ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The call details or null if not found.</returns>
    Task<OutboundCallDto?> GetCallAsync(
        Guid businessId,
        Guid callId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a paged list of outbound calls.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="query">The query parameters.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A paged result of calls.</returns>
    Task<PagedResult<OutboundCallDto>> GetCallsAsync(
        Guid businessId,
        OutboundCallListQuery query,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Hangs up an active call.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="callId">The call ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if successful.</returns>
    Task<bool> HangupCallAsync(
        Guid businessId,
        Guid callId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Cancels a scheduled call.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="callId">The call ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if successful.</returns>
    Task<bool> CancelScheduledCallAsync(
        Guid businessId,
        Guid callId,
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
    /// Processes a call status callback from Twilio.
    /// </summary>
    /// <param name="callSid">The Twilio Call SID.</param>
    /// <param name="status">The call status.</param>
    /// <param name="durationSeconds">The call duration in seconds.</param>
    /// <param name="answeredBy">Who answered the call (human, machine).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task ProcessCallStatusCallbackAsync(
        string callSid,
        string status,
        int? durationSeconds,
        string? answeredBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Processes a recording callback from Twilio.
    /// </summary>
    /// <param name="callSid">The Twilio Call SID.</param>
    /// <param name="recordingUrl">The recording URL.</param>
    /// <param name="recordingDuration">The recording duration in seconds.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
#pragma warning disable CA1054 // URI-like parameters should not be strings
    Task ProcessRecordingCallbackAsync(
        string callSid,
        string recordingUrl,
        int recordingDuration,
        CancellationToken cancellationToken = default);
#pragma warning restore CA1054
}

