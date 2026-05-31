// -----------------------------------------------------------------------
// <copyright file="InformationExtractionService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Diagnostics;
using System.Text.Json;

using Microsoft.Extensions.Logging;

using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.AI.DTOs;
using QualiFlow.Application.Features.AI.Interfaces;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for extracting structured information from conversation messages using AI.
/// </summary>
public sealed partial class InformationExtractionService : IInformationExtractionService
{
    private const string ContactExtractionPrompt = """
        You are an AI assistant that extracts contact information from messages.
        Extract the following if present: name, email, phone, job title.
        
        Return JSON format:
        {
            "name": "extracted name or null",
            "email": "extracted email or null",
            "phone": "extracted phone or null",
            "jobTitle": "extracted job title or null"
        }
        
        Only extract information that is explicitly stated or clearly implied.
        Return null for fields that cannot be determined.
        """;

    private const string CompanyExtractionPrompt = """
        You are an AI assistant that extracts company information from messages.
        Extract the following if present: company name, size, industry, location.
        
        Return JSON format:
        {
            "name": "company name or null",
            "size": "startup/SMB/enterprise or null",
            "industry": "industry/vertical or null",
            "location": "city, state, country or null"
        }
        
        Only extract information that is explicitly stated or clearly implied.
        Return null for fields that cannot be determined.
        """;

    private const string BudgetExtractionPrompt = """
        You are an AI assistant that extracts budget information from messages.
        Extract the following if present: budget amount/range, currency, timeframe.
        
        Return JSON format:
        {
            "hasBudget": true/false,
            "range": "budget amount or range or null",
            "currency": "USD/EUR/etc or null",
            "timeframe": "monthly/annual/project or null"
        }
        
        Set hasBudget to true if any budget information is mentioned.
        Return null for fields that cannot be determined.
        """;

    private const string TimelineExtractionPrompt = """
        You are an AI assistant that extracts timeline information from messages.
        Extract the following if present: urgency, expected start, deadline.
        
        Return JSON format:
        {
            "urgency": "immediate/soon/no_rush or null",
            "expectedStart": "date or timeframe or null",
            "deadline": "date or timeframe or null"
        }
        
        Only extract information that is explicitly stated or clearly implied.
        Return null for fields that cannot be determined.
        """;

    private readonly IOpenAIService _openAIService;
    private readonly ILogger<InformationExtractionService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="InformationExtractionService"/> class.
    /// </summary>
    /// <param name="openAIService">The OpenAI service.</param>
    /// <param name="logger">The logger instance.</param>
    public InformationExtractionService(
        IOpenAIService openAIService,
        ILogger<InformationExtractionService> logger)
    {
        _openAIService = openAIService;
        _logger = logger;
        LogServiceInitialized();
    }

    /// <inheritdoc/>
    public async Task<ContactInfoDto> ExtractContactInfoAsync(
        string message,
        IReadOnlyList<string>? conversationContext = null,
        CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        LogExtractionStarted("Contact");

        try
        {
            var contextPrompt = BuildContextPrompt(conversationContext);
            var fullPrompt = $"{ContactExtractionPrompt}\n\n{contextPrompt}Message to analyze:\n{message}";

            var response = await _openAIService.GenerateCompletionAsync(
                fullPrompt,
                cancellationToken: cancellationToken);
            var result = ParseContactInfoResponse(response);

            stopwatch.Stop();
            LogExtractionCompleted("Contact", stopwatch.ElapsedMilliseconds);

            return result;
        }
        catch (Exception ex)
        {
            LogExtractionError(ex, "Contact");
            return new ContactInfoDto();
        }
    }

    /// <inheritdoc/>
    public async Task<CompanyInfoDto> ExtractCompanyInfoAsync(
        string message,
        IReadOnlyList<string>? conversationContext = null,
        CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        LogExtractionStarted("Company");

        try
        {
            var contextPrompt = BuildContextPrompt(conversationContext);
            var fullPrompt = $"{CompanyExtractionPrompt}\n\n{contextPrompt}Message to analyze:\n{message}";

            var response = await _openAIService.GenerateCompletionAsync(
                fullPrompt,
                cancellationToken: cancellationToken);
            var result = ParseCompanyInfoResponse(response);

            stopwatch.Stop();
            LogExtractionCompleted("Company", stopwatch.ElapsedMilliseconds);

            return result;
        }
        catch (Exception ex)
        {
            LogExtractionError(ex, "Company");
            return new CompanyInfoDto();
        }
    }

