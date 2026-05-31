// -----------------------------------------------------------------------
// <copyright file="IntentDetectionRequest.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Request for intent detection analysis.
/// </summary>
public sealed record IntentDetectionRequest
{
    /// <summary>Gets the message to analyze.</summary>
    public required string Message { get; init; }

    /// <summary>Gets the business ID for context.</summary>
    public Guid? BusinessId { get; init; }

    /// <summary>Gets the lead ID for context.</summary>
    public Guid? LeadId { get; init; }

    /// <summary>Gets the channel type (chat, sms, voice, etc.).</summary>
    public string? Channel { get; init; }

    /// <summary>Gets previous messages for context.</summary>
    public IReadOnlyList<string>? ConversationContext { get; init; }

    /// <summary>Gets a value indicating whether to include entity extraction.</summary>
    public bool IncludeEntityExtraction { get; init; } = true;

    /// <summary>Gets a value indicating whether to detect buying signals.</summary>
    public bool DetectBuyingSignals { get; init; } = true;
}

