// -----------------------------------------------------------------------
// <copyright file="SentimentAnalysisService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Text.Json;

using Microsoft.Extensions.Logging;

using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.AI.DTOs;
using QualiFlow.Application.Features.AI.Interfaces;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for analyzing sentiment in customer conversations using AI.
/// Detects emotions, frustration levels, and escalation triggers.
/// </summary>
public sealed partial class SentimentAnalysisService : ISentimentAnalysisService
{
    private const double HighFrustrationThreshold = 0.7;
    private const double AngerEscalationThreshold = 0.6;
    private const int RepeatedComplaintEscalationCount = 3;
    private const string CustomerRole = "lead";

    private const string MessageSentimentSystemPrompt = """
        You are an advanced sentiment analysis system for customer conversations.
        Analyze the message and respond with JSON only (no markdown):
        {
            "sentiment": "Positive|Negative|Neutral|Mixed",
            "score": -1.0 to 1.0,
            "confidence": 0.0-1.0,
            "polarity": {"positive": 0.0-1.0, "negative": 0.0-1.0, "neutral": 0.0-1.0},
            "emotions": [{"name": "string", "intensity": 0.0-1.0, "confidence": 0.0-1.0}],
            "frustrationIndicators": {
                "frustrationLevel": 0.0-1.0,
                "triggers": ["string"],
                "explicitEscalationRequest": boolean,
                "repeatedComplaintCount": number,
                "frustrationKeywords": ["string"]
            },
            "urgencyLevel": "low|medium|high|critical",
            "reasoning": "brief explanation"
        }

        Emotions to detect: frustration, excitement, concern, satisfaction, anger, confusion, urgency, appreciation.
        Set requiresEscalation=true if: frustrationLevel>=0.7, anger intensity>=0.6, explicitEscalationRequest=true, or repeatedComplaintCount>=3.
        """;

    private const string ConversationSentimentSystemPrompt = """
        You are analyzing sentiment across an entire conversation.
        Analyze all messages and respond with JSON only (no markdown):
        {
            "overallSentiment": "Positive|Negative|Neutral|Mixed",
            "averageScore": -1.0 to 1.0,
            "confidence": 0.0-1.0,
            "messageSentiments": [
                {"messageIndex": 0, "sentiment": "string", "score": -1.0 to 1.0, "primaryEmotion": "string|null"}
            ],
            "dominantEmotions": [{"name": "string", "intensity": 0.0-1.0, "confidence": 0.0-1.0}],
            "positiveCount": number,
            "negativeCount": number,
            "neutralCount": number,
            "requiresEscalation": boolean,
            "escalationReasons": ["string"]
        }
        Only analyze customer messages for sentiment. Track agent messages for context only.
        """;

    private const string SentimentTrendSystemPrompt = """
        You are analyzing sentiment trajectory over a conversation.
        Analyze message sequence and respond with JSON only (no markdown):
        {
            "trajectory": "improving|declining|stable|volatile",
            "confidence": 0.0-1.0,
            "startScore": -1.0 to 1.0,
            "endScore": -1.0 to 1.0,
            "dataPoints": [{"index": 0, "score": -1.0 to 1.0, "sentiment": "string"}],
            "turningPointIndex": number|null,
            "turningPointReason": "string|null"
        }
        Focus on customer message sentiment. Calculate velocity as (endScore-startScore)/messageCount.
        """;

    private const string CustomerSatisfactionSystemPrompt = """
        You are detecting customer satisfaction indicators.
        Analyze and respond with JSON only (no markdown):
        {
            "csatScore": 1-5,
            "npsScore": -100 to 100,
            "effortScore": 1-7,
            "confidence": 0.0-1.0,
            "satisfactionDrivers": ["string"],
            "dissatisfactionDrivers": ["string"],
            "overallCategory": "satisfied|neutral|dissatisfied",
            "recommendedAction": "string|null"
        }
        CSAT: 1=very dissatisfied, 5=very satisfied
        NPS: -100 (detractor) to +100 (promoter)
        CES: 1=very easy, 7=very difficult (lower is better)
        """;

