// -----------------------------------------------------------------------
// <copyright file="IOpenAIService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Common.Models;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Service interface for OpenAI GPT-4 API integration.
/// Provides methods for lead qualification, intent detection, and sentiment analysis.
/// </summary>
public interface IOpenAIService
{
    /// <summary>
    /// Generates a text completion using GPT-4.
    /// </summary>
    /// <param name="prompt">The prompt to send to GPT-4.</param>
    /// <param name="systemMessage">Optional system message for context.</param>
    /// <param name="maxTokens">Maximum tokens in the response (default: 1000).</param>
    /// <param name="temperature">Creativity level 0-1 (default: 0.7).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The generated text completion.</returns>
    Task<string> GenerateCompletionAsync(
        string prompt,
        string? systemMessage = null,
        int maxTokens = 1000,
        float temperature = 0.7f,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates a conversational chat completion using GPT-4 with full message history.
    /// </summary>
    /// <param name="messagesJson">JSON array of chat messages with role and content.</param>
    /// <param name="maxTokens">Maximum tokens in the response (default: 500).</param>
    /// <param name="temperature">Creativity level 0-1 (default: 0.8).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The generated chat response.</returns>
    Task<string> GenerateChatCompletionAsync(
        string messagesJson,
        int maxTokens = 500,
        float temperature = 0.8f,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Qualifies a lead based on conversation history and scoring criteria.
    /// </summary>
    /// <param name="request">The lead qualification request containing lead info and conversation.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Lead qualification result with score and reasoning.</returns>
    Task<LeadQualificationResult> QualifyLeadAsync(
        LeadQualificationRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Detects the intent of a message.
    /// </summary>
    /// <param name="message">The message to analyze.</param>
    /// <param name="conversationContext">Optional previous messages for context.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Detected intent with confidence score.</returns>
    Task<IntentDetectionResult> DetectIntentAsync(
        string message,
        IEnumerable<string>? conversationContext = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Analyzes the sentiment of a message.
    /// </summary>
    /// <param name="message">The message to analyze.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Sentiment analysis result.</returns>
    Task<SentimentAnalysisResult> AnalyzeSentimentAsync(
        string message,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates a vector embedding for semantic similarity search.
    /// </summary>
    /// <param name="text">The text to generate an embedding for.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Vector embedding as float array (1536 dimensions for ada-002).</returns>
    Task<float[]> GenerateEmbeddingAsync(
        string text,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates a streaming text completion using GPT-4.
    /// Yields tokens as they are generated for real-time display.
    /// </summary>
    /// <param name="prompt">The prompt to send to GPT-4.</param>
    /// <param name="systemMessage">Optional system message for context.</param>
    /// <param name="maxTokens">Maximum tokens in the response (default: 300).</param>
    /// <param name="temperature">Creativity level 0-1 (default: 0.7).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>An async enumerable of token strings.</returns>
    IAsyncEnumerable<string> GenerateCompletionStreamAsync(
        string prompt,
        string? systemMessage = null,
        int maxTokens = 300,
        float temperature = 0.7f,
        CancellationToken cancellationToken = default);
}
