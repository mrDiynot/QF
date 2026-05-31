using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents an admin user in the QualiFlow platform.
/// Admin users have elevated permissions to manage the platform.
/// This entity is independent from ApplicationUser for security isolation.
/// </summary>
public class AdminUser : BaseEntity
{
    /// <summary>
    /// Gets or sets the admin's email address (unique, used for login).
    /// </summary>
    public required string Email { get; set; }

    /// <summary>
    /// Gets or sets the normalized email for case-insensitive lookups.
    /// </summary>
    public required string NormalizedEmail { get; set; }

    /// <summary>
    /// Gets or sets the BCrypt password hash.
    /// </summary>
    public required string PasswordHash { get; set; }

    /// <summary>
    /// Gets or sets the admin's first name.
    /// </summary>
    public required string FirstName { get; set; }

    /// <summary>
    /// Gets or sets the admin's last name.
    /// </summary>
    public required string LastName { get; set; }

    /// <summary>
    /// Gets or sets the admin role.
    /// </summary>
    public required AdminRole Role { get; set; }

    /// <summary>
    /// Gets the list of whitelisted IP addresses.
    /// Empty list means no IP restriction.
    /// </summary>
    public ICollection<string> IpWhitelist { get; } = [];

    /// <summary>
    /// Gets or sets a value indicating whether the admin user is active.
    /// </summary>
    public required bool IsActive { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the admin must change their password on next login.
    /// </summary>
    public bool MustChangePassword { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the admin user last logged in.
    /// </summary>
    public DateTime? LastLoginAt { get; set; }

    /// <summary>
    /// Gets or sets the IP address from the last login.
    /// </summary>
    public string? LastLoginIp { get; set; }

    /// <summary>
    /// Gets or sets the number of consecutive failed login attempts.
    /// </summary>
    public int FailedLoginAttempts { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the account was locked out.
    /// </summary>
    public DateTime? LockoutEndAt { get; set; }

    /// <summary>
    /// Gets or sets the 2FA secret for TOTP authentication.
    /// Null if 2FA is not enabled.
    /// </summary>
    public string? TwoFactorSecret { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether 2FA is enabled.
    /// </summary>
    public bool TwoFactorEnabled { get; set; }

    /// <summary>
    /// Gets or sets the current refresh token for the admin.
    /// </summary>
    public string? RefreshToken { get; set; }

    /// <summary>
    /// Gets or sets the expiration date of the refresh token.
    /// </summary>
    public DateTime? RefreshTokenExpiresAt { get; set; }

    /// <summary>
    /// Gets or sets the password reset token hash.
    /// </summary>
    public string? PasswordResetToken { get; set; }

    /// <summary>
    /// Gets or sets the expiration date of the password reset token.
    /// </summary>
    public DateTime? PasswordResetTokenExpiry { get; set; }

    /// <summary>
    /// Gets the full name of the admin user.
    /// </summary>
    public string FullName => $"{FirstName} {LastName}";

    /// <summary>
    /// Gets a value indicating whether the account is currently locked out.
    /// </summary>
    public bool IsLockedOut => LockoutEndAt.HasValue && LockoutEndAt.Value > DateTime.UtcNow;
}

