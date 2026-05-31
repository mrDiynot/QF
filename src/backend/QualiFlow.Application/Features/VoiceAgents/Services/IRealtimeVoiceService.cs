// Copyright (c) QualiFlow. All Rights Reserved.

namespace QualiFlow.Application.Features.VoiceAgents.Services;

/// <summary>
/// Service interface for OpenAI Realtime Voice API integration.
/// </summary>
public interface IRealtimeVoiceService
{
    /// <summary>
    /// Gets the available OpenAI voice options.
    /// </summary>
    IReadOnlyList<VoiceOption> AvailableVoices { get; }

    /// <summary>
    /// Maps a VoiceAgent voice type to an OpenAI voice ID.
    /// </summary>
    /// <param name="voiceType">The voice type from VoiceAgent configuration.</param>
    /// <returns>The OpenAI voice ID.</returns>
    string MapVoiceType(string voiceType);

    /// <summary>
    /// Generates a voice preview audio clip.
    /// </summary>
    /// <param name="text">The text to speak.</param>
    /// <param name="voiceType">The voice type.</param>
    /// <param name="speed">Speaking speed (0.25 to 4.0).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Audio data as byte array (MP3 format).</returns>
    Task<byte[]> GenerateVoicePreviewAsync(
        string text,
        string voiceType,
        decimal speed = 1.0m,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a realtime voice session configuration for a voice agent.
    /// </summary>
    /// <param name="agentId">The voice agent ID.</param>
    /// <param name="systemPrompt">The system prompt/instructions.</param>
    /// <param name="voiceType">The voice type.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Session configuration for WebSocket connection.</returns>
    Task<RealtimeSessionConfig> CreateSessionConfigAsync(
        Guid agentId,
        string systemPrompt,
        string voiceType,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends audio input to an active realtime session.
    /// </summary>
    /// <param name="sessionId">The session ID.</param>
    /// <param name="audioData">Raw audio data (PCM16, 24kHz, mono).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task SendAudioInputAsync(
        string sessionId,
        byte[] audioData,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Commits the audio buffer to trigger a response.
    /// </summary>
    /// <param name="sessionId">The session ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task CommitAudioAsync(
        string sessionId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Closes a realtime voice session.
    /// </summary>
    /// <param name="sessionId">The session ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task CloseSessionAsync(
        string sessionId,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Represents an available voice option.
/// </summary>
public record VoiceOption(
    string Id,
    string DisplayName,
    string Gender,
    string Description);

/// <summary>
/// Configuration for a realtime voice session.
/// </summary>
#pragma warning disable CA1054, CA1056
public record RealtimeSessionConfig(
    string SessionId,
    string WebSocketUrl,
    string Voice,
    string Model,
    string Instructions,
    IDictionary<string, object> Modalities);
#pragma warning restore CA1054, CA1056
