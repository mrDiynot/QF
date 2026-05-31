namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// User data transfer object.
/// Contains user information returned in authentication responses.
/// </summary>
public class UserDto
{
    /// <summary>
    /// Gets or sets the user's unique identifier.
    /// </summary>
    /// <example>123e4567-e89b-12d3-a456-426614174000.</example>
    public required string Id { get; set; }

    /// <summary>
    /// Gets or sets the user's email address.
    /// </summary>
    /// <example>john.doe@example.com.</example>
    public required string Email { get; set; }

    /// <summary>
    /// Gets or sets the user's first name.
    /// </summary>
    /// <example>John.</example>
    public required string FirstName { get; set; }

    /// <summary>
    /// Gets or sets the user's last name.
    /// </summary>
    /// <example>Doe.</example>
    public required string LastName { get; set; }

    /// <summary>
    /// Gets or sets the business (tenant) ID the user belongs to.
    /// </summary>
    /// <example>456e7890-e89b-12d3-a456-426614174111.</example>
    public required string BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the user's role in the system.
    /// </summary>
    /// <example>Owner.</example>
    public required string Role { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the user account is active.
    /// </summary>
    /// <example>true.</example>
    public required bool IsActive { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the user's email is confirmed.
    /// Users must verify their email before accessing the dashboard.
    /// </summary>
    /// <example>true.</example>
    public required bool EmailConfirmed { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user was created (UTC).
    /// </summary>
    /// <example>2025-12-03T10:00:00Z.</example>
    public required string CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user was last updated (UTC).
    /// </summary>
    /// <example>2025-12-03T15:30:00Z.</example>
    public string? UpdatedAt { get; set; }
}
