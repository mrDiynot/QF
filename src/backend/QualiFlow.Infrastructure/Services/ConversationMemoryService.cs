// -----------------------------------------------------------------------
// <copyright file="ConversationMemoryService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Pgvector;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service implementation for conversation memory management.
/// </summary>
public sealed partial class ConversationMemoryService : IConversationMemoryService
{
    private const int MinMessagesForSummary = 10;
    private const int MaxContextMessages = 5;

    private readonly IConversationMemoryRepository _memoryRepository;
    private readonly IChatSessionRepository _sessionRepository;
    private readonly IOpenAIService _openAIService;
    private readonly ILogger<ConversationMemoryService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="ConversationMemoryService"/> class.
    /// </summary>
    /// <param name="memoryRepository">The memory repository.</param>
    /// <param name="sessionRepository">The session repository.</param>
    /// <param name="openAIService">The OpenAI service.</param>
    /// <param name="logger">The logger.</param>
    public ConversationMemoryService(
        IConversationMemoryRepository memoryRepository,
        IChatSessionRepository sessionRepository,
        IOpenAIService openAIService,
        ILogger<ConversationMemoryService> logger)
    {
        _memoryRepository = memoryRepository;
        _sessionRepository = sessionRepository;
        _openAIService = openAIService;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<string> GenerateSummaryAsync(Guid sessionId, CancellationToken cancellationToken = default)
    {
        LogGeneratingSummary(sessionId);

        var session = await _sessionRepository.GetWithMessagesAsync(Guid.Empty, sessionId, cancellationToken: cancellationToken);
        if (session == null)
        {
            LogSessionNotFound(sessionId);
            return string.Empty;
        }

        var messageList = session.Messages.ToList();

        if (messageList.Count < MinMessagesForSummary)
        {
            LogInsufficientMessages(sessionId, messageList.Count);
            return string.Empty;
        }

        var conversationText = BuildConversationText(messageList);
        var prompt = $@"Summarize the following conversation in 2-3 sentences, focusing on the main topics discussed and any important information shared:

{conversationText}

Summary:";

        var summary = await _openAIService.GenerateCompletionAsync(
            prompt,
            "You are a helpful assistant that summarizes conversations concisely.",
            maxTokens: 150,
            cancellationToken: cancellationToken);

        LogSummaryGenerated(sessionId, summary.Length);

        return summary;
    }

    /// <inheritdoc />
    public async Task<IEnumerable<string>> ExtractKeyPointsAsync(Guid sessionId, CancellationToken cancellationToken = default)
    {
        LogExtractingKeyPoints(sessionId);

        var session = await _sessionRepository.GetWithMessagesAsync(Guid.Empty, sessionId, cancellationToken: cancellationToken);
        if (session == null)
        {
            LogSessionNotFound(sessionId);
            return Array.Empty<string>();
        }

        var messageList = session.Messages.ToList();

        if (messageList.Count < MinMessagesForSummary)
        {
            LogInsufficientMessages(sessionId, messageList.Count);
            return Array.Empty<string>();
        }

        var conversationText = BuildConversationText(messageList);
        var prompt = $@"Extract 3-5 key points from the following conversation. Focus on:
- Important facts shared by the visitor
- Main questions or concerns
- Action items or next steps
- Any contact information or preferences

{conversationText}

Return the key points as a JSON array of strings. Example: [""Point 1"", ""Point 2"", ""Point 3""]

Key Points:";

        var response = await _openAIService.GenerateCompletionAsync(
            prompt,
            "You are a helpful assistant that extracts key information from conversations.",
            maxTokens: 200,
            cancellationToken: cancellationToken);

        try
        {
            var keyPoints = JsonSerializer.Deserialize<List<string>>(response) ?? new List<string>();
            LogKeyPointsExtracted(sessionId, keyPoints.Count);
            return keyPoints;
        }
        catch (JsonException ex)
        {
            LogKeyPointsExtractionFailed(ex, sessionId);
            return Array.Empty<string>();
        }
    }

    /// <inheritdoc />
    public async Task<Guid> StoreMemoryAsync(
        Guid businessId,
        Guid sessionId,
        Guid? leadId,
        string summary,
        IEnumerable<string> keyPoints,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(summary);

        LogStoringMemory(businessId, sessionId);

        // Generate embedding for the summary
        var summaryEmbedding = await _openAIService.GenerateEmbeddingAsync(summary, cancellationToken);
        var vector = new Vector(summaryEmbedding);

        // Calculate importance score based on key points and summary length
        var importanceScore = CalculateImportanceScore(summary, keyPoints);

        var memory = new ConversationMemory
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            SessionId = sessionId,
            LeadId = leadId,
            Summary = summary,
            Embedding = vector,
            ImportanceScore = importanceScore,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        foreach (var keyPoint in keyPoints)
        {
            memory.KeyPoints.Add(keyPoint);
        }

        await _memoryRepository.AddAsync(memory, cancellationToken);

        LogMemoryStored(businessId, memory.Id);

        return memory.Id;
    }

    /// <inheritdoc />
    public async Task<string> RecallRelevantContextAsync(
        Guid businessId,
        Guid? leadId,
        string currentMessage,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(currentMessage);

        LogRecallingContext(businessId, leadId);

        // Generate embedding for current message
        var messageEmbedding = await _openAIService.GenerateEmbeddingAsync(currentMessage, cancellationToken);
        var vector = new Vector(messageEmbedding);

        // Search for similar past conversations
        var similarMemories = await _memoryRepository.SearchSimilarAsync(
            businessId,
            vector,
            limit: MaxContextMessages,
            cancellationToken);

        var memories = similarMemories.ToList();
        if (memories.Count == 0)
        {
            LogNoContextFound(businessId);
            return string.Empty;
        }

        // Build context from relevant memories
        var contextBuilder = new StringBuilder();
        contextBuilder.AppendLine("Relevant context from past conversations:");

        foreach (var (memory, similarity) in memories.Where(m => m.similarity > 0.7f))
        {
            contextBuilder.AppendLine($"\n- {memory.Summary}");
            if (memory.KeyPoints.Count > 0)
            {
                contextBuilder.AppendLine($"  Key points: {string.Join(", ", memory.KeyPoints)}");
            }
        }

        var context = contextBuilder.ToString();
        LogContextRecalled(businessId, memories.Count);

        return context;
    }

    private static string BuildConversationText(IEnumerable<ChatMessage> messages)
    {
        var builder = new StringBuilder();
        foreach (var message in messages)
        {
            var role = message.Type.ToString();
            builder.AppendLine($"{role}: {message.Content}");
        }

        return builder.ToString();
    }

    private static float CalculateImportanceScore(string summary, IEnumerable<string> keyPoints)
    {
        var keyPointsList = keyPoints.ToList();
        var baseScore = 0.5f;

        // Increase score based on number of key points
        var keyPointBonus = Math.Min(keyPointsList.Count * 0.1f, 0.3f);

        // Increase score based on summary length (longer = more detailed)
        var lengthBonus = Math.Min(summary.Length / 1000.0f * 0.2f, 0.2f);

        return Math.Min(baseScore + keyPointBonus + lengthBonus, 1.0f);
    }

    // LoggerMessage source generators for high-performance logging
    [LoggerMessage(Level = LogLevel.Information, Message = "Generating summary for session {SessionId}")]
    private partial void LogGeneratingSummary(Guid sessionId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Insufficient messages ({MessageCount}) for session {SessionId}, minimum required: {MinMessages}")]
    private partial void LogInsufficientMessages(Guid sessionId, int messageCount, int minMessages = MinMessagesForSummary);

    [LoggerMessage(Level = LogLevel.Information, Message = "Summary generated for session {SessionId}, length: {Length}")]
    private partial void LogSummaryGenerated(Guid sessionId, int length);

    [LoggerMessage(Level = LogLevel.Information, Message = "Extracting key points for session {SessionId}")]
    private partial void LogExtractingKeyPoints(Guid sessionId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Key points extracted for session {SessionId}, count: {Count}")]
    private partial void LogKeyPointsExtracted(Guid sessionId, int count);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to extract key points for session {SessionId}")]
    private partial void LogKeyPointsExtractionFailed(Exception ex, Guid sessionId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Storing memory for business {BusinessId}, session {SessionId}")]
    private partial void LogStoringMemory(Guid businessId, Guid sessionId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Memory stored for business {BusinessId}, ID: {MemoryId}")]
    private partial void LogMemoryStored(Guid businessId, Guid memoryId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Recalling context for business {BusinessId}, lead {LeadId}")]
    private partial void LogRecallingContext(Guid businessId, Guid? leadId);

    [LoggerMessage(Level = LogLevel.Information, Message = "No relevant context found for business {BusinessId}")]
    private partial void LogNoContextFound(Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Context recalled for business {BusinessId}, memories: {Count}")]
    private partial void LogContextRecalled(Guid businessId, int count);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Session {SessionId} not found")]
    private partial void LogSessionNotFound(Guid sessionId);
}
