// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Common.Models;
using QualiFlow.Application.Features.Channels.DTOs;
using QualiFlow.Application.Features.Channels.Services;
using QualiFlow.Application.Features.OutboundCalls.DTOs;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.OutboundCalls.Services;

/// <summary>
/// Service for outbound call operations.
/// </summary>
public partial class OutboundCallService : IOutboundCallService
{
    private readonly IOutboundCallRepository _callRepository;
    private readonly ICallScriptRepository _scriptRepository;
    private readonly ILeadRepository _leadRepository;
    private readonly IChannelRepository _channelRepository;
    private readonly ITwilioService _twilioService;
    private readonly ILogger<OutboundCallService> _logger;
    private readonly OutboundCallOptions _options;

    /// <summary>
    /// Initializes a new instance of the <see cref="OutboundCallService"/> class.
    /// </summary>
    public OutboundCallService(
        IOutboundCallRepository callRepository,
        ICallScriptRepository scriptRepository,
        ILeadRepository leadRepository,
        IChannelRepository channelRepository,
        ITwilioService twilioService,
        IOptions<OutboundCallOptions> options,
        ILogger<OutboundCallService> logger)
    {
        _callRepository = callRepository;
        _scriptRepository = scriptRepository;
        _leadRepository = leadRepository;
        _channelRepository = channelRepository;
        _twilioService = twilioService;
        _options = options.Value;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<OutboundCallDto> InitiateCallAsync(
        Guid businessId,
        InitiateOutboundCallRequest request,
        CancellationToken cancellationToken = default)
    {
        LogInitiatingCall(_logger, businessId, request.LeadId);

        // Get lead
        var lead = await _leadRepository.GetByIdAsync(request.LeadId, cancellationToken)
            ?? throw new InvalidOperationException($"Lead {request.LeadId} not found.");

        if (lead.BusinessId != businessId)
        {
            throw new InvalidOperationException("Lead does not belong to this business.");
        }

        // Get phone numbers
        var toPhone = request.ToPhoneNumber ?? lead.Phone
            ?? throw new InvalidOperationException("Lead has no phone number.");
        var fromPhone = request.FromPhoneNumber ?? await GetBusinessPhoneNumberAsync(businessId, cancellationToken);

        // Get call script
        CallScript? script = null;
        if (request.CallScriptId.HasValue)
        {
            script = await _scriptRepository.GetByIdAsync(request.CallScriptId.Value, cancellationToken);
        }

        script ??= await _scriptRepository.GetDefaultAsync(businessId, cancellationToken);

        // Create outbound call record
        var call = new OutboundCall
        {
            BusinessId = businessId,
            LeadId = request.LeadId,
            CallScriptId = script?.Id,
            FromPhoneNumber = fromPhone,
            ToPhoneNumber = toPhone,
            Status = request.ScheduledAt.HasValue ? OutboundCallStatus.Scheduled : OutboundCallStatus.Pending,
            ScheduledAt = request.ScheduledAt,
            MaxRetries = request.MaxRetries,
        };

        await _callRepository.AddAsync(call, cancellationToken);

        // If not scheduled, initiate immediately
        if (!request.ScheduledAt.HasValue)
        {
            await InitiateCallViaTwilioAsync(call, cancellationToken);
        }

        LogCallCreated(_logger, call.Id, call.Status.ToString());
        return MapToDto(call);
    }

    /// <inheritdoc />
    public async Task<OutboundCallDto> ScheduleFollowUpCallAsync(
        Guid businessId,
        ScheduleFollowUpCallRequest request,
        CancellationToken cancellationToken = default)
    {
        var initiateRequest = new InitiateOutboundCallRequest
        {
            LeadId = request.LeadId,
            CallScriptId = request.CallScriptId,
            ScheduledAt = request.ScheduledAt,
            MaxRetries = request.MaxRetries,
        };

        return await InitiateCallAsync(businessId, initiateRequest, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<OutboundCallDto?> GetCallAsync(
        Guid businessId,
        Guid callId,
        CancellationToken cancellationToken = default)
    {
        var call = await _callRepository.GetByIdAsync(callId, cancellationToken);
        if (call == null || call.BusinessId != businessId)
        {
            return null;
        }

        return MapToDto(call);
    }

    /// <inheritdoc />
    public async Task<PagedResult<OutboundCallDto>> GetCallsAsync(
        Guid businessId,
        OutboundCallListQuery query,
        CancellationToken cancellationToken = default)
    {
        var result = await _callRepository.GetPagedAsync(businessId, query, cancellationToken);

        return new PagedResult<OutboundCallDto>
        {
            Items = result.Items.Select(MapToDto).ToList(),
            TotalItems = result.TotalItems,
            Page = result.Page,
            PageSize = result.PageSize,
        };
    }

    /// <inheritdoc />
    public async Task<bool> HangupCallAsync(
        Guid businessId,
        Guid callId,
        CancellationToken cancellationToken = default)
    {
        var call = await _callRepository.GetByIdAsync(callId, cancellationToken);
        if (call == null || call.BusinessId != businessId)
        {
            return false;
        }

        if (string.IsNullOrEmpty(call.TwilioCallSid))
        {
            return false;
        }

        var success = await _twilioService.HangupCallAsync(call.TwilioCallSid, null, cancellationToken);
        if (success)
        {
            call.Status = OutboundCallStatus.Cancelled;
            call.EndedAt = DateTime.UtcNow;
            await _callRepository.UpdateAsync(call, cancellationToken);
            LogCallHungUp(_logger, callId);
        }

        return success;
    }

    /// <inheritdoc />
    public async Task<bool> CancelScheduledCallAsync(
        Guid businessId,
        Guid callId,
        CancellationToken cancellationToken = default)
    {
        var call = await _callRepository.GetByIdAsync(callId, cancellationToken);
        if (call == null || call.BusinessId != businessId)
        {
            return false;
        }

        if (call.Status != OutboundCallStatus.Scheduled)
        {
            return false;
        }

        call.Status = OutboundCallStatus.Cancelled;
        await _callRepository.UpdateAsync(call, cancellationToken);
        LogCallCancelled(_logger, callId);
        return true;
    }

    /// <inheritdoc />
    public async Task<OutboundCallStatistics> GetStatisticsAsync(
        Guid businessId,
        DateTime fromDate,
        DateTime toDate,
        CancellationToken cancellationToken = default)
    {
        return await _callRepository.GetStatisticsAsync(businessId, fromDate, toDate, cancellationToken);
    }

    /// <inheritdoc />
    public async Task ProcessCallStatusCallbackAsync(
        string callSid,
        string status,
        int? durationSeconds,
        string? answeredBy,
        CancellationToken cancellationToken = default)
    {
        LogProcessingCallback(_logger, callSid, status);

        var call = await _callRepository.GetByTwilioCallSidAsync(callSid, cancellationToken);
        if (call == null)
        {
            LogCallNotFound(_logger, callSid);
            return;
        }

        call.Status = MapTwilioStatusToCallStatus(status);
        if (durationSeconds.HasValue)
        {
            call.DurationSeconds = durationSeconds.Value;
        }

        if (!string.IsNullOrEmpty(answeredBy))
        {
            call.Outcome = answeredBy.Equals("human", StringComparison.OrdinalIgnoreCase)
                ? OutboundCallOutcome.Connected
                : OutboundCallOutcome.Voicemail;
        }

        if (call.Status is OutboundCallStatus.Completed or OutboundCallStatus.Failed or OutboundCallStatus.Cancelled)
        {
            call.EndedAt = DateTime.UtcNow;
        }

        await _callRepository.UpdateAsync(call, cancellationToken);
    }

    /// <inheritdoc />
    public async Task ProcessRecordingCallbackAsync(
        string callSid,
        string recordingUrl,
        int recordingDuration,
        CancellationToken cancellationToken = default)
    {
        var call = await _callRepository.GetByTwilioCallSidAsync(callSid, cancellationToken);
        if (call == null)
        {
            return;
        }

        call.RecordingUrl = recordingUrl;
        await _callRepository.UpdateAsync(call, cancellationToken);
        LogRecordingReceived(_logger, callSid, recordingUrl);
    }

    // Private helper methods

    private async Task<string> GetBusinessPhoneNumberAsync(Guid businessId, CancellationToken cancellationToken)
    {
        var channels = await _channelRepository.GetByBusinessIdAsync(businessId, cancellationToken);
        var voiceChannel = channels.FirstOrDefault(c => c.Type == ChannelType.Voice && c.IsActive);
        return voiceChannel?.PhoneNumber ?? _options.DefaultFromPhoneNumber;
    }

    private async Task InitiateCallViaTwilioAsync(OutboundCall call, CancellationToken cancellationToken)
    {
        call.Status = OutboundCallStatus.Initiating;
        await _callRepository.UpdateAsync(call, cancellationToken);

        var request = new TwilioOutboundCallRequest
        {
            ToPhoneNumber = call.ToPhoneNumber,
            FromPhoneNumber = call.FromPhoneNumber,
            TwimlUrl = $"{_options.TwimlBaseUrl}/api/v1/outbound-calls/{call.Id}/twiml",
            StatusCallbackUrl = $"{_options.WebhookBaseUrl}/api/v1/webhooks/twilio/outbound-status",
            Record = true,
            TimeoutSeconds = 30,
            MachineDetection = "Enable",
        };

        var result = await _twilioService.InitiateOutboundCallAsync(request, cancellationToken);
        call.TwilioCallSid = result.CallSid;
        call.Status = OutboundCallStatus.Ringing;
        call.InitiatedAt = DateTime.UtcNow;
        await _callRepository.UpdateAsync(call, cancellationToken);
    }

    private static OutboundCallStatus MapTwilioStatusToCallStatus(string twilioStatus)
    {
        return twilioStatus.ToLowerInvariant() switch
        {
            "queued" => OutboundCallStatus.Pending,
            "ringing" => OutboundCallStatus.Ringing,
            "in-progress" => OutboundCallStatus.InProgress,
            "completed" => OutboundCallStatus.Completed,
            "busy" => OutboundCallStatus.Failed,
            "failed" => OutboundCallStatus.Failed,
            "no-answer" => OutboundCallStatus.Failed,
            "canceled" => OutboundCallStatus.Cancelled,
            _ => OutboundCallStatus.Pending,
        };
    }

    private static OutboundCallDto MapToDto(OutboundCall call)
    {
        return new OutboundCallDto
        {
            Id = call.Id,
            BusinessId = call.BusinessId,
            LeadId = call.LeadId,
            LeadName = call.Lead?.Name,
            ConversationId = call.ConversationId,
            CallScriptId = call.CallScriptId,
            CallScriptName = call.CallScript?.Name,
            TwilioCallSid = call.TwilioCallSid,
            FromPhoneNumber = call.FromPhoneNumber,
            ToPhoneNumber = call.ToPhoneNumber,
            Status = call.Status,
            Outcome = call.Outcome,
            ScheduledAt = call.ScheduledAt,
            InitiatedAt = call.InitiatedAt,
            ConnectedAt = call.ConnectedAt,
            EndedAt = call.EndedAt,
            DurationSeconds = call.DurationSeconds,
            RecordingUrl = call.RecordingUrl,
            Transcription = call.Transcription,
            RetryAttempt = call.RetryAttempt,
            MaxRetries = call.MaxRetries,
            ErrorMessage = call.ErrorMessage,
            CreatedAt = call.CreatedAt,
        };
    }

    // LoggerMessage delegates

    [LoggerMessage(EventId = 22001, Level = LogLevel.Information, Message = "Initiating call for business {BusinessId} to lead {LeadId}")]
    private static partial void LogInitiatingCall(ILogger logger, Guid businessId, Guid leadId);

    [LoggerMessage(EventId = 22002, Level = LogLevel.Information, Message = "Call {CallId} created with status {Status}")]
    private static partial void LogCallCreated(ILogger logger, Guid callId, string status);

    [LoggerMessage(EventId = 22003, Level = LogLevel.Information, Message = "Call {CallId} hung up")]
    private static partial void LogCallHungUp(ILogger logger, Guid callId);

    [LoggerMessage(EventId = 22004, Level = LogLevel.Information, Message = "Scheduled call {CallId} cancelled")]
    private static partial void LogCallCancelled(ILogger logger, Guid callId);

    [LoggerMessage(EventId = 22005, Level = LogLevel.Information, Message = "Processing callback for call {CallSid} with status {Status}")]
    private static partial void LogProcessingCallback(ILogger logger, string callSid, string status);

    [LoggerMessage(EventId = 22006, Level = LogLevel.Warning, Message = "Call with Twilio SID {CallSid} not found")]
    private static partial void LogCallNotFound(ILogger logger, string callSid);

    [LoggerMessage(EventId = 22007, Level = LogLevel.Information, Message = "Recording received for call {CallSid}: {RecordingUrl}")]
    private static partial void LogRecordingReceived(ILogger logger, string callSid, string recordingUrl);
}
