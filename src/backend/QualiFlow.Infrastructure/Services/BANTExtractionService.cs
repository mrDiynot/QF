// -----------------------------------------------------------------------
// <copyright file="BANTExtractionService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.AI.Interfaces;
using QualiFlow.Application.Features.Scoring.DTOs;
using QualiFlow.Application.Features.Scoring.Interfaces;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// AI-powered BANT extraction service using OpenAI.
/// </summary>
public sealed partial class BantExtractionService : IBantExtractionService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
    };

    private readonly IOpenAIService _openAIService;
    private readonly IMessageRepository _messageRepository;
    private readonly IBusinessKnowledgeBaseRepository _knowledgeBaseRepository;
    private readonly ILogger<BantExtractionService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="BantExtractionService"/> class.
    /// </summary>
    public BantExtractionService(
        IOpenAIService openAIService,
        IMessageRepository messageRepository,
        IBusinessKnowledgeBaseRepository knowledgeBaseRepository,
        ILogger<BantExtractionService> logger)
    {
        _openAIService = openAIService;
        _messageRepository = messageRepository;
        _knowledgeBaseRepository = knowledgeBaseRepository;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<BantExtractionResult> ExtractBantAsync(
        BantExtractionRequest request,
        CancellationToken cancellationToken = default)
    {
        LogExtractingBant(request.LeadId);

        var messages = request.Messages?.ToList() ?? new List<ConversationMessage>();

        // Build the prompt for BANT extraction
        var prompt = BuildBantPrompt(messages, request.BusinessContext, request.IndustryKeywords);

        try
        {
            var response = await _openAIService.GenerateCompletionAsync(
                prompt,
                "You are an expert sales analyst specializing in BANT qualification.",
                2000,
                0.3f,
                cancellationToken);
            var result = ParseBantResponse(response);

            LogBantExtracted(request.LeadId, result.BudgetScore, result.AuthorityScore, result.NeedScore, result.TimelineScore);

            return result;
        }
        catch (Exception ex)
        {
            LogBantExtractionError(request.LeadId, ex.Message);

            // Return conservative default scores on error
            return new BantExtractionResult
            {
                BudgetScore = 30,
                BudgetSignals = Array.Empty<string>(),
                AuthorityScore = 30,
                AuthoritySignals = Array.Empty<string>(),
                NeedScore = 30,
                NeedSignals = Array.Empty<string>(),
                TimelineScore = 30,
                TimelineSignals = Array.Empty<string>(),
                Confidence = 0.3f,
                Reasoning = $"BANT extraction failed: {ex.Message}",
            };
        }
    }

    /// <inheritdoc />
    public async Task<BantExtractionResult> ExtractBantFromConversationAsync(
        Guid businessId,
        Guid conversationId,
        CancellationToken cancellationToken = default)
    {
        LogExtractingBantFromConversation(conversationId);

        // Get messages from the conversation
        var dbMessages = await _messageRepository.GetAllAsync(businessId, conversationId, 0, 100, cancellationToken);

        var messages = dbMessages.Select(m => new ConversationMessage
        {
            Content = m.Content ?? string.Empty,
            IsFromLead = m.Direction == Domain.Enums.MessageDirection.Inbound,
            Timestamp = m.CreatedAt,
        }).ToList();

        // Get business context from knowledge base
        var knowledgeEntries = await _knowledgeBaseRepository.GetForAIContextAsync(businessId, 5, cancellationToken);
        var businessContext = string.Join("\n", knowledgeEntries.Select(e => $"{e.Title}: {e.Content}"));

        var request = new BantExtractionRequest
        {
            LeadId = Guid.Empty, // Not needed for this flow
            BusinessId = businessId,
            ConversationId = conversationId,
            Messages = messages,
            BusinessContext = businessContext,
        };

        return await ExtractBantAsync(request, cancellationToken);
    }

    private static string BuildBantPrompt(
        IReadOnlyList<ConversationMessage> messages,
        string? businessContext,
        IReadOnlyList<string>? industryKeywords)
    {
        var sb = new StringBuilder();

        sb.AppendLine("You are an expert sales analyst. Analyze the following conversation and extract BANT (Budget, Authority, Need, Timeline) signals.");
        sb.AppendLine();
        sb.AppendLine("For each BANT criterion, provide:");
        sb.AppendLine("1. A score from 0-100 (0=no signal, 100=very strong signal)");
        sb.AppendLine("2. Specific signals/quotes from the conversation that support the score");
        sb.AppendLine();

        if (!string.IsNullOrEmpty(businessContext))
        {
            sb.AppendLine("Business Context:");
            sb.AppendLine(businessContext);
            sb.AppendLine();
        }

        if (industryKeywords?.Count > 0)
        {
            sb.AppendLine($"Industry Keywords to look for: {string.Join(", ", industryKeywords)}");
            sb.AppendLine();
        }

        sb.AppendLine("BANT Criteria Definitions:");
        sb.AppendLine("- BUDGET: Does the lead have financial resources? Look for mentions of pricing, budgets, spending limits, cost concerns, or willingness to invest.");
        sb.AppendLine("- AUTHORITY: Is the lead a decision-maker? Look for job titles, approval processes, mentions of consulting others, or direct decision authority.");
        sb.AppendLine("- NEED: Does the lead have a genuine need? Look for pain points, challenges, goals, problems they're trying to solve.");
        sb.AppendLine("- TIMELINE: Is there urgency? Look for deadlines, project timelines, urgency indicators, or specific time frames mentioned.");
        sb.AppendLine();

        sb.AppendLine("Conversation:");
        foreach (var msg in messages.OrderBy(m => m.Timestamp))
        {
            var role = msg.IsFromLead ? "LEAD" : "AGENT";
            sb.AppendLine($"[{role}]: {msg.Content}");
        }

        sb.AppendLine();
        sb.AppendLine("Respond with a JSON object in exactly this format:");
        sb.AppendLine(@"{
  ""budgetScore"": <0-100>,
  ""budgetSignals"": [""signal1"", ""signal2""],
  ""authorityScore"": <0-100>,
  ""authoritySignals"": [""signal1"", ""signal2""],
  ""needScore"": <0-100>,
  ""needSignals"": [""signal1"", ""signal2""],
  ""timelineScore"": <0-100>,
  ""timelineSignals"": [""signal1"", ""signal2""],
  ""confidence"": <0.0-1.0>,
  ""reasoning"": ""<brief explanation>""
}");

        return sb.ToString();
    }

    private static BantExtractionResult ParseBantResponse(string response)
    {
        try
        {
            // Try to extract JSON from the response
            var jsonStart = response.IndexOf('{', StringComparison.Ordinal);
            var jsonEnd = response.LastIndexOf('}');

            if (jsonStart >= 0 && jsonEnd > jsonStart)
            {
                var jsonString = response.Substring(jsonStart, jsonEnd - jsonStart + 1);
                var parsed = JsonSerializer.Deserialize<BantExtractionResult>(jsonString, JsonOptions);

                if (parsed != null)
                {
                    return parsed;
                }
            }
        }
        catch
        {
            // Fall through to default
        }

        // Return default if parsing fails
        return new BantExtractionResult
        {
            BudgetScore = 50,
            BudgetSignals = Array.Empty<string>(),
            AuthorityScore = 50,
            AuthoritySignals = Array.Empty<string>(),
            NeedScore = 50,
            NeedSignals = Array.Empty<string>(),
            TimelineScore = 50,
            TimelineSignals = Array.Empty<string>(),
            Confidence = 0.5f,
            Reasoning = "Could not parse AI response, using default scores",
        };
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Extracting BANT signals for lead {LeadId}")]
    private partial void LogExtractingBant(Guid leadId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Extracting BANT signals from conversation {ConversationId}")]
    private partial void LogExtractingBantFromConversation(Guid conversationId);

    [LoggerMessage(Level = LogLevel.Information, Message = "BANT extracted for lead {LeadId}: B={Budget}, A={Authority}, N={Need}, T={Timeline}")]
    private partial void LogBantExtracted(Guid leadId, int budget, int authority, int need, int timeline);

    [LoggerMessage(Level = LogLevel.Warning, Message = "BANT extraction failed for lead {LeadId}: {Error}")]
    private partial void LogBantExtractionError(Guid leadId, string error);
}
