using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a refresh token for JWT authentication.
/// Used for token rotation and maintaining user sessions.
/// </summary>
public class RefreshToken : BaseEntity
{
    /// <summary>
    /// Gets or sets the user ID this refresh token belongs to.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the actual refresh token value (hashed).
    /// </summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets when the refresh token expires (UTC).
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the refresh token has been revoked.
    /// </summary>
    public bool IsRevoked { get; set; }

    /// <summary>
    /// Gets or sets when the refresh token was revoked (UTC).
    /// Null if the token has not been revoked.
    /// </summary>
    public DateTime? RevokedAt { get; set; }

    /// <summary>
    /// Gets or sets the IP address that created this refresh token.
    /// Used for security audit trail.
    /// </summary>
    public string? CreatedByIp { get; set; }

    /// <summary>
    /// Gets or sets the IP address that revoked this refresh token.
    /// Null if the token has not been revoked.
    /// </summary>
    public string? RevokedByIp { get; set; }

    // ============================================================================
    // Navigation Properties
    // ============================================================================

    /// <summary>
    /// Gets or sets the user this refresh token belongs to.
    /// </summary>
    public ApplicationUser User { get; set; } = null!;

    // ============================================================================
    // Computed Properties
    // ============================================================================

    /// <summary>
    /// Gets a value indicating whether the refresh token is active (not expired and not revoked).
    /// </summary>
    public bool IsActive => !this.IsRevoked && this.ExpiresAt > DateTime.UtcNow;
}

