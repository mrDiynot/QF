// -----------------------------------------------------------------------
// <copyright file="OpenAIService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.ClientModel;
using System.Text.Json;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

using OpenAI;
using OpenAI.Chat;
using OpenAI.Embeddings;

using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Common.Models;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// OpenAI service implementation with retry policies and comprehensive logging.
/// Model configuration is centralized in appsettings.json - no code changes needed for new models.
/// </summary>
public sealed partial class OpenAIService : IOpenAIService
{
    private const int MaxRetryAttempts = 3;
    private const int RetryDelayMs = 1000;

    private readonly OpenAIClient _openAIClient;
    private readonly ChatClient _chatClient;
    private readonly EmbeddingClient _embeddingClient;
    private readonly ILogger<OpenAIService> _logger;
    private readonly string _model;

    /// <summary>
    /// Initializes a new instance of the <see cref="OpenAIService"/> class.
    /// </summary>
    /// <param name="configuration">The application configuration.</param>
    /// <param name="logger">The logger instance.</param>
    public OpenAIService(IConfiguration configuration, ILogger<OpenAIService> logger)
    {
        _logger = logger;
        var apiKey = configuration["OpenAI:ApiKey"]
            ?? throw new InvalidOperationException("OpenAI:ApiKey configuration is required");

        // Use centralized model configuration - default to gpt-5-mini for cost efficiency
        _model = configuration["OpenAI:Models:Default"] ?? "gpt-5-mini";

        _openAIClient = new OpenAIClient(apiKey);
        _chatClient = _openAIClient.GetChatClient(_model);
        _embeddingClient = _openAIClient.GetEmbeddingClient("text-embedding-ada-002");

        LogServiceInitialized(_model);
    }

    /// <inheritdoc />
#pragma warning disable AsyncFixer01 // Unnecessary async/await usage - needed for proper exception handling
    public async Task<string> GenerateCompletionAsync(
        string prompt,
        string? systemMessage = null,
        int maxTokens = 1000,
        float temperature = 0.7f,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(prompt);

        var messages = new List<ChatMessage>();
        if (!string.IsNullOrWhiteSpace(systemMessage))
        {
            messages.Add(new SystemChatMessage(systemMessage));
        }

        messages.Add(new UserChatMessage(prompt));

        var options = new ChatCompletionOptions
        {
            MaxOutputTokenCount = maxTokens,
            Temperature = temperature,
        };

        return await ExecuteWithRetryAsync(
            async () =>
            {
                var startTime = DateTime.UtcNow;
                var response = await _chatClient.CompleteChatAsync(messages, options, cancellationToken);
                var latency = (DateTime.UtcNow - startTime).TotalMilliseconds;

                LogCompletionGenerated(latency, response.Value.Usage.TotalTokenCount);

                // Extract text content, handling potential null/empty responses
                var content = response.Value.Content;
                if (content == null || content.Count == 0)
                {
                    return "I apologize, but I couldn't generate a response. Please try again.";
                }

                var text = content[0].Text;
                return !string.IsNullOrWhiteSpace(text)
                    ? text
                    : "I apologize, but I couldn't generate a response. Please try again.";
            },
            "GenerateCompletion",
            cancellationToken);
    }
#pragma warning restore AsyncFixer01

    /// <inheritdoc />
    public async Task<string> GenerateChatCompletionAsync(
        string messagesJson,
        int maxTokens = 500,
        float temperature = 0.8f,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(messagesJson);

        // Parse messages JSON into ChatMessage objects
        var messagesList = new List<ChatMessage>();
        try
        {
            var messagesArray = JsonSerializer.Deserialize<JsonElement>(messagesJson);
            if (messagesArray.ValueKind != JsonValueKind.Array)
            {
                throw new ArgumentException("Messages must be a JSON array", nameof(messagesJson));
            }

            foreach (var msgElement in messagesArray.EnumerateArray())
            {
                var role = msgElement.GetProperty("role").GetString();
                var content = msgElement.GetProperty("content").GetString();

                if (string.IsNullOrWhiteSpace(role) || string.IsNullOrWhiteSpace(content))
                {
                    continue;
                }

                messagesList.Add(role.ToLowerInvariant() switch
                {
                    "system" => new SystemChatMessage(content),
                    "assistant" => new AssistantChatMessage(content),
                    "user" => new UserChatMessage(content),
                    _ => new UserChatMessage(content)
                });
            }
        }
        catch (JsonException ex)
        {
            throw new ArgumentException("Invalid messages JSON format", nameof(messagesJson), ex);
        }

        if (messagesList.Count == 0)
        {
            throw new ArgumentException("At least one message is required", nameof(messagesJson));
        }

        var options = new ChatCompletionOptions
        {
            MaxOutputTokenCount = maxTokens,
            Temperature = temperature,
        };

        return await ExecuteWithRetryAsync(
            async () =>
            {
                var startTime = DateTime.UtcNow;
                var response = await _chatClient.CompleteChatAsync(messagesList, options, cancellationToken);
                var latency = (DateTime.UtcNow - startTime).TotalMilliseconds;

                LogCompletionGenerated(latency, response.Value.Usage.TotalTokenCount);

                var content = response.Value.Content;
                if (content == null || content.Count == 0)
                {
                    return "I apologize, but I couldn't generate a response. Please try again.";
                }

                var text = content[0].Text;
                return !string.IsNullOrWhiteSpace(text)
                    ? text
                    : "I apologize, but I couldn't generate a response. Please try again.";
            },
            "GenerateChatCompletion",
            cancellationToken);
    }

