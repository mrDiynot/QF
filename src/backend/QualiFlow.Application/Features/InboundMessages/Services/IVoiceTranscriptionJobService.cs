namespace QualiFlow.Application.Features.InboundMessages.Services;

/// <summary>
/// Background job service interface for voice recording transcription.
/// Implemented in the Infrastructure layer with Hangfire retry policies.
/// </summary>
public interface IVoiceTranscriptionJobService
{
    /// <summary>
    /// Transcribes a voice recording using OpenAI Whisper.
    /// This method is called as a background job.
    /// </summary>
    /// <param name="recordingSid">The Twilio recording SID.</param>
    /// <param name="recordingUri">The URI to the recording file.</param>
    /// <param name="callSid">The Twilio call SID.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
#pragma warning disable CA1054 // URI-like properties should not be strings
    Task TranscribeVoiceRecordingAsync(string recordingSid, string recordingUri, string callSid);
#pragma warning restore CA1054
}