    private readonly IOpenAIService _openAIService;
    private readonly ILogger<SentimentAnalysisService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="SentimentAnalysisService"/> class.
    /// </summary>
    /// <param name="openAIService">The OpenAI service for AI completions.</param>
    /// <param name="logger">The logger instance.</param>
    public SentimentAnalysisService(
        IOpenAIService openAIService,
        ILogger<SentimentAnalysisService> logger)
    {
        _openAIService = openAIService;
        _logger = logger;

        LogServiceInitialized();
    }

    /// <inheritdoc />
    public async Task<SentimentAnalysisResponse> AnalyzeMessageSentimentAsync(
        string message,
        IReadOnlyList<string>? conversationContext = null,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(message);

        var startTime = DateTime.UtcNow;
        LogAnalysisStarted("MessageSentiment");

        var contextStr = conversationContext != null && conversationContext.Count > 0
            ? $"Previous messages:\n{string.Join("\n", conversationContext)}\n\nCurrent message: "
            : string.Empty;

        var jsonResponse = await _openAIService.GenerateCompletionAsync(
            $"{contextStr}{message}",
            MessageSentimentSystemPrompt,
            maxTokens: 800,
            temperature: 0.2f,
            cancellationToken);

        var result = ParseMessageSentimentResponse(jsonResponse);

        var latency = (DateTime.UtcNow - startTime).TotalMilliseconds;
        LogAnalysisCompleted("MessageSentiment", latency, result.RequiresEscalation);

        return result;
    }

    /// <inheritdoc />
    public async Task<ConversationSentimentResult> AnalyzeConversationSentimentAsync(
        IReadOnlyList<ConversationMessageDto> messages,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(messages);

        if (messages.Count == 0)
        {
            return CreateEmptyConversationResult();
        }

        var startTime = DateTime.UtcNow;
        LogAnalysisStarted("ConversationSentiment");

        var conversationText = string.Join("\n", messages.Select((m, i) =>
            $"[{(IsFromCustomer(m) ? "Customer" : "Agent")}] {m.Content}"));

        var jsonResponse = await _openAIService.GenerateCompletionAsync(
            conversationText,
            ConversationSentimentSystemPrompt,
            maxTokens: 1200,
            temperature: 0.2f,
            cancellationToken);

        var result = ParseConversationSentimentResponse(jsonResponse, messages);

        var latency = (DateTime.UtcNow - startTime).TotalMilliseconds;
        LogAnalysisCompleted("ConversationSentiment", latency, result.RequiresEscalation);

        return result;
    }

    /// <inheritdoc />
    public async Task<SentimentTrendResult> AnalyzeSentimentTrendAsync(
        IReadOnlyList<ConversationMessageDto> messages,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(messages);

        if (messages.Count < 2)
        {
            return CreateEmptyTrendResult();
        }

        var startTime = DateTime.UtcNow;
        LogAnalysisStarted("SentimentTrend");

        var conversationText = string.Join("\n", messages.Select((m, i) =>
            $"[Message {i + 1}] [{(IsFromCustomer(m) ? "Customer" : "Agent")}] {m.Content}"));

        var jsonResponse = await _openAIService.GenerateCompletionAsync(
            conversationText,
            SentimentTrendSystemPrompt,
            maxTokens: 1000,
            temperature: 0.2f,
            cancellationToken);

        var result = ParseSentimentTrendResponse(jsonResponse, messages);

        var latency = (DateTime.UtcNow - startTime).TotalMilliseconds;
        LogAnalysisCompleted("SentimentTrend", latency, escalationRequired: false);

        return result;
    }

    /// <inheritdoc />
    public async Task<CustomerSatisfactionResult> DetectCustomerSatisfactionAsync(
        string message,
        IReadOnlyList<string>? conversationContext = null,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(message);

        var startTime = DateTime.UtcNow;
        LogAnalysisStarted("CustomerSatisfaction");

        var contextStr = conversationContext != null && conversationContext.Count > 0
            ? $"Previous messages:\n{string.Join("\n", conversationContext)}\n\nCurrent message: "
            : string.Empty;

        var jsonResponse = await _openAIService.GenerateCompletionAsync(
            $"{contextStr}{message}",
            CustomerSatisfactionSystemPrompt,
            maxTokens: 600,
            temperature: 0.2f,
            cancellationToken);

        var result = ParseCustomerSatisfactionResponse(jsonResponse);

        var latency = (DateTime.UtcNow - startTime).TotalMilliseconds;
        LogAnalysisCompleted("CustomerSatisfaction", latency, escalationRequired: false);

        return result;
    }

