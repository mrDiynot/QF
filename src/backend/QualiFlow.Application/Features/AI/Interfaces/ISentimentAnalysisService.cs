using QualiFlow.Application.Features.AI.DTOs;

namespace QualiFlow.Application.Features.AI.Interfaces;

/// <summary>
/// Service for analyzing sentiment in customer conversations using GPT-4.
/// Detects emotions, frustration levels, and escalation triggers.
/// </summary>
public interface ISentimentAnalysisService
{
    /// <summary>
    /// Analyzes sentiment of a single message with optional conversation context.
    /// </summary>
    /// <param name="message">The message to analyze.</param>
    /// <param name="conversationContext">Optional previous messages for context.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Sentiment analysis result with emotions and confidence.</returns>
    Task<SentimentAnalysisResponse> AnalyzeMessageSentimentAsync(
        string message,
        IReadOnlyList<string>? conversationContext = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Analyzes sentiment across an entire conversation.
    /// </summary>
    /// <param name="messages">List of conversation messages.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Conversation-level sentiment with per-message breakdown.</returns>
    Task<ConversationSentimentResult> AnalyzeConversationSentimentAsync(
        IReadOnlyList<ConversationMessageDto> messages,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Analyzes sentiment trend over the course of a conversation.
    /// </summary>
    /// <param name="messages">List of conversation messages.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Sentiment trend analysis with trajectory.</returns>
    Task<SentimentTrendResult> AnalyzeSentimentTrendAsync(
        IReadOnlyList<ConversationMessageDto> messages,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Detects customer satisfaction indicators from a message.
    /// </summary>
    /// <param name="message">The message to analyze.</param>
    /// <param name="conversationContext">Optional previous messages for context.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Customer satisfaction proxy scores (CSAT, NPS, CES).</returns>
    Task<CustomerSatisfactionResult> DetectCustomerSatisfactionAsync(
        string message,
        IReadOnlyList<string>? conversationContext = null,
        CancellationToken cancellationToken = default);
}

