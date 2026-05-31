namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// Request to resend verification email.
/// </summary>
public class ResendVerificationEmailRequest
{
    /// <summary>
    /// Gets or sets the user's email address.
    /// </summary>
    public required string Email { get; set; }
}