    /// <summary>
    /// Determines if a message is from the customer based on role.
    /// </summary>
    /// <param name="message">The message to check.</param>
    /// <returns>True if the message is from the customer (lead role).</returns>
    private static bool IsFromCustomer(ConversationMessageDto message) =>
        message.Role.Equals(CustomerRole, StringComparison.OrdinalIgnoreCase);

    private static string CleanJsonResponse(string json)
    {
        var cleaned = json.Trim();
        if (cleaned.StartsWith("```json", StringComparison.OrdinalIgnoreCase))
        {
            cleaned = cleaned[7..];
        }
        else if (cleaned.StartsWith("```", StringComparison.Ordinal))
        {
            cleaned = cleaned[3..];
        }

        if (cleaned.EndsWith("```", StringComparison.Ordinal))
        {
            cleaned = cleaned[..^3];
        }

        return cleaned.Trim();
    }

    private static SentimentPolarityDto ParsePolarity(JsonElement root)
    {
        if (root.TryGetProperty("polarity", out var pol))
        {
            return new SentimentPolarityDto
            {
                Positive = pol.TryGetProperty("positive", out var p) ? p.GetDouble() : 0,
                Negative = pol.TryGetProperty("negative", out var n) ? n.GetDouble() : 0,
                Neutral = pol.TryGetProperty("neutral", out var nt) ? nt.GetDouble() : 1,
            };
        }

        return new SentimentPolarityDto { Positive = 0, Negative = 0, Neutral = 1 };
    }

    private static List<EmotionDto> ParseEmotions(JsonElement root, string propertyName = "emotions")
    {
        if (!root.TryGetProperty(propertyName, out var emotionsArray))
        {
            return [];
        }

        return emotionsArray.EnumerateArray()
            .Select(e => new EmotionDto
            {
                Name = e.TryGetProperty("name", out var n) ? n.GetString() ?? string.Empty : string.Empty,
                Intensity = e.TryGetProperty("intensity", out var i) ? i.GetDouble() : 0,
                Confidence = e.TryGetProperty("confidence", out var c) ? c.GetDouble() : 0.5,
            })
            .ToList();
    }

    private static FrustrationIndicatorsDto ParseFrustrationIndicators(JsonElement root)
    {
        if (!root.TryGetProperty("frustrationIndicators", out var fi))
        {
            return new FrustrationIndicatorsDto
            {
                FrustrationLevel = 0,
                IsHighFrustration = false,
                Triggers = [],
                ExplicitEscalationRequest = false,
                RepeatedComplaintCount = 0,
                FrustrationKeywords = [],
            };
        }

        var level = fi.TryGetProperty("frustrationLevel", out var fl) ? fl.GetDouble() : 0;

        return new FrustrationIndicatorsDto
        {
            FrustrationLevel = level,
            IsHighFrustration = level >= HighFrustrationThreshold,
            Triggers = ParseStringArrayFromElement(fi, "triggers"),
            ExplicitEscalationRequest = fi.TryGetProperty("explicitEscalationRequest", out var eer) && eer.GetBoolean(),
            RepeatedComplaintCount = fi.TryGetProperty("repeatedComplaintCount", out var rcc) ? rcc.GetInt32() : 0,
            FrustrationKeywords = ParseStringArrayFromElement(fi, "frustrationKeywords"),
        };
    }

