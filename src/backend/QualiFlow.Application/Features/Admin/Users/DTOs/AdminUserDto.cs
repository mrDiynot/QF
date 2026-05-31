using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Admin.Users.DTOs;

/// <summary>
/// Data transfer object for admin user information.
/// AdminUser is now independent from ApplicationUser with its own credentials.
/// </summary>
public record AdminUserDto
{
    /// <summary>
    /// Gets the admin user ID.
    /// </summary>
    public required Guid Id { get; init; }

    /// <summary>
    /// Gets the admin's email address.
    /// </summary>
    public required string Email { get; init; }

    /// <summary>
    /// Gets the admin's first name.
    /// </summary>
    public required string FirstName { get; init; }

    /// <summary>
    /// Gets the admin's last name.
    /// </summary>
    public required string LastName { get; init; }

    /// <summary>
    /// Gets the admin's full name.
    /// </summary>
    public required string FullName { get; init; }

    /// <summary>
    /// Gets the admin role.
    /// </summary>
    public required AdminRole Role { get; init; }

    /// <summary>
    /// Gets the list of whitelisted IP addresses.
    /// </summary>
    public required IReadOnlyList<string> IpWhitelist { get; init; }

    /// <summary>
    /// Gets a value indicating whether the admin user is active.
    /// </summary>
    public required bool IsActive { get; init; }

    /// <summary>
    /// Gets a value indicating whether the admin must change password on next login.
    /// </summary>
    public bool MustChangePassword { get; init; }

    /// <summary>
    /// Gets a value indicating whether 2FA is enabled.
    /// </summary>
    public required bool TwoFactorEnabled { get; init; }

    /// <summary>
    /// Gets the date and time when the admin user last logged in.
    /// </summary>
    public DateTime? LastLoginAt { get; init; }

    /// <summary>
    /// Gets the last login IP address.
    /// </summary>
    public string? LastLoginIp { get; init; }

    /// <summary>
    /// Gets the date and time when the admin user was created.
    /// </summary>
    public required DateTime CreatedAt { get; init; }

    /// <summary>
    /// Gets the date and time when the admin user was last updated.
    /// </summary>
    public DateTime? UpdatedAt { get; init; }
}

/// <summary>
/// Request to create a new admin user.
/// Admin users are now created independently with their own credentials.
/// </summary>
public record CreateAdminUserRequest
{
    /// <summary>
    /// Gets the admin's email address.
    /// </summary>
    public required string Email { get; init; }

    /// <summary>
    /// Gets the admin's first name.
    /// </summary>
    public required string FirstName { get; init; }

    /// <summary>
    /// Gets the admin's last name.
    /// </summary>
    public required string LastName { get; init; }

    /// <summary>
    /// Gets the admin role to assign.
    /// </summary>
    public required AdminRole Role { get; init; }

    /// <summary>
    /// Gets the list of whitelisted IP addresses (optional).
    /// </summary>
    public IReadOnlyList<string>? IpWhitelist { get; init; }
}

/// <summary>
/// Response when creating a new admin user.
/// </summary>
public record CreateAdminUserResponse
{
    /// <summary>
    /// Gets the created admin user.
    /// </summary>
    public required AdminUserDto Admin { get; init; }

    /// <summary>
    /// Gets the temporary password (shown only once).
    /// </summary>
    public required string TemporaryPassword { get; init; }
}

/// <summary>
/// Request to update an admin user's role.
/// </summary>
public record UpdateAdminRoleRequest
{
    /// <summary>
    /// Gets the new admin role.
    /// </summary>
    public required AdminRole Role { get; init; }
}

/// <summary>
/// Request to update an admin user's IP whitelist.
/// </summary>
public record UpdateIpWhitelistRequest
{
    /// <summary>
    /// Gets the list of whitelisted IP addresses.
    /// </summary>
    public required IReadOnlyList<string> IpWhitelist { get; init; }
}

/// <summary>
/// Query parameters for listing admin users.
/// </summary>
public record AdminUserQuery
{
    /// <summary>
    /// Gets the page number (1-based).
    /// </summary>
    public int Page { get; init; } = 1;

    /// <summary>
    /// Gets the page size.
    /// </summary>
    public int PageSize { get; init; } = 10;

    /// <summary>
    /// Gets the search term (searches email and name).
    /// </summary>
    public string? SearchTerm { get; init; }

    /// <summary>
    /// Gets the role filter.
    /// </summary>
    public AdminRole? Role { get; init; }

    /// <summary>
    /// Gets the active status filter.
    /// </summary>
    public bool? IsActive { get; init; }
}