    /// <inheritdoc/>
    public async Task<BudgetInfoDto> ExtractBudgetInfoAsync(
        string message,
        IReadOnlyList<string>? conversationContext = null,
        CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        LogExtractionStarted("Budget");

        try
        {
            var contextPrompt = BuildContextPrompt(conversationContext);
            var fullPrompt = $"{BudgetExtractionPrompt}\n\n{contextPrompt}Message to analyze:\n{message}";

            var response = await _openAIService.GenerateCompletionAsync(
                fullPrompt,
                cancellationToken: cancellationToken);
            var result = ParseBudgetInfoResponse(response);

            stopwatch.Stop();
            LogExtractionCompleted("Budget", stopwatch.ElapsedMilliseconds);

            return result;
        }
        catch (Exception ex)
        {
            LogExtractionError(ex, "Budget");
            return new BudgetInfoDto();
        }
    }

    /// <inheritdoc/>
    public async Task<TimelineInfoDto> ExtractTimelineInfoAsync(
        string message,
        IReadOnlyList<string>? conversationContext = null,
        CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        LogExtractionStarted("Timeline");

        try
        {
            var contextPrompt = BuildContextPrompt(conversationContext);
            var fullPrompt = $"{TimelineExtractionPrompt}\n\n{contextPrompt}Message to analyze:\n{message}";

            var response = await _openAIService.GenerateCompletionAsync(
                fullPrompt,
                cancellationToken: cancellationToken);
            var result = ParseTimelineInfoResponse(response);

            stopwatch.Stop();
            LogExtractionCompleted("Timeline", stopwatch.ElapsedMilliseconds);

            return result;
        }
        catch (Exception ex)
        {
            LogExtractionError(ex, "Timeline");
            return new TimelineInfoDto();
        }
    }

    /// <inheritdoc/>
    public async Task<ComprehensiveExtractionResult> ExtractAllInformationAsync(
        IReadOnlyList<ConversationMessageDto> messages,
        IReadOnlyList<string>? extractionHints = null,
        CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        LogExtractionStarted("Comprehensive");

        try
        {
            var prompt = BuildComprehensivePrompt(messages, extractionHints);
            var response = await _openAIService.GenerateCompletionAsync(
                prompt,
                cancellationToken: cancellationToken);
            var result = ParseComprehensiveResponse(response, messages.Count);

            stopwatch.Stop();
            LogExtractionCompleted("Comprehensive", stopwatch.ElapsedMilliseconds);

            return result;
        }
        catch (Exception ex)
        {
            LogExtractionError(ex, "Comprehensive");
            return CreateEmptyComprehensiveResult(messages.Count);
        }
    }

    /// <inheritdoc/>
    public async Task<BantExtractionResult> ExtractBantAsync(
        IReadOnlyList<ConversationMessageDto> messages,
        CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        LogExtractionStarted("BANT");

        try
        {
            var prompt = BuildBantPrompt(messages);
            var response = await _openAIService.GenerateCompletionAsync(
                prompt,
                cancellationToken: cancellationToken);
            var result = ParseBantResponse(response);

            stopwatch.Stop();
            LogExtractionCompleted("BANT", stopwatch.ElapsedMilliseconds);

            return result;
        }
        catch (Exception ex)
        {
            LogExtractionError(ex, "BANT");
            return CreateEmptyBantResult();
        }
    }

    private static string BuildContextPrompt(IReadOnlyList<string>? context)
    {
        if (context == null || context.Count == 0)
        {
            return string.Empty;
        }

        return $"Previous conversation context:\n{string.Join("\n", context)}\n\n";
    }

