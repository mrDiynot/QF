// -----------------------------------------------------------------------
// <copyright file="IIntentDetectionService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Features.AI.DTOs;

namespace QualiFlow.Application.Features.AI.Interfaces;

/// <summary>
/// Service interface for advanced intent detection in lead qualification conversations.
/// Provides specialized prompts for different conversation scenarios.
/// </summary>
public interface IIntentDetectionService
{
    /// <summary>
    /// Detects the intent of a message with lead qualification context.
    /// </summary>
    /// <param name="request">The intent detection request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Detailed intent detection result.</returns>
    Task<IntentDetectionResponse> DetectIntentAsync(
        IntentDetectionRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Classifies the conversation stage based on message history.
    /// </summary>
    /// <param name="messages">The conversation messages.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The detected conversation stage.</returns>
    Task<ConversationStageResult> ClassifyConversationStageAsync(
        IReadOnlyList<ConversationMessageDto> messages,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Detects buying signals in a message.
    /// </summary>
    /// <param name="message">The message to analyze.</param>
    /// <param name="conversationContext">Previous messages for context.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Detected buying signals.</returns>
    Task<BuyingSignalsResult> DetectBuyingSignalsAsync(
        string message,
        IReadOnlyList<string>? conversationContext = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Extracts key information from a message for lead qualification.
    /// </summary>
    /// <param name="message">The message to analyze.</param>
    /// <param name="extractionHints">Hints for what information to extract.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Extracted information.</returns>
    Task<InformationExtractionResult> ExtractInformationAsync(
        string message,
        IReadOnlyList<string>? extractionHints = null,
        CancellationToken cancellationToken = default);
}

