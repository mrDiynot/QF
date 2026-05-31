// Copyright (c) QualiFlow. All Rights Reserved.

using System.Net.Http.Headers;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.VoiceAgents.Services;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// OpenAI Realtime Voice API implementation.
/// Supports both TTS preview and realtime bidirectional voice conversations.
/// </summary>
#pragma warning disable S1450 // Private fields only used in constructor
public sealed class RealtimeVoiceService : IRealtimeVoiceService, IDisposable
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<RealtimeVoiceService> _logger;
    private readonly string _apiKey;
    private readonly string _realtimeWebSocketUrl;
    private readonly string _realtimeModel;
    private readonly string _ttsModel;
    private readonly Dictionary<string, ClientWebSocket> _activeSessions = new();

    /// <summary>
    /// Available OpenAI voices mapped to user-friendly display names.
    /// </summary>
    private static readonly List<VoiceOption> _voices = new()
    {
        new("alloy", "Female - Professional", "Female", "A balanced, professional female voice"),
        new("echo", "Male - Professional", "Male", "A clear, professional male voice"),
        new("fable", "Female - Warm", "Female", "A warm, narrative female voice"),
        new("onyx", "Male - Deep", "Male", "A deep, authoritative male voice"),
        new("nova", "Female - Friendly", "Female", "A friendly, conversational female voice"),
        new("shimmer", "Female - Expressive", "Female", "An expressive, dynamic female voice"),
        new("ash", "Male - Casual", "Male", "A casual, relaxed male voice"),
        new("ballad", "Female - Melodic", "Female", "A melodic, pleasant female voice"),
        new("coral", "Female - Confident", "Female", "A confident, articulate female voice"),
        new("sage", "Male - Wise", "Male", "A wise, thoughtful male voice"),
        new("verse", "Male - Energetic", "Male", "An energetic, upbeat male voice"),
    };

    public RealtimeVoiceService(
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        ILogger<RealtimeVoiceService> logger)
    {
        _logger = logger;
        _apiKey = configuration["OpenAI:ApiKey"]
            ?? throw new InvalidOperationException("OpenAI:ApiKey configuration is required");

#pragma warning disable S1075 // Default fallback URIs from configuration
        var baseUrl = configuration["OpenAI:BaseUrl"] ?? "https://api.openai.com/v1/";
        _realtimeWebSocketUrl = configuration["OpenAI:RealtimeWebSocketUrl"] ?? "wss://api.openai.com/v1/realtime";
#pragma warning restore S1075
        _realtimeModel = configuration["OpenAI:Models:Realtime"] ?? "gpt-5-realtime";
        _ttsModel = configuration["OpenAI:Models:TextToSpeech"] ?? "tts-1";

        _httpClient = httpClientFactory.CreateClient("OpenAI");
        _httpClient.BaseAddress = new Uri(baseUrl);
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        _logger.LogInformation("RealtimeVoiceService initialized with model {Model}", _realtimeModel);
    }

    /// <inheritdoc />
    public IReadOnlyList<VoiceOption> AvailableVoices => _voices.AsReadOnly();

    /// <inheritdoc />
    public string MapVoiceType(string voiceType)
    {
        // Map user-friendly voice type to OpenAI voice ID
        var match = _voices.Find(v =>
            v.DisplayName.Equals(voiceType, StringComparison.OrdinalIgnoreCase));

        if (match != null)
        {
            return match.Id;
        }

        // Fallback mapping based on keywords
        var lower = voiceType.ToLowerInvariant();

        if (lower.Contains("female", StringComparison.Ordinal) && lower.Contains("professional", StringComparison.Ordinal))
        {
            return "alloy";
        }

        if (lower.Contains("male", StringComparison.Ordinal) && lower.Contains("professional", StringComparison.Ordinal))
        {
            return "echo";
        }

        if (lower.Contains("female", StringComparison.Ordinal) && lower.Contains("friendly", StringComparison.Ordinal))
        {
            return "nova";
        }

        if (lower.Contains("male", StringComparison.Ordinal) && lower.Contains("deep", StringComparison.Ordinal))
        {
            return "onyx";
        }

        if (lower.Contains("female", StringComparison.Ordinal) && lower.Contains("warm", StringComparison.Ordinal))
        {
            return "fable";
        }

        if (lower.Contains("male", StringComparison.Ordinal) && lower.Contains("casual", StringComparison.Ordinal))
        {
            return "ash";
        }

        // Default to alloy (balanced female voice)
        return "alloy";
    }

    /// <inheritdoc />
    public async Task<byte[]> GenerateVoicePreviewAsync(
        string text,
        string voiceType,
        decimal speed = 1.0m,
        CancellationToken cancellationToken = default)
    {
        var voice = MapVoiceType(voiceType);
        var clampedSpeed = Math.Clamp(speed, 0.25m, 4.0m);

        var request = new
        {
            model = _ttsModel,
            input = text,
            voice = voice,
            speed = (double)clampedSpeed,
            response_format = "mp3"
        };

        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        _logger.LogInformation("Generating TTS preview with voice {Voice}, speed {Speed}", voice, clampedSpeed);

#pragma warning disable CA2234
        var response = await _httpClient.PostAsync("audio/speech", content, cancellationToken);
#pragma warning restore CA2234
        response.EnsureSuccessStatusCode();

        var audioData = await response.Content.ReadAsByteArrayAsync(cancellationToken);

        _logger.LogInformation("Generated {Bytes} bytes of audio", audioData.Length);

        return audioData;
    }

    /// <inheritdoc />
    public async Task<RealtimeSessionConfig> CreateSessionConfigAsync(
        Guid agentId,
        string systemPrompt,
        string voiceType,
        CancellationToken cancellationToken = default)
    {
        var voice = MapVoiceType(voiceType);
        var sessionId = $"session_{agentId}_{Guid.NewGuid():N}";

        // Create ephemeral token for WebSocket connection
        var tokenRequest = new
        {
            model = _realtimeModel,
            voice = voice
        };

        var json = JsonSerializer.Serialize(tokenRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

#pragma warning disable CA2234
        var response = await _httpClient.PostAsync("realtime/sessions", content, cancellationToken);
#pragma warning restore CA2234

        string? clientSecret = null;
        if (response.IsSuccessStatusCode)
        {
            var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(responseJson);
            clientSecret = doc.RootElement.GetProperty("client_secret").GetProperty("value").GetString();
        }

        var modalities = new Dictionary<string, object>
        {
            ["audio"] = true,
            ["text"] = true,
            ["client_secret"] = clientSecret ?? _apiKey
        };

        var config = new RealtimeSessionConfig(
            SessionId: sessionId,
            WebSocketUrl: $"{_realtimeWebSocketUrl}?model={_realtimeModel}",
            Voice: voice,
            Model: _realtimeModel,
            Instructions: systemPrompt,
            Modalities: modalities);

        _logger.LogInformation("Created realtime session {SessionId} with voice {Voice}", sessionId, voice);

        return config;
    }

    /// <inheritdoc />
    public async Task SendAudioInputAsync(
        string sessionId,
        byte[] audioData,
        CancellationToken cancellationToken = default)
    {
        if (!_activeSessions.TryGetValue(sessionId, out var ws))
        {
            throw new InvalidOperationException($"Session {sessionId} not found");
        }

        // Send audio as base64 encoded input_audio_buffer.append event
        var audioBase64 = Convert.ToBase64String(audioData);
        var message = new
        {
            type = "input_audio_buffer.append",
            audio = audioBase64
        };

        var json = JsonSerializer.Serialize(message);
        var bytes = Encoding.UTF8.GetBytes(json);

        await ws.SendAsync(
            new ArraySegment<byte>(bytes),
            WebSocketMessageType.Text,
            true,
            cancellationToken);
    }

    /// <inheritdoc />
    public async Task CommitAudioAsync(
        string sessionId,
        CancellationToken cancellationToken = default)
    {
        if (!_activeSessions.TryGetValue(sessionId, out var ws))
        {
            throw new InvalidOperationException($"Session {sessionId} not found");
        }

        var message = new { type = "input_audio_buffer.commit" };
        var json = JsonSerializer.Serialize(message);
        var bytes = Encoding.UTF8.GetBytes(json);

        await ws.SendAsync(
            new ArraySegment<byte>(bytes),
            WebSocketMessageType.Text,
            true,
            cancellationToken);
    }

    /// <inheritdoc />
    public async Task CloseSessionAsync(
        string sessionId,
        CancellationToken cancellationToken = default)
    {
        if (_activeSessions.TryGetValue(sessionId, out var ws))
        {
            if (ws.State == WebSocketState.Open)
            {
                await ws.CloseAsync(
                    WebSocketCloseStatus.NormalClosure,
                    "Session ended",
                    cancellationToken);
            }

            ws.Dispose();
            _activeSessions.Remove(sessionId);

            _logger.LogInformation("Closed realtime session {SessionId}", sessionId);
        }
    }

    /// <summary>
    /// Connects to an OpenAI realtime session via WebSocket.
    /// </summary>
    /// <param name="config">The session configuration.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The connected WebSocket client.</returns>
    public async Task<ClientWebSocket> ConnectToSessionAsync(
        RealtimeSessionConfig config,
        CancellationToken cancellationToken = default)
    {
        var ws = new ClientWebSocket();
        ws.Options.SetRequestHeader("Authorization", $"Bearer {_apiKey}");
        ws.Options.SetRequestHeader("OpenAI-Beta", "realtime=v1");

        await ws.ConnectAsync(new Uri(config.WebSocketUrl), cancellationToken);

        // Send session.update to configure the session
        var sessionUpdate = new
        {
            type = "session.update",
            session = new
            {
                modalities = new[] { "text", "audio" },
                instructions = config.Instructions,
                voice = config.Voice,
                input_audio_format = "pcm16",
                output_audio_format = "pcm16",
                input_audio_transcription = new { model = "whisper-1" },
                turn_detection = new
                {
                    type = "server_vad",
                    threshold = 0.5,
                    prefix_padding_ms = 300,
                    silence_duration_ms = 500
                }
            }
        };

        var json = JsonSerializer.Serialize(sessionUpdate);
        var bytes = Encoding.UTF8.GetBytes(json);

        await ws.SendAsync(
            new ArraySegment<byte>(bytes),
            WebSocketMessageType.Text,
            true,
            cancellationToken);

        _activeSessions[config.SessionId] = ws;

        _logger.LogInformation("Connected to realtime session {SessionId}", config.SessionId);

        return ws;
    }

    public void Dispose()
    {
        foreach (var ws in _activeSessions.Values)
        {
            ws.Dispose();
        }

        _activeSessions.Clear();
        _httpClient.Dispose();
    }
}