    private static List<MessageSentimentDto> ParseMessageSentiments(
        JsonElement root,
        IReadOnlyList<ConversationMessageDto> messages)
    {
        if (!root.TryGetProperty("messageSentiments", out var msArray))
        {
            return [];
        }

        return msArray.EnumerateArray()
            .Select(ms =>
            {
                var index = ms.TryGetProperty("messageIndex", out var mi) ? mi.GetInt32() : 0;
                var isCustomer = index < messages.Count && IsFromCustomer(messages[index]);

                return new MessageSentimentDto
                {
                    MessageIndex = index,
                    Sentiment = ms.TryGetProperty("sentiment", out var s) ? s.GetString() ?? "Neutral" : "Neutral",
                    Score = ms.TryGetProperty("score", out var sc) ? sc.GetDouble() : 0,
                    PrimaryEmotion = ms.TryGetProperty("primaryEmotion", out var pe) && pe.ValueKind != JsonValueKind.Null
                        ? pe.GetString() : null,
                    IsCustomerMessage = isCustomer,
                };
            })
            .ToList();
    }

    private static List<SentimentDataPointDto> ParseDataPoints(
        JsonElement root,
        IReadOnlyList<ConversationMessageDto> messages)
    {
        if (!root.TryGetProperty("dataPoints", out var dpArray))
        {
            return [];
        }

        return dpArray.EnumerateArray()
            .Select(dp =>
            {
                var index = dp.TryGetProperty("index", out var i) ? i.GetInt32() : 0;
                var isCustomer = index < messages.Count && IsFromCustomer(messages[index]);
                var timestamp = index < messages.Count ? messages[index].SentAt : (DateTime?)null;

                return new SentimentDataPointDto
                {
                    Index = index,
                    Score = dp.TryGetProperty("score", out var s) ? s.GetDouble() : 0,
                    Sentiment = dp.TryGetProperty("sentiment", out var sent) ? sent.GetString() ?? "Neutral" : "Neutral",
                    IsCustomerMessage = isCustomer,
                    Timestamp = timestamp,
                };
            })
            .ToList();
    }

    private static List<string> ParseStringArray(JsonElement root, string propertyName)
    {
        if (!root.TryGetProperty(propertyName, out var arr) || arr.ValueKind != JsonValueKind.Array)
        {
            return [];
        }

        return arr.EnumerateArray()
            .Where(e => e.ValueKind == JsonValueKind.String)
            .Select(e => e.GetString() ?? string.Empty)
            .Where(s => !string.IsNullOrEmpty(s))
            .ToList();
    }

    private static List<string> ParseStringArrayFromElement(JsonElement element, string propertyName)
    {
        if (!element.TryGetProperty(propertyName, out var arr) || arr.ValueKind != JsonValueKind.Array)
        {
            return [];
        }

        return arr.EnumerateArray()
            .Where(e => e.ValueKind == JsonValueKind.String)
            .Select(e => e.GetString() ?? string.Empty)
            .Where(s => !string.IsNullOrEmpty(s))
            .ToList();
    }

    private static bool DetermineEscalation(FrustrationIndicatorsDto frustration, IReadOnlyList<EmotionDto> emotions)
    {
        if (frustration.IsHighFrustration || frustration.ExplicitEscalationRequest)
        {
            return true;
        }

        if (frustration.RepeatedComplaintCount >= RepeatedComplaintEscalationCount)
        {
            return true;
        }

        var angerEmotion = emotions.FirstOrDefault(e =>
            e.Name.Equals("anger", StringComparison.OrdinalIgnoreCase));

        return angerEmotion is { Intensity: >= AngerEscalationThreshold };
    }

    private static string BuildEscalationReason(FrustrationIndicatorsDto frustration, IReadOnlyList<EmotionDto> emotions)
    {
        var reasons = new List<string>();

        if (frustration.IsHighFrustration)
        {
            reasons.Add($"High frustration level ({frustration.FrustrationLevel:P0})");
        }

        if (frustration.ExplicitEscalationRequest)
        {
            reasons.Add("Customer explicitly requested escalation");
        }

        if (frustration.RepeatedComplaintCount >= RepeatedComplaintEscalationCount)
        {
            reasons.Add($"Repeated complaints ({frustration.RepeatedComplaintCount})");
        }

        var angerEmotion = emotions.FirstOrDefault(e =>
            e.Name.Equals("anger", StringComparison.OrdinalIgnoreCase));
        if (angerEmotion is { Intensity: >= AngerEscalationThreshold })
        {
            reasons.Add($"High anger intensity ({angerEmotion.Intensity:P0})");
        }

        return string.Join("; ", reasons);
    }

