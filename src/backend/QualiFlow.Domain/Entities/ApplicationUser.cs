using Microsoft.AspNetCore.Identity;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a user in the QualiFlow system.
/// Extends IdentityUser with custom properties for multi-tenancy and business logic.
/// </summary>
public class ApplicationUser : IdentityUser<Guid>
{
    /// <summary>
    /// Gets or sets the user's first name.
    /// </summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the user's last name.
    /// </summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the business (tenant) ID this user belongs to.
    /// Required for multi-tenancy isolation.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the user account is active.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Gets or sets the date and time when the user was created (UTC).
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets the date and time when the user was last updated (UTC).
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user was soft deleted (UTC).
    /// Null if the user is not deleted.
    /// </summary>
    public DateTime? DeletedAt { get; set; }

    /// <summary>
    /// Gets or sets the date and time of the user's last successful login (UTC).
    /// Used for audit purposes and security monitoring.
    /// </summary>
    public DateTime? LastLoginAt { get; set; }

    // ============================================================================
    // OAuth Properties
    // ============================================================================

    /// <summary>
    /// Gets or sets the Google OAuth provider ID.
    /// </summary>
    public string? GoogleId { get; set; }

    /// <summary>
    /// Gets or sets the Microsoft OAuth provider ID.
    /// </summary>
    public string? MicrosoftId { get; set; }

    /// <summary>
    /// Gets or sets the URL to the user's profile picture from OAuth provider.
    /// Stored as string for database compatibility.
    /// </summary>
    [System.Diagnostics.CodeAnalysis.SuppressMessage(
        "Design",
        "CA1056:URI-like properties should not be strings",
        Justification = "Stored as string in database for simplicity and ORM compatibility")]
    public string? ProfilePictureUrl { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the email is verified via OAuth.
    /// </summary>
    public bool EmailVerifiedViaOAuth { get; set; }

    /// <summary>
    /// Gets or sets the OAuth provider name (e.g., "Google", "Microsoft").
    /// Null if user registered via email/password.
    /// </summary>
    public string? OAuthProvider { get; set; }

    // ============================================================================
    // Computed Properties
    // ============================================================================

    /// <summary>
    /// Gets a value indicating whether the user is soft deleted.
    /// </summary>
    public bool IsDeleted => this.DeletedAt.HasValue;

    /// <summary>
    /// Gets the user's full name.
    /// </summary>
    public string FullName => $"{this.FirstName} {this.LastName}".Trim();

    /// <summary>
    /// Gets a value indicating whether the user registered via OAuth.
    /// </summary>
    public bool IsOAuthUser => !string.IsNullOrEmpty(this.OAuthProvider);

    // ============================================================================
    // Navigation Properties
    // ============================================================================

    /// <summary>
    /// Gets or sets the business (tenant) this user belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;
}

