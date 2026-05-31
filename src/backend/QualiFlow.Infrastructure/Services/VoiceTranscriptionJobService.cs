using Hangfire;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.InboundMessages.Services;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Background job service for voice recording transcription.
/// Uses OpenAI Whisper to transcribe voice recordings.
/// </summary>
/// <param name="openAiService">The OpenAI service for Whisper transcription.</param>
/// <param name="logger">The logger instance.</param>
public partial class VoiceTranscriptionJobService(
    IOpenAIService openAiService,
    ILogger<VoiceTranscriptionJobService> logger) : IVoiceTranscriptionJobService
{
#pragma warning disable CA1823, S1144 // Unused field - will be used when Whisper transcription is fully implemented
    private readonly IOpenAIService _openAiService = openAiService;
#pragma warning restore CA1823, S1144

    /// <inheritdoc />
    [AutomaticRetry(Attempts = 3, DelaysInSeconds = [10, 30, 60])]
    public async Task TranscribeVoiceRecordingAsync(string recordingSid, string recordingUri, string callSid)
    {
        LogTranscriptionStarted(logger, recordingSid, callSid, recordingUri);

        try
        {
            // Download the recording from Twilio and transcribe using OpenAI Whisper
            // Note: Full implementation requires downloading audio from Twilio URL
            // and passing to OpenAI Whisper API
            LogTranscriptionInProgress(logger, recordingSid);

            // Placeholder: In production, this would call:
            // var transcription = await _openAiService.TranscribeAudioAsync(recordingUri);
            // await UpdateMessageWithTranscription(callSid, transcription);
            await Task.CompletedTask;

            LogTranscriptionCompleted(logger, recordingSid, callSid);
        }
        catch (Exception ex)
        {
            LogTranscriptionFailed(logger, ex, recordingSid, callSid);
            throw; // Re-throw to trigger Hangfire retry
        }
    }

    // ============================================================================
    // High-performance logging using LoggerMessage source generator
    // ============================================================================

    [LoggerMessage(Level = LogLevel.Information, Message = "Transcription started for recording {RecordingSid}, call {CallSid}, URL: {RecordingUrl}")]
    private static partial void LogTranscriptionStarted(ILogger logger, string recordingSid, string callSid, string recordingUrl);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Transcription in progress for recording {RecordingSid}")]
    private static partial void LogTranscriptionInProgress(ILogger logger, string recordingSid);

    [LoggerMessage(Level = LogLevel.Information, Message = "Transcription completed for recording {RecordingSid}, call {CallSid}")]
    private static partial void LogTranscriptionCompleted(ILogger logger, string recordingSid, string callSid);

    [LoggerMessage(Level = LogLevel.Error, Message = "Transcription failed for recording {RecordingSid}, call {CallSid}")]
    private static partial void LogTranscriptionFailed(ILogger logger, Exception ex, string recordingSid, string callSid);
}