    private static SentimentAnalysisResponse CreateDefaultSentimentResponse()
    {
        return new SentimentAnalysisResponse
        {
            Sentiment = "Neutral",
            Score = 0,
            Confidence = 0,
            Polarity = new SentimentPolarityDto { Positive = 0, Negative = 0, Neutral = 1 },
            Emotions = [],
            FrustrationIndicators = new FrustrationIndicatorsDto
            {
                FrustrationLevel = 0,
                IsHighFrustration = false,
                Triggers = [],
                ExplicitEscalationRequest = false,
                RepeatedComplaintCount = 0,
                FrustrationKeywords = [],
            },
            RequiresEscalation = false,
            UrgencyLevel = "low",
        };
    }

    private static ConversationSentimentResult CreateEmptyConversationResult()
    {
        return new ConversationSentimentResult
        {
            OverallSentiment = "Neutral",
            AverageScore = 0,
            Confidence = 0,
            MessageSentiments = [],
            DominantEmotions = [],
            MessageCount = 0,
            PositiveMessageCount = 0,
            NegativeMessageCount = 0,
            NeutralMessageCount = 0,
            RequiresEscalation = false,
        };
    }

    private static SentimentTrendResult CreateEmptyTrendResult()
    {
        return new SentimentTrendResult
        {
            Trajectory = "stable",
            Confidence = 0,
            StartScore = 0,
            EndScore = 0,
            NetChange = 0,
            Velocity = 0,
            DataPoints = [],
        };
    }

    private static CustomerSatisfactionResult CreateDefaultSatisfactionResult()
    {
        return new CustomerSatisfactionResult
        {
            CsatScore = 3,
            NpsScore = 0,
            EffortScore = 4,
            Confidence = 0,
            SatisfactionDrivers = [],
            DissatisfactionDrivers = [],
            OverallCategory = "neutral",
        };
    }

    private SentimentAnalysisResponse ParseMessageSentimentResponse(string json)
    {
        try
        {
            var cleanJson = CleanJsonResponse(json);
            using var doc = JsonDocument.Parse(cleanJson);
            var root = doc.RootElement;

            var polarity = ParsePolarity(root);
            var emotions = ParseEmotions(root);
            var frustration = ParseFrustrationIndicators(root);

            var requiresEscalation = DetermineEscalation(frustration, emotions);
            var escalationReason = requiresEscalation ? BuildEscalationReason(frustration, emotions) : null;

            return new SentimentAnalysisResponse
            {
                Sentiment = root.GetProperty("sentiment").GetString() ?? "Neutral",
                Score = root.GetProperty("score").GetDouble(),
                Confidence = root.GetProperty("confidence").GetDouble(),
                Polarity = polarity,
                Emotions = emotions,
                FrustrationIndicators = frustration,
                RequiresEscalation = requiresEscalation,
                EscalationReason = escalationReason,
                UrgencyLevel = root.TryGetProperty("urgencyLevel", out var ul) ? ul.GetString() ?? "low" : "low",
                Reasoning = root.TryGetProperty("reasoning", out var r) ? r.GetString() : null,
            };
        }
        catch (Exception ex)
        {
            LogParseError(ex, "MessageSentiment");
            return CreateDefaultSentimentResponse();
        }
    }

    private ConversationSentimentResult ParseConversationSentimentResponse(
        string json,
        IReadOnlyList<ConversationMessageDto> messages)
    {
        try
        {
            var cleanJson = CleanJsonResponse(json);
            using var doc = JsonDocument.Parse(cleanJson);
            var root = doc.RootElement;

            var messageSentiments = ParseMessageSentiments(root, messages);
            var dominantEmotions = ParseEmotions(root, "dominantEmotions");

            return new ConversationSentimentResult
            {
                OverallSentiment = root.GetProperty("overallSentiment").GetString() ?? "Neutral",
                AverageScore = root.GetProperty("averageScore").GetDouble(),
                Confidence = root.GetProperty("confidence").GetDouble(),
                MessageSentiments = messageSentiments,
                DominantEmotions = dominantEmotions,
                MessageCount = messages.Count,
                PositiveMessageCount = root.TryGetProperty("positiveCount", out var pc) ? pc.GetInt32() : 0,
                NegativeMessageCount = root.TryGetProperty("negativeCount", out var nc) ? nc.GetInt32() : 0,
                NeutralMessageCount = root.TryGetProperty("neutralCount", out var ntc) ? ntc.GetInt32() : 0,
                RequiresEscalation = root.TryGetProperty("requiresEscalation", out var re) && re.GetBoolean(),
                EscalationReasons = ParseStringArray(root, "escalationReasons"),
            };
        }
        catch (Exception ex)
        {
            LogParseError(ex, "ConversationSentiment");
            return CreateEmptyConversationResult();
        }
    }

