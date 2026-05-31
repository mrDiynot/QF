// -----------------------------------------------------------------------
// <copyright file="TimelineInfoDto.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Extracted timeline information.
/// </summary>
public sealed record TimelineInfoDto
{
    /// <summary>Gets the urgency level.</summary>
    public string? Urgency { get; init; }

    /// <summary>Gets the expected start date.</summary>
    public string? ExpectedStart { get; init; }

    /// <summary>Gets the deadline.</summary>
    public string? Deadline { get; init; }
}