    /// <inheritdoc />
    public async Task<LeadQualificationResult> QualifyLeadAsync(
        LeadQualificationRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var systemPrompt = BuildQualificationSystemPrompt(request.ScoringCriteria);
        var userPrompt = BuildQualificationUserPrompt(request);

        var jsonResponse = await GenerateCompletionAsync(
            userPrompt,
            systemPrompt,
            maxTokens: 1500,
            temperature: 0.3f,
            cancellationToken);

        return ParseQualificationResponse(jsonResponse);
    }

    /// <inheritdoc />
    public async Task<IntentDetectionResult> DetectIntentAsync(
        string message,
        IEnumerable<string>? conversationContext = null,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(message);

        var systemPrompt = """
            You are an intent detection system. Analyze the user message and respond with JSON:
            {
                "primaryIntent": "string (inquiry, purchase_interest, complaint, support, booking, information, etc.)",
                "confidence": 0.0-1.0,
                "secondaryIntents": [{"intent": "string", "confidence": 0.0-1.0}],
                "extractedEntities": {"key": "value"}
            }
            Respond ONLY with valid JSON, no markdown.
            """;

        var contextStr = conversationContext != null
            ? $"Previous messages:\n{string.Join("\n", conversationContext)}\n\nCurrent message: "
            : string.Empty;

        var jsonResponse = await GenerateCompletionAsync(
            $"{contextStr}{message}",
            systemPrompt,
            maxTokens: 500,
            temperature: 1.0f, // Use default temperature for model compatibility
            cancellationToken);

        return ParseIntentResponse(jsonResponse);
    }

    /// <inheritdoc />
    public async Task<SentimentAnalysisResult> AnalyzeSentimentAsync(
        string message,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(message);

        var systemPrompt = """
            You are a sentiment analysis system. Analyze the message and respond with JSON:
            {
                "sentiment": "Positive|Negative|Neutral|Mixed",
                "score": -1.0 to 1.0,
                "confidence": 0.0-1.0,
                "emotions": [{"emotion": "string", "intensity": 0.0-1.0}]
            }
            Respond ONLY with valid JSON, no markdown.
            """;

        var jsonResponse = await GenerateCompletionAsync(
            message,
            systemPrompt,
            maxTokens: 300,
            temperature: 1.0f, // Use default temperature for model compatibility
            cancellationToken);

        return ParseSentimentResponse(jsonResponse);
    }

    /// <inheritdoc />
    public async Task<float[]> GenerateEmbeddingAsync(
        string text,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(text);

        return await ExecuteWithRetryAsync(
            async () =>
            {
                var startTime = DateTime.UtcNow;
                var response = await _embeddingClient.GenerateEmbeddingAsync(text, cancellationToken: cancellationToken);
                var latency = (DateTime.UtcNow - startTime).TotalMilliseconds;

                LogEmbeddingGenerated(latency, text.Length);

                return response.Value.ToFloats().ToArray();
            },
            "GenerateEmbedding",
            cancellationToken);
    }

    // Static helper methods (must appear before non-static methods per SA1204)
    private static string BuildQualificationSystemPrompt(IReadOnlyList<ScoringCriterion> criteria)
    {
        var criteriaList = string.Join("\n", criteria.Select(c =>
            $"- {c.Name} (weight: {c.Weight}%): {c.Description}" +
            (string.IsNullOrEmpty(c.ExtractionHint) ? string.Empty : $" Hint: {c.ExtractionHint}")));

        return $$"""
            You are a lead qualification AI. Analyze the conversation and score the lead based on these criteria:
            {{criteriaList}}

            Respond with valid JSON only (no markdown):
            {
                "score": 0-100,
                "isQualified": true/false (qualified if score >= 70),
                "criterionScores": [
                    {"criterionName": "name", "score": 0-100, "weightedScore": float, "evidence": "quote from conversation"}
                ],
                "reasoning": "explanation of qualification decision",
                "suggestedActions": ["action1", "action2"],
                "confidence": 0.0-1.0
            }
            """;
    }

