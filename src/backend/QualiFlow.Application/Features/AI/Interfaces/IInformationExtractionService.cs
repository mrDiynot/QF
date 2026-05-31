// -----------------------------------------------------------------------
// <copyright file="IInformationExtractionService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Features.AI.DTOs;

namespace QualiFlow.Application.Features.AI.Interfaces;

/// <summary>
/// Service for extracting structured information from conversation messages.
/// </summary>
public interface IInformationExtractionService
{
    /// <summary>
    /// Extracts contact information (name, email, phone, job title) from a message.
    /// </summary>
    /// <param name="message">The message to extract from.</param>
    /// <param name="conversationContext">Optional previous messages for context.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Extracted contact information.</returns>
    Task<ContactInfoDto> ExtractContactInfoAsync(
        string message,
        IReadOnlyList<string>? conversationContext = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Extracts company information (name, size, industry, location) from a message.
    /// </summary>
    /// <param name="message">The message to extract from.</param>
    /// <param name="conversationContext">Optional previous messages for context.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Extracted company information.</returns>
    Task<CompanyInfoDto> ExtractCompanyInfoAsync(
        string message,
        IReadOnlyList<string>? conversationContext = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Extracts budget information (amount, currency, timeframe) from a message.
    /// </summary>
    /// <param name="message">The message to extract from.</param>
    /// <param name="conversationContext">Optional previous messages for context.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Extracted budget information.</returns>
    Task<BudgetInfoDto> ExtractBudgetInfoAsync(
        string message,
        IReadOnlyList<string>? conversationContext = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Extracts timeline information (urgency, start date, deadline) from a message.
    /// </summary>
    /// <param name="message">The message to extract from.</param>
    /// <param name="conversationContext">Optional previous messages for context.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Extracted timeline information.</returns>
    Task<TimelineInfoDto> ExtractTimelineInfoAsync(
        string message,
        IReadOnlyList<string>? conversationContext = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Extracts all information categories from a conversation.
    /// </summary>
    /// <param name="messages">The conversation messages to analyze.</param>
    /// <param name="extractionHints">Optional hints for custom entity extraction.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Comprehensive extraction result with all categories.</returns>
    Task<ComprehensiveExtractionResult> ExtractAllInformationAsync(
        IReadOnlyList<ConversationMessageDto> messages,
        IReadOnlyList<string>? extractionHints = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Extracts BANT (Budget, Authority, Need, Timeline) qualification data.
    /// </summary>
    /// <param name="messages">The conversation messages to analyze.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>BANT extraction result with scores for each component.</returns>
    Task<BantExtractionResult> ExtractBantAsync(
        IReadOnlyList<ConversationMessageDto> messages,
        CancellationToken cancellationToken = default);
}

