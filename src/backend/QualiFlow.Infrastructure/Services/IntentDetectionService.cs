// -----------------------------------------------------------------------
// <copyright file="IntentDetectionService.cs" company="QualiFlow">
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
/// Service for advanced intent detection in lead qualification conversations.
/// </summary>
public sealed partial class IntentDetectionService : IIntentDetectionService
{
    private const string ConversationStageSystemPrompt = """
        You are a sales conversation stage classifier for B2B lead qualification.
        Analyze the conversation and determine the current stage.

        CONVERSATION STAGES (in order):
        1. initial_contact: First interaction, greeting, introduction
        2. discovery: Understanding needs, asking questions
        3. qualification: Assessing fit, budget, authority, need, timeline
        4. presentation: Presenting solution, features, benefits
        5. objection_handling: Addressing concerns, answering objections
        6. negotiation: Discussing terms, pricing, conditions
        7. closing: Final decision, commitment, next steps
        8. post_sale: After purchase, onboarding, support

        Respond with valid JSON only (no markdown):
        {
            "stage": "stage_name",
            "confidence": 0.0-1.0,
            "description": "brief description of current stage",
            "nextExpectedStage": "next stage name",
            "recommendedActions": ["action1", "action2"],
            "progressPercentage": 0-100
        }
        """;

    private const string BuyingSignalsSystemPrompt = """
        You are a buying signals detection expert for B2B sales.
        Analyze the message for indicators of purchase intent.

        BUYING SIGNAL TYPES:
        - budget_mention: Discussing budget or financial capacity
        - timeline_urgency: Expressing time pressure or deadlines
        - decision_maker_involvement: Mentioning stakeholders or approval process
        - competitor_comparison: Comparing with alternatives (positive for us)
        - feature_interest: Deep interest in specific features
        - implementation_questions: Asking about deployment/setup
        - pricing_inquiry: Asking about costs (shows serious interest)
        - demo_request: Wanting to see the product in action
        - trial_interest: Interested in trying before buying
        - reference_request: Asking for case studies or references
        - contract_discussion: Discussing terms or agreements
        - next_steps_inquiry: Asking about the buying process

        SIGNAL STRENGTH:
        - weak: Subtle indication, might be casual interest
        - moderate: Clear interest but not urgent
        - strong: High intent, ready to move forward

        Respond with valid JSON only (no markdown):
        {
            "hasBuyingSignals": true/false,
            "buyingIntentScore": 0-100,
            "signals": [
                {"signalType": "type", "strength": "weak|moderate|strong", "evidence": "quote"}
            ],
            "urgencyLevel": "low|medium|high|critical",
            "recommendedStrategy": "suggested approach"
        }
        """;

    private const string InformationExtractionSystemPrompt = """
        You are an information extraction expert for B2B lead qualification.
        Extract structured information from the message.

        Extract the following when present:
        - Contact info: name, email, phone, job title
        - Company info: name, size, industry, location
        - Budget info: range, currency, timeframe
        - Timeline info: urgency, expected start, deadline
        - Pain points: problems they're trying to solve
        - Requirements: specific needs or must-haves

        Respond with valid JSON only (no markdown):
        {
            "contactInfo": {"name": "", "email": "", "phone": "", "jobTitle": ""},
            "companyInfo": {"name": "", "size": "", "industry": "", "location": ""},
            "budgetInfo": {"hasBudget": true/false, "range": "", "currency": "", "timeframe": ""},
            "timelineInfo": {"urgency": "", "expectedStart": "", "deadline": ""},
            "painPoints": ["point1", "point2"],
            "requirements": ["req1", "req2"],
            "customEntities": {"key": "value"},
            "confidence": 0.0-1.0
        }
        Only include fields that have actual extracted values.
        """;