    private static string BuildQualificationUserPrompt(LeadQualificationRequest request)
    {
        var conversationText = string.Join("\n", request.ConversationHistory.Select(m =>
            $"[{(m.IsFromLead ? "LEAD" : "AGENT")} - {m.Timestamp:HH:mm}]: {m.Content}"));

        return $"""
            Lead Information:
            - Name: {request.LeadName}
            - Email: {request.LeadEmail}
            - Phone: {request.LeadPhone ?? "Not provided"}

            Conversation History:
            {conversationText}

            Analyze this conversation and qualify the lead.
            """;
    }

    private static string CleanJsonResponse(string json)
    {
        // Remove markdown code blocks if present
        json = json.Trim();
        if (json.StartsWith("```json", StringComparison.OrdinalIgnoreCase))
        {
            json = json[7..];
        }
        else if (json.StartsWith("```", StringComparison.Ordinal))
        {
            json = json[3..];
        }

        if (json.EndsWith("```", StringComparison.Ordinal))
        {
            json = json[..^3];
        }

        return json.Trim();
    }

    private static bool IsRetryable(ClientResultException ex)
    {
        // Retry on rate limits (429) and server errors (5xx)
        return ex.Status is 429 or >= 500;
    }

    // Non-static helper methods
    private LeadQualificationResult ParseQualificationResponse(string json)
    {
        try
        {
            var cleanJson = CleanJsonResponse(json);
            using var doc = JsonDocument.Parse(cleanJson);
            var root = doc.RootElement;

            var criterionScores = root.GetProperty("criterionScores").EnumerateArray()
                .Select(e => new CriterionScore
                {
                    CriterionName = e.GetProperty("criterionName").GetString() ?? string.Empty,
                    Score = e.GetProperty("score").GetInt32(),
                    WeightedScore = e.GetProperty("weightedScore").GetSingle(),
                    Evidence = e.TryGetProperty("evidence", out var ev) ? ev.GetString() : null,
                }).ToList();

            var suggestedActions = root.TryGetProperty("suggestedActions", out var sa)
                ? sa.EnumerateArray().Select(e => e.GetString() ?? string.Empty).ToList()
                : null;

            return new LeadQualificationResult
            {
                Score = root.GetProperty("score").GetInt32(),
                IsQualified = root.GetProperty("isQualified").GetBoolean(),
                CriterionScores = criterionScores,
                Reasoning = root.GetProperty("reasoning").GetString() ?? string.Empty,
                SuggestedActions = suggestedActions,
                Confidence = root.GetProperty("confidence").GetSingle(),
            };
        }
        catch (Exception ex)
        {
            LogQualificationParseError(ex, json);
            throw new InvalidOperationException("Failed to parse AI qualification response", ex);
        }
    }

    private IntentDetectionResult ParseIntentResponse(string json)
    {
        try
        {
            var cleanJson = CleanJsonResponse(json);
            using var doc = JsonDocument.Parse(cleanJson);
            var root = doc.RootElement;

            var secondaryIntents = root.TryGetProperty("secondaryIntents", out var si)
                ? si.EnumerateArray().Select(e => new SecondaryIntent
                {
                    Intent = e.GetProperty("intent").GetString() ?? string.Empty,
                    Confidence = e.GetProperty("confidence").GetSingle(),
                }).ToList()
                : null;

            var entities = root.TryGetProperty("extractedEntities", out var ee)
                ? ee.EnumerateObject().ToDictionary(p => p.Name, p => p.Value.GetString() ?? string.Empty, StringComparer.Ordinal)
                : null;

            return new IntentDetectionResult
            {
                PrimaryIntent = root.GetProperty("primaryIntent").GetString() ?? "unknown",
                Confidence = root.GetProperty("confidence").GetSingle(),
                SecondaryIntents = secondaryIntents,
                ExtractedEntities = entities,
            };
        }
        catch (Exception ex)
        {
            LogIntentParseError(ex, json);
            return new IntentDetectionResult
            {
                PrimaryIntent = "unknown",
                Confidence = 0,
            };
        }
    }

