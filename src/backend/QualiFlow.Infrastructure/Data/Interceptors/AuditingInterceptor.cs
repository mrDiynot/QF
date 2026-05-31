// -----------------------------------------------------------------------
// <copyright file="AuditingInterceptor.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;
using QualiFlow.Domain.Common;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Data.Interceptors;

/// <summary>
/// EF Core interceptor that automatically creates audit log entries for all entity changes.
/// Implements comprehensive audit trail per industry best practices.
/// </summary>
public class AuditingInterceptor : SaveChangesInterceptor
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    /// <summary>
    /// Initializes a new instance of the <see cref="AuditingInterceptor"/> class.
    /// </summary>
    public AuditingInterceptor(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    /// <inheritdoc/>
    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        if (eventData.Context is QualiFlowDbContext context)
        {
            await CreateAuditEntriesAsync(context, cancellationToken);
        }

        return await base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private async Task CreateAuditEntriesAsync(QualiFlowDbContext context, CancellationToken cancellationToken)
    {
        context.ChangeTracker.DetectChanges();

        var httpContext = _httpContextAccessor.HttpContext;

        // Skip audit logging if there's no authenticated user
        // AuditLog.UserId is non-nullable, so we can't create audit logs
        // without a valid user ID (e.g., during registration)
        if (httpContext?.User?.Identity?.IsAuthenticated != true)
        {
            return;
        }

        // Skip audit logging for admin users - admin operations are tracked via AdminAuditLog.
        // Admin user IDs exist in admin_users table, not the users table,
        // so inserting into audit_logs would violate the FK constraint on user_id.
        var isAdmin = httpContext.User.FindFirst("is_admin")?.Value == "true";
        if (isAdmin)
        {
            return;
        }

        // Check if there's a Business being added in this batch
        // If so, skip ALL audit logging to avoid FK constraint violations
        // (BusinessId is non-nullable in AuditLog, so we can't create audit logs
        // for entities that reference a business not yet in the database)
        var businessBeingAdded = context.ChangeTracker.Entries<Business>()
            .Any(e => e.State == EntityState.Added);

        if (businessBeingAdded)
        {
            // Skip audit logging for this batch - the business creation itself
            // is tracked implicitly by the records being created
            return;
        }

        var auditEntries = new List<AuditEntry>();

        foreach (var entry in context.ChangeTracker.Entries())
        {
            // Skip audit logs themselves and non-auditable entities
            if (entry.Entity is AuditLog || entry.Entity is AdminAuditLog)
            {
                continue;
            }

            // Only audit entities that inherit from BaseEntity
            if (entry.Entity is not BaseEntity baseEntity)
            {
                continue;
            }

            // Skip unchanged entities
            if (entry.State == EntityState.Unchanged || entry.State == EntityState.Detached)
            {
                continue;
            }

            var auditEntry = new AuditEntry(entry)
            {
                EntityType = entry.Entity.GetType().Name,
                EntityId = baseEntity.Id,
                Action = entry.State switch
                {
                    EntityState.Added => AuditAction.Create,
                    EntityState.Modified => AuditAction.Update,
                    EntityState.Deleted => AuditAction.Delete,
                    _ => AuditAction.Read
                }
            };

            // Extract business ID if entity has it
            auditEntry.BusinessId = GetBusinessId(entry);

            // Extract user info from HTTP context
            if (httpContext?.User?.Identity?.IsAuthenticated == true)
            {
                // Check multiple possible claim names for user ID
                var userIdClaim = httpContext.User.FindFirst("user_id")?.Value
                    ?? httpContext.User.FindFirst("sub")?.Value
                    ?? httpContext.User.FindFirst("userId")?.Value
                    ?? httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

                if (Guid.TryParse(userIdClaim, out var userId))
                {
                    auditEntry.UserId = userId;
                }
                else
                {
                    // If we can't extract a valid user ID, skip audit logging
                    // since AuditLog.UserId is non-nullable
                    return;
                }

                auditEntry.Username = httpContext.User.Identity?.Name
                    ?? httpContext.User.FindFirst("email")?.Value
                    ?? "Unknown";
            }

            // Extract IP and User Agent
            auditEntry.IpAddress = httpContext?.Connection?.RemoteIpAddress?.ToString();
            auditEntry.UserAgent = httpContext?.Request?.Headers["User-Agent"].ToString();

            // Capture property changes
            foreach (var property in entry.Properties)
            {
                if (property.IsTemporary)
                {
                    auditEntry.TemporaryProperties.Add(property);
                    continue;
                }

                var propertyName = property.Metadata.Name;

                // Skip certain properties
                if (propertyName is "CreatedAt" or "UpdatedAt" or "DeletedAt")
                {
                    continue;
                }

                switch (entry.State)
                {
                    case EntityState.Added:
                        auditEntry.NewValues[propertyName] = property.CurrentValue;
                        break;

                    case EntityState.Deleted:
                        auditEntry.OldValues[propertyName] = property.OriginalValue;
                        break;

                    case EntityState.Modified when property.IsModified:
                        auditEntry.OldValues[propertyName] = property.OriginalValue;
                        auditEntry.NewValues[propertyName] = property.CurrentValue;
                        break;
                }
            }

            auditEntries.Add(auditEntry);
        }

        // Add audit logs to context
        // Skip entries without a valid BusinessId to avoid FK constraint violations
        foreach (var auditEntry in auditEntries.Where(e => !e.HasTemporaryProperties && e.BusinessId.HasValue && e.BusinessId.Value != Guid.Empty))
        {
            await context.AuditLogs.AddAsync(auditEntry.ToAuditLog(), cancellationToken);
        }
    }

    private static Guid? GetBusinessId(EntityEntry entry)
    {
        // For Business entity, use its own Id as the BusinessId for audit purposes
        // This only applies to Update/Delete operations since Added is skipped earlier
        if (entry.Entity is Business business)
        {
            return business.Id;
        }

        var businessIdProperty = entry.Properties
            .FirstOrDefault(p => p.Metadata.Name == "BusinessId");

        if (businessIdProperty?.CurrentValue is Guid businessId)
        {
            return businessId;
        }

        return null;
    }
}

