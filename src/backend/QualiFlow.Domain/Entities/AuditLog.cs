// <copyright file="AuditLog.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents an audit log entry for tracking all CRUD operations in the system.
/// Provides complete audit trail with user, timestamp, IP address, and change tracking.
/// </summary>
public class AuditLog : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant) for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the user ID who performed the action.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who performed the action.
    /// </summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the type of action performed (Create, Update, Delete, Read).
    /// </summary>
    public AuditAction Action { get; set; }

    /// <summary>
    /// Gets or sets the entity type (e.g., "Lead", "Conversation", "Message").
    /// </summary>
    public string EntityType { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the entity ID that was affected.
    /// </summary>
    public Guid EntityId { get; set; }

    /// <summary>
    /// Gets or sets the old values (before change) as JSON.
    /// Null for Create and Read operations.
    /// </summary>
    public string? OldValues { get; set; }

    /// <summary>
    /// Gets or sets the new values (after change) as JSON.
    /// Null for Delete and Read operations.
    /// </summary>
    public string? NewValues { get; set; }

    /// <summary>
    /// Gets or sets the IP address of the user who performed the action.
    /// </summary>
    public string IpAddress { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the user agent (browser/client) information.
    /// </summary>
    public string? UserAgent { get; set; }

    /// <summary>
    /// Gets or sets the HTTP method (GET, POST, PUT, DELETE, PATCH).
    /// </summary>
    public string HttpMethod { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the request path (e.g., "/api/v1/leads/123").
    /// </summary>
    public string RequestPath { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets additional metadata as JSON (optional).
    /// Can store custom fields, tags, or other contextual information.
    /// </summary>
    public string? Metadata { get; set; }

    /// <summary>
    /// Gets the timestamp when the action was performed.
    /// Automatically set by BaseEntity.CreatedAt.
    /// </summary>
    public DateTime Timestamp => CreatedAt;

    // Navigation properties

    /// <summary>
    /// Gets or sets the business (tenant) this audit log belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user who performed the action.
    /// </summary>
    public ApplicationUser? User { get; set; }
}

