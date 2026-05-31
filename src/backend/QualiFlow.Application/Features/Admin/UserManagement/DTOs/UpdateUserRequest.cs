namespace QualiFlow.Application.Features.Admin.UserManagement.DTOs;

/// <summary>
/// Request to update a user's information.
/// </summary>
public class UpdateUserRequest
{
    /// <summary>
    /// Gets or sets the user's first name.
    /// </summary>
    public string? FirstName { get; set; }

    /// <summary>
    /// Gets or sets the user's last name.
    /// </summary>
    public string? LastName { get; set; }

    /// <summary>
    /// Gets or sets the user's email.
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// Gets or sets the user's phone number.
    /// </summary>
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// Gets or sets the user's role.
    /// </summary>
    public string? Role { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the user is active.
    /// </summary>
    public bool? IsActive { get; set; }
}

