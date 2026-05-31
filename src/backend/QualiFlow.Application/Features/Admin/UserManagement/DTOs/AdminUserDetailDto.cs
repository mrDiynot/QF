namespace QualiFlow.Application.Features.Admin.UserManagement.DTOs;

/// <summary>
/// DTO for detailed user information.
/// </summary>
public class AdminUserDetailDto
{
    /// <summary>
    /// Gets the user's ID.
    /// </summary>
    public required Guid Id { get; init; }

    /// <summary>
    /// Gets the user's email.
    /// </summary>
    public required string Email { get; init; }

    /// <summary>
    /// Gets the user's first name.
    /// </summary>
    public required string FirstName { get; init; }

    /// <summary>
    /// Gets the user's last name.
    /// </summary>
    public required string LastName { get; init; }

    /// <summary>
    /// Gets the user's phone number.
    /// </summary>
    public string? PhoneNumber { get; init; }

    /// <summary>
    /// Gets the user's role.
    /// </summary>
    public required string Role { get; init; }

    /// <summary>
    /// Gets the business ID.
    /// </summary>
    public required Guid BusinessId { get; init; }

    /// <summary>
    /// Gets the business name.
    /// </summary>
    public required string BusinessName { get; init; }

    /// <summary>
    /// Gets the subscription tier.
    /// </summary>
    public required string SubscriptionTier { get; init; }

    /// <summary>
    /// Gets a value indicating whether the user is active.
    /// </summary>
    public required bool IsActive { get; init; }

    /// <summary>
    /// Gets a value indicating whether the user's email is confirmed.
    /// </summary>
    public required bool EmailConfirmed { get; init; }

    /// <summary>
    /// Gets the OAuth provider (Google, Microsoft, or null for email/password).
    /// </summary>
    public string? OAuthProvider { get; init; }

    /// <summary>
    /// Gets the user's creation date.
    /// </summary>
    public required DateTime CreatedAt { get; init; }

    /// <summary>
    /// Gets the user's last update date.
    /// </summary>
    public DateTime? UpdatedAt { get; init; }

    /// <summary>
    /// Gets the user's last login date.
    /// </summary>
    public DateTime? LastLoginAt { get; init; }

    /// <summary>
    /// Gets the total number of leads created by this user.
    /// </summary>
    public int TotalLeadsCreated { get; init; }

    /// <summary>
    /// Gets the total number of conversations handled by this user.
    /// </summary>
    public int TotalConversationsHandled { get; init; }
}

