using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents an audit log entry specifically for admin platform actions.
/// Separate from regular AuditLog to track admin-specific operations.
/// </summary>
public class AdminAuditLog : BaseEntity
{
    /// <summary>
    /// Gets or sets the admin user ID who performed the action.
    /// </summary>
    public required Guid AdminUserId { get; set; }

    /// <summary>
    /// Gets or sets the action performed (e.g., "CreateAdminUser", "UpdateSubscriptionPlan").
    /// </summary>
    public required string Action { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the type of entity affected (e.g., "AdminUser", "SubscriptionPlan", "Business").
    /// </summary>
    public string? EntityType { get; set; }

    /// <summary>
    /// Gets or sets the ID of the entity affected.
    /// </summary>
    public string? EntityId { get; set; }

    /// <summary>
    /// Gets or sets the old values (before change) as JSON.
    /// </summary>
    public string? OldValues { get; set; }

    /// <summary>
    /// Gets or sets the new values (after change) as JSON.
    /// </summary>
    public string? NewValues { get; set; }

    /// <summary>
    /// Gets or sets the IP address of the request.
    /// </summary>
    public required string IpAddress { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the user agent of the request.
    /// </summary>
    public string? UserAgent { get; set; }

    /// <summary>
    /// Gets or sets the HTTP method (GET, POST, PUT, PATCH, DELETE).
    /// </summary>
    public required string HttpMethod { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the request path.
    /// </summary>
    public required string RequestPath { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the HTTP status code of the response.
    /// </summary>
    public int StatusCode { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the action was successful.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Gets or sets the error message if the action failed.
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Gets or sets additional metadata as JSON (optional).
    /// </summary>
    public string? Metadata { get; set; }

    /// <summary>
    /// Gets or sets the navigation property to the admin user.
    /// </summary>
    public AdminUser AdminUser { get; set; } = null!;
}

