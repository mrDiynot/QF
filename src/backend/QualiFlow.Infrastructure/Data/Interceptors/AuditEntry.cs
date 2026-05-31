// -----------------------------------------------------------------------
// <copyright file="AuditEntry.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Collections.ObjectModel;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Data.Interceptors;

/// <summary>
/// Represents a pending audit entry being built during SaveChanges.
/// </summary>
public class AuditEntry
{
    private readonly List<PropertyEntry> _temporaryProperties = [];

    /// <summary>
    /// Initializes a new instance of the <see cref="AuditEntry"/> class.
    /// </summary>
    public AuditEntry(EntityEntry entry)
    {
        Entry = entry;
    }

    /// <summary>Gets the entity entry being audited.</summary>
    public EntityEntry Entry { get; }

    /// <summary>Gets or sets the business ID for multi-tenancy.</summary>
    public Guid? BusinessId { get; set; }

    /// <summary>Gets or sets the user ID who performed the action.</summary>
    public Guid? UserId { get; set; }

    /// <summary>Gets or sets the username who performed the action.</summary>
    public string Username { get; set; } = "System";

    /// <summary>Gets or sets the entity type name.</summary>
    public string EntityType { get; set; } = string.Empty;

    /// <summary>Gets or sets the entity ID.</summary>
    public Guid EntityId { get; set; }

    /// <summary>Gets or sets the audit action.</summary>
    public AuditAction Action { get; set; }

    /// <summary>Gets the old values before change.</summary>
    public IDictionary<string, object?> OldValues { get; } = new Dictionary<string, object?>();

    /// <summary>Gets the new values after change.</summary>
    public IDictionary<string, object?> NewValues { get; } = new Dictionary<string, object?>();

    /// <summary>Gets the temporary properties (for generated values like IDs).</summary>
    public ICollection<PropertyEntry> TemporaryProperties => _temporaryProperties;

    /// <summary>Gets or sets the IP address of the request.</summary>
    public string? IpAddress { get; set; }

    /// <summary>Gets or sets the user agent of the request.</summary>
    public string? UserAgent { get; set; }

    /// <summary>Gets a value indicating whether this entry has temporary properties.</summary>
    public bool HasTemporaryProperties => _temporaryProperties.Count > 0;

    /// <summary>
    /// Converts this audit entry to an AuditLog entity.
    /// </summary>
    /// <returns>The audit log entity.</returns>
    public AuditLog ToAuditLog()
    {
        return new AuditLog
        {
            BusinessId = BusinessId ?? Guid.Empty,
            UserId = UserId ?? Guid.Empty,
            Username = Username,
            EntityType = EntityType,
            EntityId = EntityId,
            Action = Action,
            OldValues = OldValues.Count > 0 ? JsonSerializer.Serialize(OldValues) : null,
            NewValues = NewValues.Count > 0 ? JsonSerializer.Serialize(NewValues) : null,
            IpAddress = IpAddress ?? string.Empty,
            UserAgent = UserAgent,
            CreatedAt = DateTime.UtcNow
        };
    }
}

