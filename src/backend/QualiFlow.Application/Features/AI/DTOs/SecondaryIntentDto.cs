// -----------------------------------------------------------------------
// <copyright file="SecondaryIntentDto.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Secondary intent with confidence.
/// </summary>
public sealed record SecondaryIntentDto
{
    /// <summary>Gets the intent name.</summary>
    public required string Intent { get; init; }

    /// <summary>Gets the confidence score.</summary>
    public required float Confidence { get; init; }
}

