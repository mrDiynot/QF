// -----------------------------------------------------------------------
// <copyright file="NeedInfoDto.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Need information extracted from conversation.
/// </summary>
public sealed record NeedInfoDto
{
    /// <summary>Gets the list of pain points identified.</summary>
    public IReadOnlyList<string> PainPoints { get; init; } = [];

    /// <summary>Gets the list of requirements mentioned.</summary>
    public IReadOnlyList<string> Requirements { get; init; } = [];

    /// <summary>Gets the primary use case.</summary>
    public string? UseCase { get; init; }

    /// <summary>Gets the urgency level.</summary>
    public string? Urgency { get; init; }

    /// <summary>Gets a value indicating whether the need is validated.</summary>
    public bool IsValidated { get; init; }
}

