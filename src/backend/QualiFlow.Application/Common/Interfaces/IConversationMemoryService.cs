// -----------------------------------------------------------------------
// <copyright file="IConversationMemoryService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Service interface for conversation memory management.
/// </summary>
public interface IConversationMemoryService
{
    /// <summary>
    /// Generates a summary of a conversation session.
    /// </summary>
    /// <param name="sessionId">The chat session ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The conversation summary.</returns>
    Task<string> GenerateSummaryAsync(Guid sessionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Extracts key points from a conversation session.
    /// </summary>
    /// <param name="sessionId">The chat session ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of key points.</returns>
    Task<IEnumerable<string>> ExtractKeyPointsAsync(Guid sessionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Stores a conversation memory with embeddings.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="sessionId">The chat session ID.</param>
    /// <param name="leadId">Optional lead ID.</param>
    /// <param name="summary">The conversation summary.</param>
    /// <param name="keyPoints">Key points extracted.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the created memory.</returns>
    Task<Guid> StoreMemoryAsync(
        Guid businessId,
        Guid sessionId,
        Guid? leadId,
        string summary,
        IEnumerable<string> keyPoints,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Recalls relevant context from past conversations.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="leadId">Optional lead ID.</param>
    /// <param name="currentMessage">The current user message.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Relevant context from past conversations.</returns>
    Task<string> RecallRelevantContextAsync(
        Guid businessId,
        Guid? leadId,
        string currentMessage,
        CancellationToken cancellationToken = default);
}
