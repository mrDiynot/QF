// -----------------------------------------------------------------------
// <copyright file="ContactInfoDto.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Extracted contact information.
/// </summary>
public sealed record ContactInfoDto
{
    /// <summary>Gets the extracted name.</summary>
    public string? Name { get; init; }

    /// <summary>Gets the extracted email.</summary>
    public string? Email { get; init; }

    /// <summary>Gets the extracted phone.</summary>
    public string? Phone { get; init; }

    /// <summary>Gets the extracted job title.</summary>
    public string? JobTitle { get; init; }
}

