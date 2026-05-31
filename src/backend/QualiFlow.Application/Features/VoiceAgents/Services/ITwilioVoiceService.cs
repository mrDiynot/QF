// Copyright (c) QualiFlow. All Rights Reserved.

namespace QualiFlow.Application.Features.VoiceAgents.Services;

/// <summary>
/// Service interface for Twilio Voice operations with AI integration.
/// </summary>
public interface ITwilioVoiceService
{
    /// <summary>
    /// Initiates an outbound call using a voice agent.
    /// </summary>
    /// <param name="agentId">The voice agent ID.</param>
    /// <param name="toPhoneNumber">The destination phone number.</param>
    /// <param name="fromPhoneNumber">The caller ID phone number.</param>
    /// <param name="contactName">The contact's name for personalization.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The call SID and status.</returns>
    Task<TwilioCallResult> InitiateOutboundCallAsync(
        Guid agentId,
        string toPhoneNumber,
        string fromPhoneNumber,
        string? contactName = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates TwiML for connecting a call to the AI voice agent via Media Streams.
    /// </summary>
    /// <param name="agentId">The voice agent ID.</param>
    /// <param name="callSid">The Twilio call SID.</param>
    /// <returns>TwiML XML string for connecting to Media Streams.</returns>
    string GenerateMediaStreamTwiml(Guid agentId, string callSid);

    /// <summary>
    /// Ends an active call.
    /// </summary>
    /// <param name="callSid">The Twilio call SID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task EndCallAsync(string callSid, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the status of a call.
    /// </summary>
    /// <param name="callSid">The Twilio call SID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Call status information.</returns>
    Task<TwilioCallStatus> GetCallStatusAsync(
        string callSid,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of initiating a Twilio call.
/// </summary>
public record TwilioCallResult(
    string CallSid,
    string Status,
    string? ErrorMessage = null);

/// <summary>
/// Status information for a Twilio call.
/// </summary>
public record TwilioCallStatus(
    string CallSid,
    string Status,
    int? DurationSeconds,
    DateTime? StartTime,
    DateTime? EndTime);
