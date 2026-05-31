namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// Request to verify email with token.
/// </summary>
public class VerifyEmailRequest
{
    /// <summary>
    /// Gets or sets the user ID.
    /// </summary>
    public required string UserId { get; set; }

    /// <summary>
    /// Gets or sets the email verification token.
    /// </summary>
    public required string Token { get; set; }
}