    private static string BuildComprehensivePrompt(
        IReadOnlyList<ConversationMessageDto> messages,
        IReadOnlyList<string>? hints)
    {
        var messagesText = string.Join("\n", messages.Select((m, i) =>
            $"[{i + 1}] {m.Role}: {m.Content}"));

        var hintsText = hints != null && hints.Count > 0
            ? $"\n\nAdditional extraction hints: {string.Join(", ", hints)}"
            : string.Empty;

        return $$"""
            You are an AI assistant that extracts comprehensive information from conversations.
            Analyze the entire conversation and extract all available information.

            Return JSON format:
            {
                "contactInfo": { "name": "...", "email": "...", "phone": "...", "jobTitle": "..." },
                "companyInfo": { "name": "...", "size": "...", "industry": "...", "location": "..." },
                "budgetInfo": { "hasBudget": true/false, "range": "...", "currency": "...", "timeframe": "..." },
                "timelineInfo": { "urgency": "...", "expectedStart": "...", "deadline": "..." },
                "painPoints": ["pain point 1", "pain point 2"],
                "requirements": ["requirement 1", "requirement 2"],
                "customEntities": { "key": "value" },
                "confidence": 0.0-1.0,
                "summary": "brief summary of extracted information"
            }

            Use null for fields that cannot be determined.
            {{hintsText}}

            Conversation:
            {{messagesText}}
            """;
    }

