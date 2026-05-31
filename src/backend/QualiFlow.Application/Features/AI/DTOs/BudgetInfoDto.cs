// -----------------------------------------------------------------------
// <copyright file="BudgetInfoDto.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Extracted budget information.
/// </summary>
public sealed record BudgetInfoDto
{
    /// <summary>Gets a value indicating whether budget was mentioned.</summary>
    public bool HasBudget { get; init; }

    /// <summary>Gets the budget range.</summary>
    public string? Range { get; init; }

    /// <summary>Gets the currency.</summary>
    public string? Currency { get; init; }

    /// <summary>Gets the budget timeframe.</summary>
    public string? Timeframe { get; init; }
}

