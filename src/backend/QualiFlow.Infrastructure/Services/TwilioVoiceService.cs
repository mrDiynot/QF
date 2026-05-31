// Copyright (c) QualiFlow. All Rights Reserved.

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.VoiceAgents.Services;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Twilio Voice service for AI-powered voice calls.
/// Integrates with OpenAI Realtime API via Media Streams.
/// </summary>
#pragma warning disable S1450 // Private fields only used in constructor
public sealed class TwilioVoiceService : ITwilioVoiceService
{
    private readonly QualiFlowDbContext _dbContext;
    private readonly ILogger<TwilioVoiceService> _logger;
    private readonly string _accountSid;
    private readonly string _authToken;
    private readonly string _webhookBaseUrl;
    private readonly bool _useTestMode;
#pragma warning restore S1450

    public TwilioVoiceService(
        IConfiguration configuration,
        QualiFlowDbContext dbContext,
        ILogger<TwilioVoiceService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;

        _accountSid = configuration["Twilio:AccountSid"] ?? string.Empty;
        _authToken = configuration["Twilio:AuthToken"] ?? string.Empty;
        _webhookBaseUrl = configuration["Twilio:WebhookBaseUrl"] ?? "https://your-domain.com/webhooks/twilio";
        _useTestMode = configuration.GetValue<bool>("Twilio:UseTestMode");

        if (!_useTestMode && !string.IsNullOrEmpty(_accountSid))
        {
            TwilioClient.Init(_accountSid, _authToken);
            _logger.LogInformation("TwilioVoiceService initialized with account {AccountSid}", _accountSid[..8] + "...");
        }
        else
        {
            _logger.LogWarning("TwilioVoiceService running in TEST MODE - no real calls will be made");
        }
    }

    /// <inheritdoc />
    public async Task<TwilioCallResult> InitiateOutboundCallAsync(
        Guid agentId,
        string toPhoneNumber,
        string fromPhoneNumber,
        string? contactName = null,
        CancellationToken cancellationToken = default)
    {
        // Get voice agent configuration
        var agent = await _dbContext.Set<VoiceAgent>()
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == agentId && a.DeletedAt == null, cancellationToken);

        if (agent == null)
        {
            return new TwilioCallResult(string.Empty, "failed", "Voice agent not found");
        }

        if (!agent.IsActive)
        {
            return new TwilioCallResult(string.Empty, "failed", "Voice agent is not active");
        }

        _logger.LogInformation(
            "Initiating outbound call to {To} from {From} using agent {AgentId}",
            toPhoneNumber, fromPhoneNumber, agentId);

        if (_useTestMode)
        {
            // Return simulated call in test mode
            var testSid = $"CA_TEST_{Guid.NewGuid():N}";
            _logger.LogInformation("TEST MODE: Simulated call {CallSid}", testSid);
            return new TwilioCallResult(testSid, "queued");
        }

        try
        {
            // Create outbound call with TwiML that connects to Media Streams
            var twimlUrl = $"{_webhookBaseUrl}/voice/connect?agentId={agentId}";

            var call = await CallResource.CreateAsync(
                to: new PhoneNumber(toPhoneNumber),
                from: new PhoneNumber(fromPhoneNumber),
                url: new Uri(twimlUrl),
                statusCallback: new Uri($"{_webhookBaseUrl}/voice/status"),
                statusCallbackEvent: new List<string> { "initiated", "ringing", "answered", "completed" },
                statusCallbackMethod: Twilio.Http.HttpMethod.Post,
                record: true,
                recordingStatusCallback: $"{_webhookBaseUrl}/voice/recording");

            _logger.LogInformation("Created outbound call {CallSid} with status {Status}", call.Sid, call.Status);

            return new TwilioCallResult(call.Sid, call.Status?.ToString() ?? "queued");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create outbound call to {To}", toPhoneNumber);
            return new TwilioCallResult(string.Empty, "failed", ex.Message);
        }
    }

    /// <inheritdoc />
    public string GenerateMediaStreamTwiml(Guid agentId, string callSid)
    {
        // Generate TwiML that:
        // 1. Plays a brief greeting
        // 2. Connects to Media Streams WebSocket for bidirectional audio
        // 3. Bridges audio to OpenAI Realtime API

        var streamUrl = _webhookBaseUrl.Replace("https://", "wss://", StringComparison.Ordinal).Replace("http://", "ws://", StringComparison.Ordinal);

        var twiml = $@"<?xml version=""1.0"" encoding=""UTF-8""?>
<Response>
    <Say voice=""Polly.Joanna"">Please hold while I connect you to our AI assistant.</Say>
    <Connect>
        <Stream url=""{streamUrl}/media-stream?agentId={agentId}&amp;callSid={callSid}"">
            <Parameter name=""agentId"" value=""{agentId}"" />
            <Parameter name=""callSid"" value=""{callSid}"" />
        </Stream>
    </Connect>
    <Say voice=""Polly.Joanna"">The call has ended. Thank you for calling.</Say>
</Response>";

        return twiml;
    }

    /// <inheritdoc />
    public async Task EndCallAsync(string callSid, CancellationToken cancellationToken = default)
    {
        if (_useTestMode)
        {
            _logger.LogInformation("TEST MODE: Simulated end call {CallSid}", callSid);
            return;
        }

        try
        {
            await CallResource.UpdateAsync(
                pathSid: callSid,
                status: CallResource.UpdateStatusEnum.Completed);

            _logger.LogInformation("Ended call {CallSid}", callSid);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to end call {CallSid}", callSid);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<TwilioCallStatus> GetCallStatusAsync(
        string callSid,
        CancellationToken cancellationToken = default)
    {
        if (_useTestMode)
        {
            return new TwilioCallStatus(
                callSid,
                "in-progress",
                60,
                DateTime.UtcNow.AddMinutes(-1),
                null);
        }

        try
        {
            var call = await CallResource.FetchAsync(pathSid: callSid);

            return new TwilioCallStatus(
                call.Sid,
                call.Status?.ToString() ?? "unknown",
                call.Duration != null ? int.Parse(call.Duration, System.Globalization.CultureInfo.InvariantCulture) : null,
                call.StartTime,
                call.EndTime);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get call status for {CallSid}", callSid);
            throw;
        }
    }
}
