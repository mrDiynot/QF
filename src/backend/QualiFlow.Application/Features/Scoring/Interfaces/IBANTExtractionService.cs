// -----------------------------------------------------------------------
// <copyright file="IBANTExtractionService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Features.Scoring.DTOs;

namespace QualiFlow.Application.Features.Scoring.Interfaces;

/// <summary>
/// Service for AI-powered BANT extraction from conversations.
/// </summary>
public interface IBantExtractionService
{
    /// <summary>
    /// Extracts BANT signals from conversation messages using AI.
    /// </summary>
    /// <param name="request">The extraction request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The BANT extraction result.</returns>
    Task<BantExtractionResult> ExtractBantAsync(
        BantExtractionRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Extracts BANT signals from a specific conversation by ID.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The BANT extraction result.</returns>
    Task<BantExtractionResult> ExtractBantFromConversationAsync(
        Guid businessId,
        Guid conversationId,
        CancellationToken cancellationToken = default);
}
