using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents an API key for programmatic access to the QualiFlow API.
/// </summary>
public class ApiKey : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant) that owns this API key.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the friendly name for this API key.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the hashed API key value (never store plain text).
    /// Uses HMAC-SHA256 for secure hashing.
    /// </summary>
    public string KeyHash { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the prefix of the API key (first 8 characters) for display purposes.
    /// Example: "qf_live_" or "qf_test_".
    /// </summary>
    public string KeyPrefix { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the last 4 characters of the API key for identification.
    /// </summary>
    public string KeySuffix { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the date and time when this API key was last used.
    /// </summary>
    public DateTime? LastUsedAt { get; set; }

    /// <summary>
    /// Gets or sets the date and time when this API key expires.
    /// Null means the key never expires.
    /// </summary>
    public DateTime? ExpiresAt { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this API key is active.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Gets or sets the business that owns this API key.
    /// </summary>
    public Business Business { get; set; } = null!;
}

