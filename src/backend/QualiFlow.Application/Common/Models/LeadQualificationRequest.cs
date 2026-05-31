// -----------------------------------------------------------------------
// <copyright file="LeadQualificationRequest.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Common.Models;

/// <summary>
/// Request object for lead qualification.
/// </summary>
public sealed record LeadQualificationRequest
{
    /// <summary>Gets the lead's name.</summary>
    public required string LeadName { get; init; }

    /// <summary>Gets the lead's email.</summary>
    public required string LeadEmail { get; init; }

    /// <summary>Gets the lead's phone number.</summary>
    public string? LeadPhone { get; init; }

    /// <summary>Gets the conversation history as a list of messages.</summary>
    public required IReadOnlyList<ConversationMessage> ConversationHistory { get; init; }

    /// <summary>Gets the business-specific scoring criteria.</summary>
    public required IReadOnlyList<ScoringCriterion> ScoringCriteria { get; init; }
}

