// -----------------------------------------------------------------------
// <copyright file="AICrmEnrichmentService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Diagnostics;
using System.Text.Json;

using Microsoft.Extensions.Logging;

using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.AI.DTOs;
using QualiFlow.Application.Features.AI.Interfaces;
using QualiFlow.Application.Interfaces;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.AI.Services;

/// <summary>
/// AI-powered CRM data enrichment service that extracts structured information
/// from conversations and suggests field updates for contacts, companies, and deals.
/// </summary>
public sealed partial class AICrmEnrichmentService(
    IOpenAIService openAIService,
    IAIModelSelector modelSelector,
    IAIGenerationAuditService auditService,
    IUsageLimitService usageLimitService,
    IExternalUsageTrackingService usageTrackingService,
    IMessageRepository messageRepository,
    ILeadRepository leadRepository,
    ILogger<AICrmEnrichmentService> logger) : IAICrmEnrichmentService
{
    private const string SystemPrompt = """
        You are an expert CRM data analyst. Analyze the conversation and extract structured information
        to enrich CRM records. Focus on extracting:
        
        CONTACT INFORMATION:
        - Full name, first name, last name
        - Job title / role
        - Email address
        - Phone number
        - Department
        
        COMPANY INFORMATION:
        - Company name
        - Industry / sector
        - Company size (employees)
        - Location / headquarters
        - Website / domain
        
        DEAL SIGNALS:
        - Budget range or amount
        - Decision timeline
        - Pain points / needs
        - Competitors mentioned
        - Current solution
        
        For each extracted field, provide:
        1. The exact value extracted
        2. A confidence score (0.0-1.0)
        3. The source quote from the conversation
        4. Brief reasoning
        
        Return JSON in this exact format:
        {
          "contactFields": [
            { "fieldName": "jobTitle", "value": "VP of Marketing", "confidence": 0.95, "sourceQuote": "I'm the VP of Marketing here", "reasoning": "Direct statement from contact" }
          ],
          "companyFields": [
            { "fieldName": "companyName", "value": "Acme Corp", "confidence": 0.9, "sourceQuote": "at Acme Corp", "reasoning": "Company mentioned in context" }
          ],
          "dealFields": [
            { "fieldName": "budgetRange", "value": "$50,000-$100,000", "confidence": 0.8, "sourceQuote": "budget around 50 to 100K", "reasoning": "Budget range mentioned" }
          ],
          "bantScores": {
            "budget": { "score": 75, "signals": ["Budget of $50-100K mentioned"] },
            "authority": { "score": 90, "signals": ["VP-level decision maker"] },
            "need": { "score": 85, "signals": ["Clear pain point: manual processes"] },
            "timeline": { "score": 60, "signals": ["Q2 evaluation period"] }
          }
        }
        """;

    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    /// <inheritdoc />
    public async Task<CrmEnrichmentResult> EnrichFromConversationAsync(
        CrmEnrichmentRequest request,
        CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        LogEnrichmentStarted(request.BusinessId, request.ConversationId);

        try
        {
            // Step 1: Check usage limits
            var canUse = await usageLimitService.CanUseAiInteractionAsync(
                request.BusinessId,
                cancellationToken);

            if (!canUse)
            {
                LogUsageLimitExceeded(request.BusinessId);
                return CrmEnrichmentResult.Failed("AI CRM enrichment limit exceeded for this billing period.", true);
            }

            // Step 2: Get conversation messages
            var messages = await messageRepository.GetAllAsync(
                request.BusinessId,
                request.ConversationId,
                skip: 0,
                take: 100,
                cancellationToken);

            if (!messages.Any())
            {
                return CrmEnrichmentResult.Failed("No messages found in conversation.");
            }

            // Step 3: Build the conversation transcript for AI analysis
            var transcript = BuildConversationTranscript(messages);

            // Step 4: Select appropriate AI model
            var modelSelection = modelSelector.SelectModel(AITaskType.CrmEnrichment);

            // Step 5: Generate enrichment suggestions via AI
            var userPrompt = $"Analyze this conversation and extract CRM data:\n\n{transcript}";

            var aiResponse = await openAIService.GenerateCompletionAsync(
                userPrompt,
                SystemPrompt,
                maxTokens: modelSelection.MaxTokens,
                temperature: 0.2f,
                cancellationToken);

            // Step 6: Parse the AI response
            var result = ParseEnrichmentResponse(aiResponse, request.ConversationId);

            // Step 7: Log audit and track usage
            var auditId = await LogAuditAsync(request, transcript, aiResponse, modelSelection, cancellationToken);
            await TrackUsageAsync(request.BusinessId, modelSelection, transcript, aiResponse, cancellationToken);

            stopwatch.Stop();
            LogEnrichmentCompleted(request.ConversationId, stopwatch.ElapsedMilliseconds);

            return result with
            {
                AuditId = auditId,
                TokensUsed = EstimateTokens(transcript, aiResponse),
            };
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            LogEnrichmentError(request.ConversationId, ex.Message);
            return CrmEnrichmentResult.Failed($"Enrichment failed: {ex.Message}");
        }
    }

    /// <inheritdoc />
    public async Task<bool> ApplyEnrichmentAsync(
        Guid businessId,
        Guid? leadId,
        Guid? contactId,
        Guid? dealId,
        IReadOnlyList<CrmFieldSuggestion> acceptedSuggestions,
        CancellationToken cancellationToken = default)
    {
        LogApplyingEnrichment(businessId, leadId, contactId, dealId, acceptedSuggestions.Count);

        try
        {
            // Apply lead enrichment if lead ID provided
            if (leadId.HasValue)
            {
                var lead = await leadRepository.GetByIdAsync(leadId.Value, cancellationToken);
                if (lead != null && lead.BusinessId == businessId)
                {
                    ApplyLeadSuggestions(lead, acceptedSuggestions);
                    await leadRepository.UpdateAsync(lead, cancellationToken);
                }
            }

            // Note: Contact and Deal updates would follow similar pattern
            // but require IContactRepository and IDealRepository to be injected

            LogEnrichmentApplied(businessId, acceptedSuggestions.Count);
            return true;
        }
        catch (Exception ex)
        {
            LogApplyEnrichmentError(businessId, ex.Message);
            return false;
        }
    }

    // ========================================
    // Private Helper Methods
    // ========================================

    private static string BuildConversationTranscript(IEnumerable<Domain.Entities.Message> messages)
    {
        var lines = messages
            .OrderBy(m => m.CreatedAt)
            .Select(m =>
            {
                var sender = m.Direction == MessageDirection.Inbound ? "Customer" : "Agent";
                return $"[{sender}]: {m.Content}";
            });

        return string.Join("\n", lines);
    }

    private static CrmEnrichmentResult ParseEnrichmentResponse(string aiResponse, Guid conversationId)
    {
        try
        {
            var jsonStart = aiResponse.IndexOf('{', StringComparison.Ordinal);
            var jsonEnd = aiResponse.LastIndexOf('}');

            if (jsonStart < 0 || jsonEnd < 0)
            {
                return CrmEnrichmentResult.Failed("Invalid AI response format.");
            }

            var jsonContent = aiResponse[jsonStart..(jsonEnd + 1)];
            var parsed = JsonSerializer.Deserialize<ParsedEnrichmentResponse>(jsonContent, JsonOptions);

            if (parsed == null)
            {
                return CrmEnrichmentResult.Failed("Failed to parse enrichment response.");
            }

            return new CrmEnrichmentResult
            {
                Success = true,
                ConversationId = conversationId,
                ContactSuggestions = ParseFieldSuggestions(parsed.ContactFields),
                CompanySuggestions = ParseFieldSuggestions(parsed.CompanyFields),
                DealSuggestions = ParseFieldSuggestions(parsed.DealFields),
                BantScores = ParseBantScores(parsed.BantScores),
            };
        }
        catch (JsonException)
        {
            return CrmEnrichmentResult.Failed("Failed to parse enrichment structure.");
        }
    }

    private static List<CrmFieldSuggestion> ParseFieldSuggestions(IEnumerable<ParsedFieldSuggestion>? fields)
    {
        if (fields == null)
        {
            return [];
        }

        return fields
            .Where(f => !string.IsNullOrEmpty(f.FieldName) && !string.IsNullOrEmpty(f.Value))
            .Select(f => new CrmFieldSuggestion
            {
                FieldName = f.FieldName!,
                SuggestedValue = f.Value!,
                Confidence = f.Confidence,
                SourceQuote = f.SourceQuote,
                Reasoning = f.Reasoning,
            })
            .ToList();
    }

    private static BantScores? ParseBantScores(ParsedBantScores? scores)
    {
        if (scores == null)
        {
            return null;
        }

        return new BantScores
        {
            BudgetScore = scores.Budget?.Score ?? 0,
            BudgetSignals = scores.Budget?.Signals ?? [],
            AuthorityScore = scores.Authority?.Score ?? 0,
            AuthoritySignals = scores.Authority?.Signals ?? [],
            NeedScore = scores.Need?.Score ?? 0,
            NeedSignals = scores.Need?.Signals ?? [],
            TimelineScore = scores.Timeline?.Score ?? 0,
            TimelineSignals = scores.Timeline?.Signals ?? [],
            Confidence = 0.8,
        };
    }

    private static void ApplyLeadSuggestions(Domain.Entities.Lead lead, IReadOnlyList<CrmFieldSuggestion> suggestions)
    {
        foreach (var suggestion in suggestions)
        {
            switch (suggestion.FieldName.ToLowerInvariant())
            {
                case "name":
                case "fullname":
                    lead.Name = suggestion.SuggestedValue;
                    break;
                case "email":
                    lead.Email = suggestion.SuggestedValue;
                    break;
                case "phone":
                    lead.Phone = suggestion.SuggestedValue;
                    break;
            }
        }
    }

    private async Task<Guid> LogAuditAsync(
        CrmEnrichmentRequest request,
        string input,
        string output,
        AIModelSelection modelSelection,
        CancellationToken cancellationToken)
    {
        var inputTokens = EstimateTokens(input);
        var outputTokens = EstimateTokens(output);
        var estimatedCost = ((inputTokens * modelSelection.EstimatedInputCostPer1K) +
                             (outputTokens * modelSelection.EstimatedOutputCostPer1K)) / 1000m;

        var auditRequest = new LogAIGenerationRequest
        {
            BusinessId = request.BusinessId,
            TaskType = AITaskType.CrmEnrichment,
            InputPrompt = input.Length > 2000 ? input[..2000] : input,
            OutputJson = output.Length > 5000 ? output[..5000] : output,
            ModelUsed = modelSelection.Model,
            InputTokens = inputTokens,
            OutputTokens = outputTokens,
            DurationMs = 0,
            EstimatedCostUsd = estimatedCost,
        };

        var response = await auditService.LogAIGenerationAsync(auditRequest, cancellationToken);
        return response.AuditId;
    }

    private async Task TrackUsageAsync(
        Guid businessId,
        AIModelSelection modelSelection,
        string input,
        string output,
        CancellationToken cancellationToken)
    {
        var inputTokens = EstimateTokens(input);
        var outputTokens = EstimateTokens(output);

        await usageTrackingService.TrackOpenAIUsageAsync(
            businessId,
            inputTokens,
            outputTokens,
            modelSelection.Model,
            "crm_enrichment",
            cancellationToken: cancellationToken);
    }

    private static int EstimateTokens(string text) => text.Length / 4;

    private static int EstimateTokens(string input, string output) => EstimateTokens(input) + EstimateTokens(output);

    // ========================================
    // Logging Methods
    // ========================================

    [LoggerMessage(Level = LogLevel.Information, Message = "Starting CRM enrichment for business {BusinessId}, conversation: {ConversationId}")]
    private partial void LogEnrichmentStarted(Guid businessId, Guid conversationId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Usage limit exceeded for CRM enrichment, business: {BusinessId}")]
    private partial void LogUsageLimitExceeded(Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "CRM enrichment completed for conversation {ConversationId} in {DurationMs}ms")]
    private partial void LogEnrichmentCompleted(Guid conversationId, long durationMs);

    [LoggerMessage(Level = LogLevel.Error, Message = "CRM enrichment failed for conversation {ConversationId}: {ErrorMessage}")]
    private partial void LogEnrichmentError(Guid conversationId, string errorMessage);

    [LoggerMessage(Level = LogLevel.Information, Message = "Applying enrichment for business {BusinessId}, lead: {LeadId}, contact: {ContactId}, deal: {DealId}, suggestions: {SuggestionCount}")]
    private partial void LogApplyingEnrichment(Guid businessId, Guid? leadId, Guid? contactId, Guid? dealId, int suggestionCount);

    [LoggerMessage(Level = LogLevel.Information, Message = "Enrichment applied for business {BusinessId}, {AppliedCount} suggestions")]
    private partial void LogEnrichmentApplied(Guid businessId, int appliedCount);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to apply enrichment for business {BusinessId}: {ErrorMessage}")]
    private partial void LogApplyEnrichmentError(Guid businessId, string errorMessage);
}

// ========================================
// Internal DTOs for JSON Parsing
// ========================================

#pragma warning disable CA1812 // Internal types are instantiated via JSON deserialization

internal sealed record ParsedEnrichmentResponse
{
    public List<ParsedFieldSuggestion>? ContactFields { get; init; }
    public List<ParsedFieldSuggestion>? CompanyFields { get; init; }
    public List<ParsedFieldSuggestion>? DealFields { get; init; }
    public ParsedBantScores? BantScores { get; init; }
}

internal sealed record ParsedFieldSuggestion
{
    public string? FieldName { get; init; }
    public string? Value { get; init; }
    public double Confidence { get; init; }
    public string? SourceQuote { get; init; }
    public string? Reasoning { get; init; }
}

internal sealed record ParsedBantScores
{
    public ParsedBantScore? Budget { get; init; }
    public ParsedBantScore? Authority { get; init; }
    public ParsedBantScore? Need { get; init; }
    public ParsedBantScore? Timeline { get; init; }
}

internal sealed record ParsedBantScore
{
    public int Score { get; init; }
    public List<string>? Signals { get; init; }
}

#pragma warning restore CA1812

