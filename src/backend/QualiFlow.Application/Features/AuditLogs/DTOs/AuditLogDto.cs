// -----------------------------------------------------------------------
// <copyright file="AuditLogDto.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AuditLogs.DTOs;

/// <summary>
/// Data transfer object for audit log entries.
/// </summary>
public record AuditLogDto
{
    /// <summary>Gets the audit log ID.</summary>
    public required Guid Id { get; init; }

    /// <summary>Gets the user ID who performed the action.</summary>
    public required Guid UserId { get; init; }

    /// <summary>Gets the username who performed the action.</summary>
    public required string Username { get; init; }

    /// <summary>Gets the entity type affected (e.g., Lead, Conversation).</summary>
    public required string EntityType { get; init; }

    /// <summary>Gets the entity ID affected.</summary>
    public required Guid EntityId { get; init; }

    /// <summary>Gets the action performed.</summary>
    public required string Action { get; init; }

    /// <summary>Gets the old values before the change (JSON).</summary>
    public string? OldValues { get; init; }

    /// <summary>Gets the new values after the change (JSON).</summary>
    public string? NewValues { get; init; }

    /// <summary>Gets the IP address of the request.</summary>
    public string? IpAddress { get; init; }

    /// <summary>Gets the user agent of the request.</summary>
    public string? UserAgent { get; init; }

    /// <summary>Gets the timestamp when the action occurred.</summary>
    public required DateTime CreatedAt { get; init; }
}

