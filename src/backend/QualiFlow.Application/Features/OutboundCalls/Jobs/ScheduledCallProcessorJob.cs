// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Channels.DTOs;
using QualiFlow.Application.Features.Channels.Services;
using QualiFlow.Application.Features.OutboundCalls.Services;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.OutboundCalls.Jobs;

/// <summary>
/// Background job that processes scheduled outbound calls.
/// </summary>
public partial class ScheduledCallProcessorJob
{
    private readonly IOutboundCallRepository _callRepository;
    private readonly ITwilioService _twilioService;
    private readonly ILogger<ScheduledCallProcessorJob> _logger;
    private readonly OutboundCallOptions _options;

    /// <summary>
    /// Initializes a new instance of the <see cref="ScheduledCallProcessorJob"/> class.
    /// </summary>
    public ScheduledCallProcessorJob(
        IOutboundCallRepository callRepository,
        ITwilioService twilioService,
        Microsoft.Extensions.Options.IOptions<OutboundCallOptions> options,
        ILogger<ScheduledCallProcessorJob> logger)
    {
        _callRepository = callRepository;
        _twilioService = twilioService;
        _options = options.Value;
        _logger = logger;
    }

    /// <summary>
    /// Processes all scheduled calls that are due.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task ProcessScheduledCallsAsync()
    {
        LogProcessingScheduledCalls(_logger);

        var scheduledCalls = await _callRepository.GetScheduledCallsDueAsync(DateTime.UtcNow, 100);
        LogScheduledCallsFound(_logger, scheduledCalls.Count);

        foreach (var call in scheduledCalls)
        {
            try
            {
                LogInitiatingScheduledCall(_logger, call.Id);

                call.Status = OutboundCallStatus.Initiating;
                await _callRepository.UpdateAsync(call);

                var request = new TwilioOutboundCallRequest
                {
                    ToPhoneNumber = call.ToPhoneNumber,
                    FromPhoneNumber = call.FromPhoneNumber,
                    TwimlUrl = $"{_options.TwimlBaseUrl}/api/v1/outbound-calls/{call.Id}/twiml",
                    StatusCallbackUrl = $"{_options.WebhookBaseUrl}/api/v1/webhooks/twilio/outbound-status",
                    Record = true,
                    TimeoutSeconds = _options.RingTimeoutSeconds,
                    MachineDetection = "Enable",
                };

                var result = await _twilioService.InitiateOutboundCallAsync(request);
                call.TwilioCallSid = result.CallSid;
                call.Status = OutboundCallStatus.Ringing;
                call.InitiatedAt = DateTime.UtcNow;
                await _callRepository.UpdateAsync(call);

                LogScheduledCallInitiated(_logger, call.Id, result.CallSid);
            }
            catch (Exception ex)
            {
                LogScheduledCallFailed(_logger, call.Id, ex.Message);
                call.Status = OutboundCallStatus.Failed;
                call.ErrorMessage = ex.Message;
                await _callRepository.UpdateAsync(call);
            }
        }
    }

    [LoggerMessage(EventId = 22100, Level = LogLevel.Information, Message = "Processing scheduled outbound calls")]
    private static partial void LogProcessingScheduledCalls(ILogger logger);

    [LoggerMessage(EventId = 22101, Level = LogLevel.Information, Message = "Found {Count} scheduled calls due for processing")]
    private static partial void LogScheduledCallsFound(ILogger logger, int count);

    [LoggerMessage(EventId = 22102, Level = LogLevel.Information, Message = "Initiating scheduled call {CallId}")]
    private static partial void LogInitiatingScheduledCall(ILogger logger, Guid callId);

    [LoggerMessage(EventId = 22103, Level = LogLevel.Information, Message = "Scheduled call {CallId} initiated with Twilio SID {CallSid}")]
    private static partial void LogScheduledCallInitiated(ILogger logger, Guid callId, string callSid);

    [LoggerMessage(EventId = 22104, Level = LogLevel.Error, Message = "Failed to initiate scheduled call {CallId}: {ErrorMessage}")]
    private static partial void LogScheduledCallFailed(ILogger logger, Guid callId, string errorMessage);
}

