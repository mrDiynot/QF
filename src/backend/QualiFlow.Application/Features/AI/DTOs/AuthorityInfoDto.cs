// -----------------------------------------------------------------------
// <copyright file="AuthorityInfoDto.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Authority information extracted from conversation.
/// </summary>
public sealed record AuthorityInfoDto
{
    /// <summary>Gets the decision maker role.</summary>
    public string? DecisionMakerRole { get; init; }

    /// <summary>Gets a value indicating whether the contact has buying authority.</summary>
    public bool HasBuyingAuthority { get; init; }

    /// <summary>Gets the list of stakeholders mentioned.</summary>
    public IReadOnlyList<string> Stakeholders { get; init; } = [];

    /// <summary>Gets the approval process description.</summary>
    public string? ApprovalProcess { get; init; }
}

