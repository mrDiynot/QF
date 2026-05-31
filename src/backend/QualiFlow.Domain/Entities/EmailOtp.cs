using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents an email-based one-time password (OTP) for authentication.
/// Used for additional security when users log in without "Remember Me".
/// </summary>
public class EmailOtp : BaseEntity
{
    /// <summary>
    /// Gets or sets the user ID this OTP belongs to.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the BCrypt-hashed OTP code.
    /// </summary>
    public string OtpCodeHash { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets when the OTP expires (UTC).
    /// OTPs expire 5 minutes after generation.
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the OTP has been used.
    /// </summary>
    public bool IsUsed { get; set; }

    /// <summary>
    /// Gets or sets the number of failed verification attempts.
    /// OTP is invalidated after 3 failed attempts.
    /// </summary>
    public int FailedAttempts { get; set; }

    /// <summary>
    /// Gets or sets the IP address that requested this OTP.
    /// </summary>
    public string? RequestedByIp { get; set; }

    // ============================================================================
    // Navigation Properties
    // ============================================================================

    /// <summary>
    /// Gets or sets the user this OTP belongs to.
    /// </summary>
    public ApplicationUser? User { get; set; }

    // ============================================================================
    // Computed Properties
    // ============================================================================

    /// <summary>
    /// Gets a value indicating whether the OTP is valid (not expired, not used, and not locked).
    /// </summary>
    public bool IsValid => !this.IsUsed && this.ExpiresAt > DateTime.UtcNow && this.FailedAttempts < 3;

    /// <summary>
    /// Gets a value indicating whether the OTP is expired.
    /// </summary>
    public bool IsExpired => this.ExpiresAt <= DateTime.UtcNow;

    /// <summary>
    /// Gets a value indicating whether the OTP is locked due to too many failed attempts.
    /// </summary>
    public bool IsLocked => this.FailedAttempts >= 3;
}