    private static string BuildBantPrompt(IReadOnlyList<ConversationMessageDto> messages)
    {
        var messagesText = string.Join("\n", messages.Select((m, i) =>
            $"[{i + 1}] {m.Role}: {m.Content}"));

        return $$"""
            You are an AI assistant that extracts BANT qualification information from conversations.
            BANT = Budget, Authority, Need, Timeline

            Score each component 0-100 based on how well it's addressed in the conversation.

            Return JSON format:
            {
                "budgetScore": 0-100,
                "budget": { "hasBudget": true/false, "range": "...", "currency": "...", "timeframe": "..." },
                "authorityScore": 0-100,
                "authority": {
                    "decisionMakerRole": "...",
                    "hasBuyingAuthority": true/false,
                    "stakeholders": ["..."],
                    "approvalProcess": "..."
                },
                "needScore": 0-100,
                "need": {
                    "painPoints": ["..."],
                    "requirements": ["..."],
                    "useCase": "...",
                    "urgency": "...",
                    "isValidated": true/false
                },
                "timelineScore": 0-100,
                "timeline": { "urgency": "...", "expectedStart": "...", "deadline": "..." },
                "completenessPercentage": 0-100,
                "missingComponents": ["Budget", "Authority", etc.],
                "confidence": 0.0-1.0,
                "recommendation": "qualification recommendation"
            }

            Conversation:
            {{messagesText}}
            """;
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

    private static ContactInfoDto ParseContactInfoResponse(string json)
    {
        var cleaned = CleanJsonResponse(json);
        using var doc = JsonDocument.Parse(cleaned);
        var root = doc.RootElement;

        return new ContactInfoDto
        {
            Name = GetStringOrNull(root, "name"),
            Email = GetStringOrNull(root, "email"),
            Phone = GetStringOrNull(root, "phone"),
            JobTitle = GetStringOrNull(root, "jobTitle"),
        };
    }

    private static CompanyInfoDto ParseCompanyInfoResponse(string json)
    {
        var cleaned = CleanJsonResponse(json);
        using var doc = JsonDocument.Parse(cleaned);
        var root = doc.RootElement;

        return new CompanyInfoDto
        {
            Name = GetStringOrNull(root, "name"),
            Size = GetStringOrNull(root, "size"),
            Industry = GetStringOrNull(root, "industry"),
            Location = GetStringOrNull(root, "location"),
        };
    }

    private static BudgetInfoDto ParseBudgetInfoResponse(string json)
    {
        var cleaned = CleanJsonResponse(json);
        using var doc = JsonDocument.Parse(cleaned);
        var root = doc.RootElement;

        return new BudgetInfoDto
        {
            HasBudget = root.TryGetProperty("hasBudget", out var hb) && hb.GetBoolean(),
            Range = GetStringOrNull(root, "range"),
            Currency = GetStringOrNull(root, "currency"),
            Timeframe = GetStringOrNull(root, "timeframe"),
        };
    }

    private static TimelineInfoDto ParseTimelineInfoResponse(string json)
    {
        var cleaned = CleanJsonResponse(json);
        using var doc = JsonDocument.Parse(cleaned);
        var root = doc.RootElement;

        return new TimelineInfoDto
        {
            Urgency = GetStringOrNull(root, "urgency"),
            ExpectedStart = GetStringOrNull(root, "expectedStart"),
            Deadline = GetStringOrNull(root, "deadline"),
        };
    }

    private static ComprehensiveExtractionResult ParseComprehensiveResponse(string json, int messageCount)
    {
        var cleaned = CleanJsonResponse(json);
        using var doc = JsonDocument.Parse(cleaned);
        var root = doc.RootElement;

        return new ComprehensiveExtractionResult
        {
            ContactInfo = ParseNestedContactInfo(root),
            CompanyInfo = ParseNestedCompanyInfo(root),
            BudgetInfo = ParseNestedBudgetInfo(root),
            TimelineInfo = ParseNestedTimelineInfo(root),
            PainPoints = ParseStringArray(root, "painPoints"),
            Requirements = ParseStringArray(root, "requirements"),
            CustomEntities = ParseCustomEntities(root),
            Confidence = root.TryGetProperty("confidence", out var c) ? c.GetDouble() : 0,
            MessagesAnalyzed = messageCount,
            Summary = GetStringOrNull(root, "summary"),
        };
    }

    private static BantExtractionResult ParseBantResponse(string json)
    {
        var cleaned = CleanJsonResponse(json);
        using var doc = JsonDocument.Parse(cleaned);
        var root = doc.RootElement;

        return new BantExtractionResult
        {
            BudgetScore = root.TryGetProperty("budgetScore", out var bs) ? bs.GetInt32() : 0,
            Budget = ParseNestedBudgetInfo(root),
            AuthorityScore = root.TryGetProperty("authorityScore", out var aus) ? aus.GetInt32() : 0,
            Authority = ParseAuthorityInfo(root),
            NeedScore = root.TryGetProperty("needScore", out var ns) ? ns.GetInt32() : 0,
            Need = ParseNeedInfo(root),
            TimelineScore = root.TryGetProperty("timelineScore", out var ts) ? ts.GetInt32() : 0,
            Timeline = ParseNestedTimelineInfo(root),
            CompletenessPercentage = root.TryGetProperty("completenessPercentage", out var cp) ? cp.GetInt32() : 0,
            MissingComponents = ParseStringArray(root, "missingComponents"),
            Confidence = root.TryGetProperty("confidence", out var c) ? c.GetDouble() : 0,
            Recommendation = GetStringOrNull(root, "recommendation"),
        };
    }

    private static ContactInfoDto? ParseNestedContactInfo(JsonElement root)
    {
        if (!root.TryGetProperty("contactInfo", out var ci) || ci.ValueKind == JsonValueKind.Null)
        {
            return null;
        }

        return new ContactInfoDto
        {
            Name = GetStringOrNull(ci, "name"),
            Email = GetStringOrNull(ci, "email"),
            Phone = GetStringOrNull(ci, "phone"),
            JobTitle = GetStringOrNull(ci, "jobTitle"),
        };
    }

    private static CompanyInfoDto? ParseNestedCompanyInfo(JsonElement root)
    {
        if (!root.TryGetProperty("companyInfo", out var ci) || ci.ValueKind == JsonValueKind.Null)
        {
            return null;
        }

        return new CompanyInfoDto
        {
            Name = GetStringOrNull(ci, "name"),
            Size = GetStringOrNull(ci, "size"),
            Industry = GetStringOrNull(ci, "industry"),
            Location = GetStringOrNull(ci, "location"),
        };
    }

    private static BudgetInfoDto? ParseNestedBudgetInfo(JsonElement root)
    {
        if (!root.TryGetProperty("budgetInfo", out var bi) &&
            !root.TryGetProperty("budget", out bi))
        {
            return null;
        }

        if (bi.ValueKind == JsonValueKind.Null)
        {
            return null;
        }

        return new BudgetInfoDto
        {
            HasBudget = bi.TryGetProperty("hasBudget", out var hb) && hb.GetBoolean(),
            Range = GetStringOrNull(bi, "range"),
            Currency = GetStringOrNull(bi, "currency"),
            Timeframe = GetStringOrNull(bi, "timeframe"),
        };
    }

    private static TimelineInfoDto? ParseNestedTimelineInfo(JsonElement root)
    {
        if (!root.TryGetProperty("timelineInfo", out var ti) &&
            !root.TryGetProperty("timeline", out ti))
        {
            return null;
        }

        if (ti.ValueKind == JsonValueKind.Null)
        {
            return null;
        }

        return new TimelineInfoDto
        {
            Urgency = GetStringOrNull(ti, "urgency"),
            ExpectedStart = GetStringOrNull(ti, "expectedStart"),
            Deadline = GetStringOrNull(ti, "deadline"),
        };
    }

    private static AuthorityInfoDto? ParseAuthorityInfo(JsonElement root)
    {
        if (!root.TryGetProperty("authority", out var auth) || auth.ValueKind == JsonValueKind.Null)
        {
            return null;
        }

        return new AuthorityInfoDto
        {
            DecisionMakerRole = GetStringOrNull(auth, "decisionMakerRole"),
            HasBuyingAuthority = auth.TryGetProperty("hasBuyingAuthority", out var hba) && hba.GetBoolean(),
            Stakeholders = ParseStringArray(auth, "stakeholders"),
            ApprovalProcess = GetStringOrNull(auth, "approvalProcess"),
        };
    }

    private static NeedInfoDto? ParseNeedInfo(JsonElement root)
    {
        if (!root.TryGetProperty("need", out var need) || need.ValueKind == JsonValueKind.Null)
        {
            return null;
        }

        return new NeedInfoDto
        {
            PainPoints = ParseStringArray(need, "painPoints"),
            Requirements = ParseStringArray(need, "requirements"),
            UseCase = GetStringOrNull(need, "useCase"),
            Urgency = GetStringOrNull(need, "urgency"),
            IsValidated = need.TryGetProperty("isValidated", out var iv) && iv.GetBoolean(),
        };
    }

    private static string? GetStringOrNull(JsonElement element, string property)
    {
        if (element.TryGetProperty(property, out var prop) && prop.ValueKind == JsonValueKind.String)
        {
            return prop.GetString();
        }

        return null;
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

    private static Dictionary<string, string> ParseCustomEntities(JsonElement root)
    {
        if (!root.TryGetProperty("customEntities", out var ce) || ce.ValueKind != JsonValueKind.Object)
        {
            return [];
        }

        var result = new Dictionary<string, string>(StringComparer.Ordinal);
        foreach (var prop in ce.EnumerateObject())
        {
            if (prop.Value.ValueKind == JsonValueKind.String)
            {
                result[prop.Name] = prop.Value.GetString() ?? string.Empty;
            }
        }

        return result;
    }

    private static ComprehensiveExtractionResult CreateEmptyComprehensiveResult(int messageCount)
    {
        return new ComprehensiveExtractionResult
        {
            Confidence = 0,
            MessagesAnalyzed = messageCount,
        };
    }

    private static BantExtractionResult CreateEmptyBantResult()
    {
        return new BantExtractionResult
        {
            BudgetScore = 0,
            AuthorityScore = 0,
            NeedScore = 0,
            TimelineScore = 0,
            CompletenessPercentage = 0,
            MissingComponents = ["Budget", "Authority", "Need", "Timeline"],
            Confidence = 0,
        };
    }

    // LoggerMessage source generators for high-performance logging
    [LoggerMessage(Level = LogLevel.Information, Message = "Information extraction service initialized")]
    private partial void LogServiceInitialized();

    [LoggerMessage(Level = LogLevel.Debug, Message = "Starting {ExtractionType} extraction")]
    private partial void LogExtractionStarted(string extractionType);

    [LoggerMessage(Level = LogLevel.Information, Message = "{ExtractionType} extraction completed in {Latency}ms")]
    private partial void LogExtractionCompleted(string extractionType, long latency);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to extract {ExtractionType} information")]
    private partial void LogExtractionError(Exception ex, string extractionType);
}

