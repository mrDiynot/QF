// -----------------------------------------------------------------------
// <copyright file="SecondaryIntent.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Common.Models;

/// <summary>
/// A secondary intent with lower confidence.
/// </summary>
public sealed record SecondaryIntent
{
    /// <summary>Gets the intent name.</summary>
    public required string Intent { get; init; }

    /// <summary>Gets the confidence score (0-1).</summary>
    public required float Confidence { get; init; }
}

