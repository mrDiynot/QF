using System.ComponentModel.DataAnnotations;

namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// Request DTO for resetting password with token.
/// </summary>
public record ResetPasswordRequest
{
    /// <summary>
    /// Gets the email address for the account.
    /// </summary>
    [Required]
    [EmailAddress]
    public required string Email { get; init; }

    /// <summary>
    /// Gets the password reset token.
    /// </summary>
    [Required]
    public required string Token { get; init; }

    /// <summary>
    /// Gets the new password.
    /// </summary>
    [Required]
    [MinLength(8)]
    public required string NewPassword { get; init; }
}

