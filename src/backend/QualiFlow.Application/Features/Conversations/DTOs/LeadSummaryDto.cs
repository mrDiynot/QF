// -----------------------------------------------------------------------
// <copyright file="LeadSummaryDto.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.Conversations.DTOs;

/// <summary>
/// Lead summary for conversation list.
/// </summary>
public sealed record LeadSummaryDto
{
    /// <summary>Gets the lead name.</summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>Gets the lead email.</summary>
    public string Email { get; init; } = string.Empty;

    /// <summary>Gets the lead status.</summary>
    public string Status { get; init; } = string.Empty;

    /// <summary>Gets the lead score.</summary>
    public int Score { get; init; }
}

