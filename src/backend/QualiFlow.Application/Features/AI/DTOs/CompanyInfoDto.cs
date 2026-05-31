// -----------------------------------------------------------------------
// <copyright file="CompanyInfoDto.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Extracted company information.
/// </summary>
public sealed record CompanyInfoDto
{
    /// <summary>Gets the company name.</summary>
    public string? Name { get; init; }

    /// <summary>Gets the company size.</summary>
    public string? Size { get; init; }

    /// <summary>Gets the industry.</summary>
    public string? Industry { get; init; }

    /// <summary>Gets the location.</summary>
    public string? Location { get; init; }
}