    private SentimentAnalysisResult ParseSentimentResponse(string json)
    {
        try
        {
            var cleanJson = CleanJsonResponse(json);
            using var doc = JsonDocument.Parse(cleanJson);
            var root = doc.RootElement;

            var emotions = root.TryGetProperty("emotions", out var em)
                ? em.EnumerateArray().Select(e => new DetectedEmotion
                {
                    Emotion = e.GetProperty("emotion").GetString() ?? string.Empty,
                    Intensity = e.GetProperty("intensity").GetSingle(),
                }).ToList()
                : null;

            return new SentimentAnalysisResult
            {
                Sentiment = root.GetProperty("sentiment").GetString() ?? "Neutral",
                Score = root.GetProperty("score").GetSingle(),
                Confidence = root.GetProperty("confidence").GetSingle(),
                Emotions = emotions,
            };
        }
        catch (Exception ex)
        {
            LogSentimentParseError(ex, json);
            return new SentimentAnalysisResult
            {
                Sentiment = "Neutral",
                Score = 0,
                Confidence = 0,
            };
        }
    }

    private async Task<T> ExecuteWithRetryAsync<T>(
        Func<Task<T>> operation,
        string operationName,
        CancellationToken cancellationToken)
    {
        var attempt = 0;
        while (attempt < MaxRetryAttempts)
        {
            try
            {
                attempt++;
                return await operation();
            }
            catch (ClientResultException ex) when (IsRetryable(ex) && attempt < MaxRetryAttempts)
            {
                LogRetryAttempt(ex, operationName, attempt, RetryDelayMs * attempt);
                await Task.Delay(RetryDelayMs * attempt, cancellationToken);
            }
            catch (Exception ex)
            {
                LogOperationFailed(ex, operationName, attempt);
                throw;
            }
        }

        throw new InvalidOperationException($"Operation {operationName} failed after {MaxRetryAttempts} attempts");
    }

    /// <inheritdoc />
    public async IAsyncEnumerable<string> GenerateCompletionStreamAsync(
        string prompt,
        string? systemMessage = null,
        int maxTokens = 300,
        float temperature = 0.7f,
        [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(prompt);

        var messages = new List<ChatMessage>();
        if (!string.IsNullOrWhiteSpace(systemMessage))
        {
            messages.Add(new SystemChatMessage(systemMessage));
        }

        messages.Add(new UserChatMessage(prompt));

        var options = new ChatCompletionOptions
        {
            MaxOutputTokenCount = maxTokens,
            Temperature = temperature,
        };

        var startTime = DateTime.UtcNow;
        var tokenCount = 0;

        await foreach (var update in _chatClient.CompleteChatStreamingAsync(messages, options, cancellationToken))
        {
            var tokens = update.ContentUpdate
                .Select(contentPart => contentPart.Text)
                .Where(text => !string.IsNullOrEmpty(text));

            foreach (var text in tokens)
            {
                tokenCount++;
                yield return text;
            }
        }

        var latency = (DateTime.UtcNow - startTime).TotalMilliseconds;
        LogStreamingCompleted(latency, tokenCount);
    }

    // LoggerMessage source generators for high-performance logging
    [LoggerMessage(Level = LogLevel.Information, Message = "OpenAI service initialized with model {Model}")]
    private partial void LogServiceInitialized(string model);

    [LoggerMessage(Level = LogLevel.Information, Message = "OpenAI completion generated in {Latency}ms, tokens: {Tokens}")]
    private partial void LogCompletionGenerated(double latency, int tokens);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to parse qualification response: {Json}")]
    private partial void LogQualificationParseError(Exception ex, string json);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to parse intent response: {Json}")]
    private partial void LogIntentParseError(Exception ex, string json);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to parse sentiment response: {Json}")]
    private partial void LogSentimentParseError(Exception ex, string json);

    [LoggerMessage(Level = LogLevel.Information, Message = "OpenAI embedding generated in {Latency}ms for text length {TextLength}")]
    private partial void LogEmbeddingGenerated(double latency, int textLength);

    [LoggerMessage(Level = LogLevel.Information, Message = "OpenAI streaming completed in {Latency}ms, chunks: {Chunks}")]
    private partial void LogStreamingCompleted(double latency, int chunks);

    [LoggerMessage(Level = LogLevel.Warning, Message = "OpenAI {Operation} attempt {Attempt} failed, retrying in {Delay}ms")]
    private partial void LogRetryAttempt(Exception ex, string operation, int attempt, int delay);

    [LoggerMessage(Level = LogLevel.Error, Message = "OpenAI {Operation} failed after {Attempts} attempts")]
    private partial void LogOperationFailed(Exception ex, string operation, int attempts);
}