    private SentimentTrendResult ParseSentimentTrendResponse(
        string json,
        IReadOnlyList<ConversationMessageDto> messages)
    {
        try
        {
            var cleanJson = CleanJsonResponse(json);
            using var doc = JsonDocument.Parse(cleanJson);
            var root = doc.RootElement;

            var dataPoints = ParseDataPoints(root, messages);
            var startScore = root.GetProperty("startScore").GetDouble();
            var endScore = root.GetProperty("endScore").GetDouble();
            var netChange = endScore - startScore;
            var velocity = messages.Count > 1 ? netChange / (messages.Count - 1) : 0;

            return new SentimentTrendResult
            {
                Trajectory = root.GetProperty("trajectory").GetString() ?? "stable",
                Confidence = root.GetProperty("confidence").GetDouble(),
                StartScore = startScore,
                EndScore = endScore,
                NetChange = netChange,
                Velocity = velocity,
                DataPoints = dataPoints,
                TurningPointIndex = root.TryGetProperty("turningPointIndex", out var tp) && tp.ValueKind != JsonValueKind.Null
                    ? tp.GetInt32() : null,
                TurningPointReason = root.TryGetProperty("turningPointReason", out var tpr) && tpr.ValueKind != JsonValueKind.Null
                    ? tpr.GetString() : null,
            };
        }
        catch (Exception ex)
        {
            LogParseError(ex, "SentimentTrend");
            return CreateEmptyTrendResult();
        }
    }

    private CustomerSatisfactionResult ParseCustomerSatisfactionResponse(string json)
    {
        try
        {
            var cleanJson = CleanJsonResponse(json);
            using var doc = JsonDocument.Parse(cleanJson);
            var root = doc.RootElement;

            return new CustomerSatisfactionResult
            {
                CsatScore = root.GetProperty("csatScore").GetDouble(),
                NpsScore = root.GetProperty("npsScore").GetDouble(),
                EffortScore = root.GetProperty("effortScore").GetDouble(),
                Confidence = root.GetProperty("confidence").GetDouble(),
                SatisfactionDrivers = ParseStringArray(root, "satisfactionDrivers"),
                DissatisfactionDrivers = ParseStringArray(root, "dissatisfactionDrivers"),
                OverallCategory = root.GetProperty("overallCategory").GetString() ?? "neutral",
                RecommendedAction = root.TryGetProperty("recommendedAction", out var ra) && ra.ValueKind != JsonValueKind.Null
                    ? ra.GetString() : null,
            };
        }
        catch (Exception ex)
        {
            LogParseError(ex, "CustomerSatisfaction");
            return CreateDefaultSatisfactionResult();
        }
    }

    // LoggerMessage source generators for high-performance logging
    [LoggerMessage(Level = LogLevel.Information, Message = "Sentiment analysis service initialized")]
    private partial void LogServiceInitialized();

    [LoggerMessage(Level = LogLevel.Debug, Message = "Starting {AnalysisType} analysis")]
    private partial void LogAnalysisStarted(string analysisType);

    [LoggerMessage(Level = LogLevel.Information, Message = "{AnalysisType} analysis completed in {Latency}ms, escalation: {EscalationRequired}")]
    private partial void LogAnalysisCompleted(string analysisType, double latency, bool escalationRequired);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to parse {AnalysisType} response")]
    private partial void LogParseError(Exception ex, string analysisType);
}

