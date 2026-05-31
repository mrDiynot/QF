// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a waitlist signup entry from the Coming Soon landing page.
/// Used to track signups locally for analytics in addition to Brevo sync.
/// </summary>
public class WaitlistEntry : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (for multi-tenancy).
    /// For Coming Soon page, this will be a default/system business ID.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the email address of the signup.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the source of the signup (e.g., "chat-widget", "homepage", "newsletter").
    /// </summary>
    public string? Source { get; set; }

    /// <summary>
    /// Gets or sets the chat session ID if signup originated from chat.
    /// </summary>
    public Guid? ChatSessionId { get; set; }

    /// <summary>
    /// Gets or sets the visitor's IP address.
    /// </summary>
    public string? IpAddress { get; set; }

    /// <summary>
    /// Gets or sets the visitor's user agent.
    /// </summary>
    public string? UserAgent { get; set; }

    /// <summary>
    /// Gets or sets the page URL where signup occurred.
    /// </summary>
#pragma warning disable CA1056 // URI-like properties should not be strings
    public string? PageUrl { get; set; }
#pragma warning restore CA1056

    /// <summary>
    /// Gets or sets the referrer URL.
    /// </summary>
#pragma warning disable CA1056 // URI-like properties should not be strings
    public string? ReferrerUrl { get; set; }
#pragma warning restore CA1056

    /// <summary>
    /// Gets or sets when the signup occurred.
    /// </summary>
    public DateTime SignedUpAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets a value indicating whether this entry was synced to Brevo.
    /// </summary>
    public bool SyncedToBrevo { get; set; }

    /// <summary>
    /// Gets or sets when the entry was synced to Brevo.
    /// </summary>
    public DateTime? SyncedAt { get; set; }

    /// <summary>
    /// Gets or sets additional metadata as JSON.
    /// </summary>
    public string? MetadataJson { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the linked chat session (if any).
    /// </summary>
    public ChatSession? ChatSession { get; set; }
}
