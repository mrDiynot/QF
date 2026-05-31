using System.ComponentModel.DataAnnotations;

namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// Request DTO for initiating password reset.
/// </summary>
public record ForgotPasswordRequest
{
    /// <summary>
    /// Gets the email address for password reset.
    /// </summary>
    [Required]
    [EmailAddress]
    public required string Email { get; init; }
}

