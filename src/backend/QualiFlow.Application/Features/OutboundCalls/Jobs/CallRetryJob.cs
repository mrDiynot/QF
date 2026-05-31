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
/// Background job that retries failed outbound calls.
/// </summary>
public partial class CallRetryJob
{
    private readonly IOutboundCallRepository _callRepository;
    private readonly ITwilioService _twilioService;
    private readonly ILogger<CallRetryJob> _logger;
    private readonly OutboundCallOptions _options;

    /// <summary>
    /// Initializes a new instance of the <see cref="CallRetryJob"/> class.
    /// </summary>
    public CallRetryJob(
        IOutboundCallRepository callRepository,
        ITwilioService twilioService,
        Microsoft.Extensions.Options.IOptions<OutboundCallOptions> options,
        ILogger<CallRetryJob> logger)
    {
        _callRepository = callRepository;
        _twilioService = twilioService;
        _options = options.Value;
        _logger = logger;
    }

    /// <summary>
    /// Retries failed calls that are eligible for retry.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task RetryFailedCallsAsync()
    {
        LogProcessingRetries(_logger);

        var failedCalls = await _callRepository.GetCallsNeedingRetryAsync(100);
        LogRetriableCallsFound(_logger, failedCalls.Count);

        foreach (var call in failedCalls)
        {
            try
            {
                LogRetryingCall(_logger, call.Id, call.RetryAttempt + 1, call.MaxRetries);

                call.RetryAttempt++;
                call.Status = OutboundCallStatus.Initiating;
                call.ErrorMessage = null;
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

                LogCallRetryInitiated(_logger, call.Id, result.CallSid);
            }
            catch (Exception ex)
            {
                LogCallRetryFailed(_logger, call.Id, ex.Message);
                call.Status = OutboundCallStatus.Failed;
                call.ErrorMessage = ex.Message;
                await _callRepository.UpdateAsync(call);
            }
        }
    }

    [LoggerMessage(EventId = 22200, Level = LogLevel.Information, Message = "Processing call retries")]
    private static partial void LogProcessingRetries(ILogger logger);

    [LoggerMessage(EventId = 22201, Level = LogLevel.Information, Message = "Found {Count} calls eligible for retry")]
    private static partial void LogRetriableCallsFound(ILogger logger, int count);

    [LoggerMessage(EventId = 22202, Level = LogLevel.Information, Message = "Retrying call {CallId} (attempt {Attempt}/{MaxRetries})")]
    private static partial void LogRetryingCall(ILogger logger, Guid callId, int attempt, int maxRetries);

    [LoggerMessage(EventId = 22203, Level = LogLevel.Information, Message = "Call retry {CallId} initiated with Twilio SID {CallSid}")]
    private static partial void LogCallRetryInitiated(ILogger logger, Guid callId, string callSid);

    [LoggerMessage(EventId = 22204, Level = LogLevel.Error, Message = "Call retry {CallId} failed: {ErrorMessage}")]
    private static partial void LogCallRetryFailed(ILogger logger, Guid callId, string errorMessage);
}

