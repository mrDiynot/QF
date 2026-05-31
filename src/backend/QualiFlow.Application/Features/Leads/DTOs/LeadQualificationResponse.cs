// -----------------------------------------------------------------------
// <copyright file="LeadQualificationResponse.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Leads.DTOs;

/// <summary>
/// Response DTO for lead qualification results.
/// </summary>
public sealed record LeadQualificationResponse
{
    /// <summary>Gets the lead's unique identifier.</summary>
    public required Guid LeadId { get; init; }

    /// <summary>Gets the calculated score (0-100).</summary>
    public required int Score { get; init; }

    /// <summary>Gets a value indicating whether the lead is qualified (score >= 70).</summary>
    public required bool IsQualified { get; init; }

    /// <summary>Gets the previous status before qualification.</summary>
    public required LeadStatus PreviousStatus { get; init; }

    /// <summary>Gets the new status after qualification.</summary>
    public required LeadStatus NewStatus { get; init; }

    /// <summary>Gets the AI reasoning for the qualification decision.</summary>
    public string? Reasoning { get; init; }

    /// <summary>Gets the suggested next actions.</summary>
    public IReadOnlyList<string> SuggestedActions { get; init; } = [];

    /// <summary>Gets the confidence level of the qualification (0.0-1.0).</summary>
    public double Confidence { get; init; }

    /// <summary>Gets when the qualification was performed.</summary>
    public required DateTime QualifiedAt { get; init; }
}

