namespace QualiFlow.Application.Features.Admin.UserManagement.DTOs;

/// <summary>
/// DTO for user list item (summary view).
/// </summary>
public class AdminUserListDto
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
    /// Gets the user's full name.
    /// </summary>
    public string FullName => $"{FirstName} {LastName}";

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
    /// Gets a value indicating whether the user is active.
    /// </summary>
    public required bool IsActive { get; init; }

    /// <summary>
    /// Gets the user's creation date.
    /// </summary>
    public required DateTime CreatedAt { get; init; }

    /// <summary>
    /// Gets the user's last login date.
    /// </summary>
    public DateTime? LastLoginAt { get; init; }
}

