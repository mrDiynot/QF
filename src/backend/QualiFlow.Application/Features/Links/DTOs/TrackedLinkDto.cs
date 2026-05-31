// <copyright file="TrackedLinkDto.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

namespace QualiFlow.Application.Features.Links.DTOs;

/// <summary>
/// DTO for tracked link data.
/// </summary>
#pragma warning disable CA1056 // URI-like properties should not be strings
public record TrackedLinkDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string ShortUrl { get; init; } = string.Empty;
    public string DestinationUrl { get; init; } = string.Empty;
    public int Clicks { get; init; }
    public int Conversions { get; init; }
    public decimal ConversionRate { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
}

/// <summary>
/// Request to create a tracked link.
/// </summary>
public record CreateTrackedLinkRequest
{
    public string Name { get; init; } = string.Empty;
    public string? Slug { get; init; }
    public string DestinationUrl { get; init; } = string.Empty;
}

/// <summary>
/// Request to update a tracked link.
/// </summary>
public record UpdateTrackedLinkRequest
{
    public string? Name { get; init; }
    public string? DestinationUrl { get; init; }
    public bool? IsActive { get; init; }
}
#pragma warning restore CA1056

/// <summary>
/// Statistics for tracked links.
/// </summary>
public record TrackedLinkStatsDto
{
    public int TotalLinks { get; init; }
    public int TotalClicks { get; init; }
    public int TotalConversions { get; init; }
    public decimal AverageConversionRate { get; init; }
}
