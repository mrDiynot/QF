// <copyright file="TrackedLink.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a trackable short link for marketing campaigns.
/// </summary>
public class TrackedLink : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant).
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the display name for the link.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the short URL slug (unique per business).
    /// </summary>
    public string Slug { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the full destination URL.
    /// </summary>
#pragma warning disable CA1056 // URI-like properties should not be strings
    public string DestinationUrl { get; set; } = string.Empty;
#pragma warning restore CA1056

    /// <summary>
    /// Gets or sets the total number of clicks.
    /// </summary>
    public int Clicks { get; set; }

    /// <summary>
    /// Gets or sets the number of conversions.
    /// </summary>
    public int Conversions { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the link is active.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Gets or sets optional metadata as JSON.
    /// </summary>
    public string? Metadata { get; set; }

    /// <summary>
    /// Gets the conversion rate as a percentage.
    /// </summary>
    public decimal ConversionRate => Clicks > 0 ? (decimal)Conversions / Clicks * 100 : 0;

    // Navigation properties

    /// <summary>
    /// Gets or sets the business this link belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;
}
