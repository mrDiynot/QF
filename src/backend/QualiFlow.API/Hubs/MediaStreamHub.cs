// Copyright (c) QualiFlow. All Rights Reserved.

#pragma warning disable SA1513, SA1515, SA1615, SA1201, SA1649

using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using QualiFlow.Application.Features.VoiceAgents.Services;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;
using QualiFlow.Infrastructure.Services;

namespace QualiFlow.API.Hubs;

/// <summary>
/// WebSocket handler for Twilio Media Streams.
/// Bridges bidirectional audio between Twilio and OpenAI Realtime API.
/// </summary>
public class MediaStreamHandler
{
    private readonly ILogger<MediaStreamHandler> _logger;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IHubContext<NotificationHub> _notificationHub;
    private readonly ConcurrentDictionary<string, MediaStreamSession> _sessions = new();

    public MediaStreamHandler(
        ILogger<MediaStreamHandler> logger,
        IServiceScopeFactory scopeFactory,
        IHubContext<NotificationHub> notificationHub)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;
        _notificationHub = notificationHub;
    }

    /// <summary>
    /// Handles an incoming Twilio Media Stream WebSocket connection.
    /// </summary>
    public async Task HandleWebSocketAsync(
        WebSocket twilioSocket,
        Guid agentId,
        string callSid,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Media stream connection started for agent {AgentId}, call {CallSid}", agentId, callSid);

        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<QualiFlowDbContext>();
        var realtimeService = scope.ServiceProvider.GetRequiredService<RealtimeVoiceService>();

        // Get voice agent configuration
        var agent = await dbContext.Set<VoiceAgent>()
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == agentId && a.DeletedAt == null, cancellationToken);

        if (agent == null)
        {
            _logger.LogError("Voice agent {AgentId} not found", agentId);
            await twilioSocket.CloseAsync(WebSocketCloseStatus.InvalidPayloadData, "Agent not found", cancellationToken);
            return;
        }

        // Build system prompt from agent configuration
        var systemPrompt = BuildSystemPrompt(agent);

        // Create OpenAI realtime session
        var sessionConfig = await realtimeService.CreateSessionConfigAsync(
            agentId, systemPrompt, agent.VoiceType, cancellationToken);

        // Connect to OpenAI Realtime API
        var openaiSocket = await realtimeService.ConnectToSessionAsync(sessionConfig, cancellationToken);

        var session = new MediaStreamSession(
            callSid,
            agentId,
            twilioSocket,
            openaiSocket,
            sessionConfig.SessionId);

        // Look up the VoiceCall by CallSid to get BusinessId for SignalR broadcasting
        var voiceCall = await dbContext.Set<VoiceCall>()
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.ExternalCallSid == callSid, cancellationToken);

        if (voiceCall != null)
        {
            session.BusinessId = voiceCall.BusinessId;
            session.VoiceCallId = voiceCall.Id;
            _logger.LogInformation("Linked media stream to VoiceCall {CallId} for business {BusinessId}", voiceCall.Id, voiceCall.BusinessId);
        }

        _sessions[callSid] = session;

        try
        {
            // Start bidirectional audio bridge
            var twilioTask = ProcessTwilioMessagesAsync(session, cancellationToken);
            var openaiTask = ProcessOpenAIMessagesAsync(session, cancellationToken);

            await Task.WhenAny(twilioTask, openaiTask);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in media stream for call {CallSid}", callSid);
        }
        finally
        {
            _sessions.TryRemove(callSid, out _);
            await realtimeService.CloseSessionAsync(sessionConfig.SessionId, cancellationToken);

            if (twilioSocket.State == WebSocketState.Open)
            {
                await twilioSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Session ended", cancellationToken);
            }

            _logger.LogInformation("Media stream connection ended for call {CallSid}", callSid);
        }
    }

    private async Task ProcessTwilioMessagesAsync(MediaStreamSession session, CancellationToken cancellationToken)
    {
        var buffer = new byte[8192];

        while (session.TwilioSocket.State == WebSocketState.Open && !cancellationToken.IsCancellationRequested)
        {
            var result = await session.TwilioSocket.ReceiveAsync(
                new ArraySegment<byte>(buffer), cancellationToken);

            if (result.MessageType == WebSocketMessageType.Close)
            {
                break;
            }

            var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
            await HandleTwilioMessage(session, message, cancellationToken);
        }
    }

    private async Task HandleTwilioMessage(
        MediaStreamSession session,
        string message,
        CancellationToken cancellationToken)
    {
        try
        {
            using var doc = JsonDocument.Parse(message);
            var root = doc.RootElement;
            var eventType = root.GetProperty("event").GetString();

            switch (eventType)
            {
                case "connected":
                    _logger.LogInformation("Twilio stream connected for call {CallSid}", session.CallSid);
                    break;

                case "start":
                    var streamSid = root.GetProperty("streamSid").GetString();
                    session.StreamSid = streamSid;
                    _logger.LogInformation("Twilio stream started: {StreamSid}", streamSid);
                    break;

                case "media":
                    // Forward audio to OpenAI
                    var payload = root.GetProperty("media").GetProperty("payload").GetString();
                    if (!string.IsNullOrEmpty(payload))
                    {
                        var audioData = Convert.FromBase64String(payload);

                        // Convert mulaw to PCM16 for OpenAI
                        var pcmAudio = MulawToPcm16(audioData);
                        await SendToOpenAI(session, pcmAudio, cancellationToken);
                    }
                    break;

                case "stop":
                    _logger.LogInformation("Twilio stream stopped for call {CallSid}", session.CallSid);
                    break;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing Twilio message");
        }
    }

    private async Task ProcessOpenAIMessagesAsync(MediaStreamSession session, CancellationToken cancellationToken)
    {
        var buffer = new byte[32768]; // Larger buffer for audio

        while (session.OpenAISocket.State == WebSocketState.Open && !cancellationToken.IsCancellationRequested)
        {
            var result = await session.OpenAISocket.ReceiveAsync(
                new ArraySegment<byte>(buffer), cancellationToken);

            if (result.MessageType == WebSocketMessageType.Close)
            {
                break;
            }

            var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
            await HandleOpenAIMessage(session, message, cancellationToken);
        }
    }

    private async Task HandleOpenAIMessage(
        MediaStreamSession session,
        string message,
        CancellationToken cancellationToken)
    {
        try
        {
            using var doc = JsonDocument.Parse(message);
            var root = doc.RootElement;
            var eventType = root.GetProperty("type").GetString();

            switch (eventType)
            {
                case "session.created":
                    _logger.LogInformation("OpenAI session created for call {CallSid}", session.CallSid);
                    break;

                case "response.audio.delta":
                    // Forward audio to Twilio
                    var audioBase64 = root.GetProperty("delta").GetString();
                    if (!string.IsNullOrEmpty(audioBase64))
                    {
                        var audioData = Convert.FromBase64String(audioBase64);

                        // Convert PCM16 to mulaw for Twilio
                        var mulawAudio = Pcm16ToMulaw(audioData);
                        await SendToTwilio(session, mulawAudio, cancellationToken);
                    }
                    break;

                case "response.audio_transcript.delta":
                    // AI speaking - extract and broadcast transcript
                    var aiTranscript = root.GetProperty("delta").GetString();
                    if (!string.IsNullOrEmpty(aiTranscript))
                    {
                        session.AppendTranscript("assistant", aiTranscript);
                        await BroadcastTranscriptAsync(session, "assistant", aiTranscript, false, cancellationToken);
                    }
                    break;

                case "conversation.item.input_audio_transcription.completed":
                    // User speech transcribed - extract and broadcast
                    var userTranscript = root.GetProperty("transcript").GetString();
                    if (!string.IsNullOrEmpty(userTranscript))
                    {
                        session.AppendTranscript("user", userTranscript);
                        await BroadcastTranscriptAsync(session, "user", userTranscript, true, cancellationToken);
                        _logger.LogInformation("User said: {Transcript}", userTranscript);
                    }
                    break;

                case "input_audio_buffer.speech_started":
                    _logger.LogDebug("User started speaking");
                    break;

                case "response.done":
                    _logger.LogDebug("AI response complete");
                    // Store transcript to database
                    await SaveTranscriptAsync(session, cancellationToken);
                    break;

                case "error":
                    var error = root.GetProperty("error").GetProperty("message").GetString();
                    _logger.LogError("OpenAI error: {Error}", error);
                    break;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing OpenAI message");
        }
    }

    private static async Task SendToOpenAI(MediaStreamSession session, byte[] audioData, CancellationToken cancellationToken)
    {
        if (session.OpenAISocket.State != WebSocketState.Open)
        {
            return;
        }

        var message = new
        {
            type = "input_audio_buffer.append",
            audio = Convert.ToBase64String(audioData)
        };

        var json = JsonSerializer.Serialize(message);
        var bytes = Encoding.UTF8.GetBytes(json);

        await session.OpenAISocket.SendAsync(
            new ArraySegment<byte>(bytes),
            WebSocketMessageType.Text,
            true,
            cancellationToken);
    }

    private static async Task SendToTwilio(MediaStreamSession session, byte[] audioData, CancellationToken cancellationToken)
    {
        if (session.TwilioSocket.State != WebSocketState.Open || string.IsNullOrEmpty(session.StreamSid))
        {
            return;
        }

        var message = new
        {
            @event = "media",
            streamSid = session.StreamSid,
            media = new
            {
                payload = Convert.ToBase64String(audioData)
            }
        };

        var json = JsonSerializer.Serialize(message);
        var bytes = Encoding.UTF8.GetBytes(json);

        await session.TwilioSocket.SendAsync(
            new ArraySegment<byte>(bytes),
            WebSocketMessageType.Text,
            true,
            cancellationToken);
    }

    private static string BuildSystemPrompt(VoiceAgent agent)
    {
        var prompt = new StringBuilder();
        prompt.AppendLine($"You are {agent.Name}, an AI voice assistant for a business.");
        prompt.AppendLine($"Your role is: {agent.Role}");
        prompt.AppendLine($"Your personality: {agent.Personality}");
        prompt.AppendLine();
        prompt.AppendLine("Guidelines:");
        prompt.AppendLine("- Be conversational and natural in your responses");
        prompt.AppendLine("- Keep responses concise for voice (1-2 sentences typically)");
        prompt.AppendLine("- Ask clarifying questions when needed");
        prompt.AppendLine("- Be helpful and professional");

        if (!string.IsNullOrEmpty(agent.Script))
        {
            prompt.AppendLine();
            prompt.AppendLine("Additional instructions:");
            prompt.AppendLine(agent.Script);
        }

        return prompt.ToString();
    }

    private async Task BroadcastTranscriptAsync(
        MediaStreamSession session,
        string speaker,
        string text,
        bool isFinal,
        CancellationToken cancellationToken)
    {
        try
        {
            if (session.BusinessId.HasValue)
            {
                await _notificationHub.Clients.Group($"business_{session.BusinessId}")
                    .SendAsync("VoiceTranscriptUpdate", new
                    {
                        CallSid = session.CallSid,
                        CallId = session.VoiceCallId,
                        Speaker = speaker,
                        Text = text,
                        IsFinal = isFinal,
                        Timestamp = DateTime.UtcNow
                    }, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to broadcast transcript for call {CallSid}", session.CallSid);
        }
    }

    private async Task SaveTranscriptAsync(MediaStreamSession session, CancellationToken cancellationToken)
    {
        try
        {
            if (session.VoiceCallId.HasValue && session.TranscriptBuilder.Length > 0)
            {
                using var scope = _scopeFactory.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<QualiFlowDbContext>();

                var voiceCall = await dbContext.Set<VoiceCall>()
                    .FirstOrDefaultAsync(c => c.Id == session.VoiceCallId, cancellationToken);

                if (voiceCall != null)
                {
                    voiceCall.Transcript = session.TranscriptBuilder.ToString();
                    await dbContext.SaveChangesAsync(cancellationToken);
                    _logger.LogInformation("Saved transcript for call {CallId}", session.VoiceCallId);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save transcript for call {CallSid}", session.CallSid);
        }
    }

    // Audio format conversion utilities
    private static byte[] MulawToPcm16(byte[] mulawData)
    {
        // Twilio sends 8kHz mulaw, OpenAI expects 24kHz PCM16
        // This is a simplified conversion - production would need proper resampling
        var pcm = new byte[mulawData.Length * 2];
        for (int i = 0; i < mulawData.Length; i++)
        {
            var sample = MulawDecode(mulawData[i]);
            pcm[i * 2] = (byte)(sample & 0xFF);
            pcm[(i * 2) + 1] = (byte)((sample >> 8) & 0xFF);
        }
        return pcm;
    }

    private static byte[] Pcm16ToMulaw(byte[] pcmData)
    {
        // OpenAI sends 24kHz PCM16, Twilio expects 8kHz mulaw
        var mulaw = new byte[pcmData.Length / 2];
        for (int i = 0; i < mulaw.Length; i++)
        {
            var sample = (short)(pcmData[i * 2] | (pcmData[(i * 2) + 1] << 8));
            mulaw[i] = MulawEncode(sample);
        }
        return mulaw;
    }

    private static readonly short[] MulawDecodeTable = CreateMulawDecodeTable();
    private static short[] CreateMulawDecodeTable()
    {
        var table = new short[256];
        for (int i = 0; i < 256; i++)
        {
            int mulaw = ~i;
            int sign = (mulaw & 0x80) != 0 ? -1 : 1;
            int exponent = (mulaw >> 4) & 0x07;
            int mantissa = mulaw & 0x0F;
            int sample = ((mantissa << 3) + 0x84) << exponent;
            table[i] = (short)(sign * (sample - 0x84));
        }
        return table;
    }

    private static short MulawDecode(byte mulaw) => MulawDecodeTable[mulaw];

    private static byte MulawEncode(short sample)
    {
        const int BIAS = 0x84;
        const int MAX = 32635;

        int sign = (sample >> 8) & 0x80;
        if (sign != 0)
        {
            sample = (short)-sample;
        }

        if (sample > MAX)
        {
            sample = MAX;
        }

        sample += BIAS;
        int exponent = 7;
        for (int expMask = 0x4000; (sample & expMask) == 0 && exponent > 0; exponent--, expMask >>= 1)
        {
            // Empty loop body - decrement handled in loop expression
        }

        int mantissa = (sample >> (exponent + 3)) & 0x0F;
        return (byte)(~(sign | (exponent << 4) | mantissa));
    }
}

/// <summary>
/// Represents an active media stream session.
/// </summary>
public class MediaStreamSession
{
    public string CallSid { get; }
    public Guid AgentId { get; }
    public WebSocket TwilioSocket { get; }
    public WebSocket OpenAISocket { get; }
    public string OpenAISessionId { get; }
    public string? StreamSid { get; set; }
    public Guid? BusinessId { get; set; }
    public Guid? VoiceCallId { get; set; }
    public StringBuilder TranscriptBuilder { get; } = new();

    public MediaStreamSession(
        string callSid,
        Guid agentId,
        WebSocket twilioSocket,
        WebSocket openaiSocket,
        string openaiSessionId)
    {
        CallSid = callSid;
        AgentId = agentId;
        TwilioSocket = twilioSocket;
        OpenAISocket = openaiSocket;
        OpenAISessionId = openaiSessionId;
    }

    public void AppendTranscript(string speaker, string text)
    {
        var timestamp = DateTime.UtcNow.ToString("HH:mm:ss", System.Globalization.CultureInfo.InvariantCulture);
        var label = speaker == "user" ? "Customer" : "AI";
        TranscriptBuilder.AppendLine($"[{timestamp}] {label}: {text}");
    }
}