    private readonly IOpenAIService _openAIService;
    private readonly ILogger<IntentDetectionService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="IntentDetectionService"/> class.
    /// </summary>
    /// <param name="openAIService">The OpenAI service.</param>
    /// <param name="logger">The logger.</param>
    public IntentDetectionService(
        IOpenAIService openAIService,
        ILogger<IntentDetectionService> logger)
    {
        _openAIService = openAIService;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<IntentDetectionResponse> DetectIntentAsync(
        IntentDetectionRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(request.Message);

        LogIntentDetectionStarted(request.Message.Length);

        var prompt = BuildIntentDetectionPrompt(request);
        var systemPrompt = GetIntentDetectionSystemPrompt(request.DetectBuyingSignals);

        var jsonResponse = await _openAIService.GenerateCompletionAsync(
            prompt,
            systemPrompt,
            maxTokens: 800,
            temperature: 0.2f,
            cancellationToken);

        var result = ParseIntentDetectionResponse(jsonResponse);
        LogIntentDetectionCompleted(result.PrimaryIntent, result.Confidence);

        return result;
    }

    /// <inheritdoc />
    public async Task<ConversationStageResult> ClassifyConversationStageAsync(
        IReadOnlyList<ConversationMessageDto> messages,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(messages);
        if (messages.Count == 0)
        {
            return new ConversationStageResult
            {
                Stage = "initial_contact",
                Confidence = 1.0f,
                Description = "No messages yet",
                ProgressPercentage = 0,
            };
        }

        LogConversationStageClassificationStarted(messages.Count);

        var prompt = BuildConversationStagePrompt(messages);

        var jsonResponse = await _openAIService.GenerateCompletionAsync(
            prompt,
            ConversationStageSystemPrompt,
            maxTokens: 500,
            temperature: 0.2f,
            cancellationToken);

        var result = ParseConversationStageResponse(jsonResponse);
        LogConversationStageClassificationCompleted(result.Stage, result.Confidence);

        return result;
    }

    /// <inheritdoc />
    public async Task<BuyingSignalsResult> DetectBuyingSignalsAsync(
        string message,
        IReadOnlyList<string>? conversationContext = null,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(message);

        LogBuyingSignalsDetectionStarted(message.Length);

        var prompt = BuildBuyingSignalsPrompt(message, conversationContext);

        var jsonResponse = await _openAIService.GenerateCompletionAsync(
            prompt,
            BuyingSignalsSystemPrompt,
            maxTokens: 600,
            temperature: 0.2f,
            cancellationToken);

        var result = ParseBuyingSignalsResponse(jsonResponse);
        LogBuyingSignalsDetectionCompleted(result.HasBuyingSignals, result.BuyingIntentScore);

        return result;
    }

    /// <inheritdoc />
    public async Task<InformationExtractionResult> ExtractInformationAsync(
        string message,
        IReadOnlyList<string>? extractionHints = null,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(message);

        LogInformationExtractionStarted(message.Length);

        var prompt = BuildInformationExtractionPrompt(message, extractionHints);

        var jsonResponse = await _openAIService.GenerateCompletionAsync(
            prompt,
            InformationExtractionSystemPrompt,
            maxTokens: 800,
            temperature: 0.1f,
            cancellationToken);

        var result = ParseInformationExtractionResponse(jsonResponse);
        LogInformationExtractionCompleted(result.Confidence);

        return result;
    }

    private static string BuildIntentDetectionPrompt(IntentDetectionRequest request)
    {
        var contextSection = request.ConversationContext?.Count > 0
            ? $"Previous messages:\n{string.Join("\n", request.ConversationContext)}\n\n"
            : string.Empty;

        var channelContext = !string.IsNullOrEmpty(request.Channel)
            ? $"Channel: {request.Channel}\n"
            : string.Empty;

        return $"{channelContext}{contextSection}Current message to analyze:\n{request.Message}";
    }

    private static string GetIntentDetectionSystemPrompt(bool detectBuyingSignals)
    {
        var buyingSignalsSection = detectBuyingSignals
            ? """
              "buyingSignals": [{"signalType": "string", "strength": "weak|moderate|strong", "evidence": "quote"}],
              """
            : string.Empty;

        return $$"""
            You are an expert intent detection system for B2B lead qualification.
            Analyze the message and classify the intent with high precision.

            INTENT CATEGORIES:
            - inquiry: General questions about products/services
            - purchase_interest: Expressing interest in buying
            - pricing_request: Asking about costs/pricing
            - demo_request: Requesting a demonstration
            - booking_request: Wanting to schedule a meeting/call
            - support_request: Needing help with existing product
            - complaint: Expressing dissatisfaction
            - information_request: Seeking specific information
            - comparison: Comparing with competitors
            - objection: Raising concerns or objections
            - negotiation: Discussing terms/conditions
            - decision_maker_inquiry: Questions about decision process
            - timeline_inquiry: Questions about implementation time
            - feature_request: Asking about specific features
            - integration_inquiry: Questions about integrations
            - other: None of the above

            URGENCY LEVELS:
            - low: No time pressure indicated
            - medium: Some urgency but flexible
            - high: Clear deadline or time pressure
            - critical: Immediate need, urgent response required

            Respond with valid JSON only (no markdown):
            {
                "primaryIntent": "category from above",
                "category": "sales|support|information|booking|other",
                "confidence": 0.0-1.0,
                "secondaryIntents": [{"intent": "string", "confidence": 0.0-1.0}],
                "extractedEntities": {"key": "value"},
                {{buyingSignalsSection}}
                "urgencyLevel": "low|medium|high|critical",
                "suggestedActions": ["action1", "action2"],
                "requiresEscalation": true/false,
                "escalationReason": "reason if escalation needed"
            }
            """;
    }

    private static string BuildConversationStagePrompt(IReadOnlyList<ConversationMessageDto> messages)
    {
        var messageList = messages.Select(m =>
            $"[{m.Role}] ({m.SentAt:yyyy-MM-dd HH:mm}): {m.Content}");
        return $"Conversation history:\n{string.Join("\n", messageList)}";
    }

    private static string BuildBuyingSignalsPrompt(string message, IReadOnlyList<string>? context)
    {
        var contextSection = context?.Count > 0
            ? $"Previous messages:\n{string.Join("\n", context)}\n\n"
            : string.Empty;
        return $"{contextSection}Message to analyze for buying signals:\n{message}";
    }

    private static string BuildInformationExtractionPrompt(
        string message,
        IReadOnlyList<string>? hints)
    {
        var hintsSection = hints?.Count > 0
            ? $"Focus on extracting: {string.Join(", ", hints)}\n\n"
            : string.Empty;
        return $"{hintsSection}Message to extract information from:\n{message}";
    }

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

    private static string GetStringProperty(JsonElement el, string name, string defaultValue)
    {
        return el.TryGetProperty(name, out var prop) ? prop.GetString() ?? defaultValue : defaultValue;
    }

    private static string? GetStringPropertyOrNull(JsonElement el, string name)
    {
        return el.TryGetProperty(name, out var prop) ? prop.GetString() : null;
    }

    private static float GetFloatProperty(JsonElement el, string name, float defaultValue)
    {
        return el.TryGetProperty(name, out var prop) ? prop.GetSingle() : defaultValue;
    }

    private static int GetIntProperty(JsonElement el, string name, int defaultValue)
    {
        return el.TryGetProperty(name, out var prop) ? prop.GetInt32() : defaultValue;
    }

    private static bool GetBoolProperty(JsonElement el, string name, bool defaultValue)
    {
        return el.TryGetProperty(name, out var prop) ? prop.GetBoolean() : defaultValue;
    }

    private static List<string>? ParseStringArray(JsonElement el, string name)
    {
        if (!el.TryGetProperty(name, out var arr) || arr.ValueKind != JsonValueKind.Array)
        {
            return null;
        }

        return arr.EnumerateArray()
            .Select(e => e.GetString())
            .Where(s => !string.IsNullOrEmpty(s))
            .Cast<string>()
            .ToList();
    }

    private static Dictionary<string, string>? ParseEntities(JsonElement el, string name)
    {
        if (!el.TryGetProperty(name, out var obj) || obj.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        return obj.EnumerateObject()
            .ToDictionary(p => p.Name, p => p.Value.GetString() ?? string.Empty, StringComparer.Ordinal);
    }

    private static List<SecondaryIntentDto>? ParseSecondaryIntents(JsonElement root)
    {
        if (!root.TryGetProperty("secondaryIntents", out var arr) || arr.ValueKind != JsonValueKind.Array)
        {
            return null;
        }

        return arr.EnumerateArray()
            .Select(e => new SecondaryIntentDto
            {
                Intent = e.TryGetProperty("intent", out var i) ? i.GetString() ?? string.Empty : string.Empty,
                Confidence = e.TryGetProperty("confidence", out var c) ? c.GetSingle() : 0f,
            })
            .ToList();
    }

    private static List<BuyingSignalDto>? ParseBuyingSignals(JsonElement root)
    {
        var propName = root.TryGetProperty("buyingSignals", out _) ? "buyingSignals" : "signals";
        if (!root.TryGetProperty(propName, out var arr) || arr.ValueKind != JsonValueKind.Array)
        {
            return null;
        }

        return arr.EnumerateArray()
            .Select(e => new BuyingSignalDto
            {
                SignalType = e.TryGetProperty("signalType", out var t) ? t.GetString() ?? string.Empty : string.Empty,
                Strength = e.TryGetProperty("strength", out var s) ? s.GetString() ?? "weak" : "weak",
                Evidence = e.TryGetProperty("evidence", out var ev) ? ev.GetString() : null,
            })
            .ToList();
    }

    private static ContactInfoDto? ParseContactInfo(JsonElement root)
    {
        if (!root.TryGetProperty("contactInfo", out var obj) || obj.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        return new ContactInfoDto
        {
            Name = GetStringPropertyOrNull(obj, "name"),
            Email = GetStringPropertyOrNull(obj, "email"),
            Phone = GetStringPropertyOrNull(obj, "phone"),
            JobTitle = GetStringPropertyOrNull(obj, "jobTitle"),
        };
    }

    private static CompanyInfoDto? ParseCompanyInfo(JsonElement root)
    {
        if (!root.TryGetProperty("companyInfo", out var obj) || obj.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        return new CompanyInfoDto
        {
            Name = GetStringPropertyOrNull(obj, "name"),
            Size = GetStringPropertyOrNull(obj, "size"),
            Industry = GetStringPropertyOrNull(obj, "industry"),
            Location = GetStringPropertyOrNull(obj, "location"),
        };
    }

    private static BudgetInfoDto? ParseBudgetInfo(JsonElement root)
    {
        if (!root.TryGetProperty("budgetInfo", out var obj) || obj.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        return new BudgetInfoDto
        {
            HasBudget = GetBoolProperty(obj, "hasBudget", false),
            Range = GetStringPropertyOrNull(obj, "range"),
            Currency = GetStringPropertyOrNull(obj, "currency"),
            Timeframe = GetStringPropertyOrNull(obj, "timeframe"),
        };
    }

    private static TimelineInfoDto? ParseTimelineInfo(JsonElement root)
    {
        if (!root.TryGetProperty("timelineInfo", out var obj) || obj.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        return new TimelineInfoDto
        {
            Urgency = GetStringPropertyOrNull(obj, "urgency"),
            ExpectedStart = GetStringPropertyOrNull(obj, "expectedStart"),
            Deadline = GetStringPropertyOrNull(obj, "deadline"),
        };
    }

    private IntentDetectionResponse ParseIntentDetectionResponse(string json)
    {
        try
        {
            var cleanJson = CleanJsonResponse(json);
            using var doc = JsonDocument.Parse(cleanJson);
            var root = doc.RootElement;

            return new IntentDetectionResponse
            {
                PrimaryIntent = GetStringProperty(root, "primaryIntent", "unknown"),
                Category = GetStringProperty(root, "category", "other"),
                Confidence = GetFloatProperty(root, "confidence", 0f),
                SecondaryIntents = ParseSecondaryIntents(root),
                ExtractedEntities = ParseEntities(root, "extractedEntities"),
                BuyingSignals = ParseBuyingSignals(root),
                UrgencyLevel = GetStringPropertyOrNull(root, "urgencyLevel"),
                SuggestedActions = ParseStringArray(root, "suggestedActions"),
                RequiresEscalation = GetBoolProperty(root, "requiresEscalation", false),
                EscalationReason = GetStringPropertyOrNull(root, "escalationReason"),
            };
        }
        catch (Exception ex)
        {
            LogIntentParseError(ex, json);
            return new IntentDetectionResponse
            {
                PrimaryIntent = "unknown",
                Category = "other",
                Confidence = 0f,
            };
        }
    }

    private ConversationStageResult ParseConversationStageResponse(string json)
    {
        try
        {
            var cleanJson = CleanJsonResponse(json);
            using var doc = JsonDocument.Parse(cleanJson);
            var root = doc.RootElement;

            return new ConversationStageResult
            {
                Stage = GetStringProperty(root, "stage", "initial_contact"),
                Confidence = GetFloatProperty(root, "confidence", 0f),
                Description = GetStringPropertyOrNull(root, "description"),
                NextExpectedStage = GetStringPropertyOrNull(root, "nextExpectedStage"),
                RecommendedActions = ParseStringArray(root, "recommendedActions"),
                ProgressPercentage = GetIntProperty(root, "progressPercentage", 0),
            };
        }
        catch (Exception ex)
        {
            LogStageParseError(ex, json);
            return new ConversationStageResult
            {
                Stage = "unknown",
                Confidence = 0f,
                ProgressPercentage = 0,
            };
        }
    }

    private BuyingSignalsResult ParseBuyingSignalsResponse(string json)
    {
        try
        {
            var cleanJson = CleanJsonResponse(json);
            using var doc = JsonDocument.Parse(cleanJson);
            var root = doc.RootElement;

            return new BuyingSignalsResult
            {
                HasBuyingSignals = GetBoolProperty(root, "hasBuyingSignals", false),
                BuyingIntentScore = GetIntProperty(root, "buyingIntentScore", 0),
                Signals = ParseBuyingSignals(root) ?? [],
                UrgencyLevel = GetStringPropertyOrNull(root, "urgencyLevel"),
                RecommendedStrategy = GetStringPropertyOrNull(root, "recommendedStrategy"),
            };
        }
        catch (Exception ex)
        {
            LogBuyingSignalsParseError(ex, json);
            return new BuyingSignalsResult
            {
                HasBuyingSignals = false,
                BuyingIntentScore = 0,
                Signals = [],
            };
        }
    }

    private InformationExtractionResult ParseInformationExtractionResponse(string json)
    {
        try
        {
            var cleanJson = CleanJsonResponse(json);
            using var doc = JsonDocument.Parse(cleanJson);
            var root = doc.RootElement;

            return new InformationExtractionResult
            {
                ContactInfo = ParseContactInfo(root),
                CompanyInfo = ParseCompanyInfo(root),
                BudgetInfo = ParseBudgetInfo(root),
                TimelineInfo = ParseTimelineInfo(root),
                PainPoints = ParseStringArray(root, "painPoints"),
                Requirements = ParseStringArray(root, "requirements"),
                CustomEntities = ParseEntities(root, "customEntities"),
                Confidence = GetFloatProperty(root, "confidence", 0f),
            };
        }
        catch (Exception ex)
        {
            LogExtractionParseError(ex, json);
            return new InformationExtractionResult { Confidence = 0f };
        }
    }

    // LoggerMessage source generators
    [LoggerMessage(Level = LogLevel.Debug, Message = "Intent detection started for message of {Length} chars")]
    private partial void LogIntentDetectionStarted(int length);

    [LoggerMessage(Level = LogLevel.Information, Message = "Intent detected: {Intent} with confidence {Confidence}")]
    private partial void LogIntentDetectionCompleted(string intent, float confidence);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Conversation stage classification started for {Count} messages")]
    private partial void LogConversationStageClassificationStarted(int count);

    [LoggerMessage(Level = LogLevel.Information, Message = "Conversation stage: {Stage} with confidence {Confidence}")]
    private partial void LogConversationStageClassificationCompleted(string stage, float confidence);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Buying signals detection started for message of {Length} chars")]
    private partial void LogBuyingSignalsDetectionStarted(int length);

    [LoggerMessage(Level = LogLevel.Information, Message = "Buying signals: {HasSignals}, intent score: {Score}")]
    private partial void LogBuyingSignalsDetectionCompleted(bool hasSignals, int score);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Information extraction started for message of {Length} chars")]
    private partial void LogInformationExtractionStarted(int length);

    [LoggerMessage(Level = LogLevel.Information, Message = "Information extraction completed with confidence {Confidence}")]
    private partial void LogInformationExtractionCompleted(float confidence);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to parse intent response: {Json}")]
    private partial void LogIntentParseError(Exception ex, string json);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to parse stage response: {Json}")]
    private partial void LogStageParseError(Exception ex, string json);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to parse buying signals response: {Json}")]
    private partial void LogBuyingSignalsParseError(Exception ex, string json);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to parse extraction response: {Json}")]
    private partial void LogExtractionParseError(Exception ex, string json);
}

