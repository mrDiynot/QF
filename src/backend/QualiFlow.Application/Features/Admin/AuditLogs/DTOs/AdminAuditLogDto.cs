namespace QualiFlow.Application.Features.Admin.AuditLogs.DTOs;

/// <summary>
/// DTO for admin audit log.
/// </summary>
public class AdminAuditLogDto
{
    /// <summary>
    /// Gets or sets the audit log ID.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the admin user ID.
    /// </summary>
    public Guid AdminUserId { get; set; }

    /// <summary>
    /// Gets or sets the admin user email.
    /// </summary>
    public string AdminUserEmail { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the action performed.
    /// </summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the entity type.
    /// </summary>
    public string? EntityType { get; set; }

    /// <summary>
    /// Gets or sets the entity ID.
    /// </summary>
    public string? EntityId { get; set; }

    /// <summary>
    /// Gets or sets the old values (JSON).
    /// </summary>
    public string? OldValues { get; set; }

    /// <summary>
    /// Gets or sets the new values (JSON).
    /// </summary>
    public string? NewValues { get; set; }

    /// <summary>
    /// Gets or sets the IP address.
    /// </summary>
    public string IpAddress { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the user agent.
    /// </summary>
    public string? UserAgent { get; set; }

    /// <summary>
    /// Gets or sets the HTTP method.
    /// </summary>
    public string HttpMethod { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the request path.
    /// </summary>
    public string RequestPath { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the HTTP status code.
    /// </summary>
    public int StatusCode { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the action was successful.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Gets or sets the error message.
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Gets or sets the timestamp.
    /// </summary>
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Query parameters for admin audit logs.
/// </summary>
public class AdminAuditLogQuery
{
    /// <summary>
    /// Gets or sets the admin user ID filter.
    /// </summary>
    public Guid? AdminUserId { get; set; }

    /// <summary>
    /// Gets or sets the action filter.
    /// </summary>
    public string? Action { get; set; }

    /// <summary>
    /// Gets or sets the entity type filter.
    /// </summary>
    public string? EntityType { get; set; }

    /// <summary>
    /// Gets or sets the entity ID filter.
    /// </summary>
    public string? EntityId { get; set; }

    /// <summary>
    /// Gets or sets the start date filter.
    /// </summary>
    public DateTime? StartDate { get; set; }

    /// <summary>
    /// Gets or sets the end date filter.
    /// </summary>
    public DateTime? EndDate { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether to include only successful actions.
    /// </summary>
    public bool? SuccessOnly { get; set; }

    /// <summary>
    /// Gets or sets the page number (1-based).
    /// </summary>
    public int Page { get; set; } = 1;

    /// <summary>
    /// Gets or sets the page size.
    /// </summary>
    public int PageSize { get; set; } = 50;
}

