namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// Response for email verification operations.
/// </summary>
public class EmailVerificationResponse
{
    /// <summary>
    /// Gets or sets a value indicating whether the operation was successful.
    /// </summary>
    public required bool Success { get; set; }

    /// <summary>
    /// Gets or sets the message.
    /// </summary>
    public required string Message { get; set; }

    /// <summary>
    /// Gets or sets the email address (for resend operations).
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// Gets or sets the JWT access token (returned after successful verification).
    /// Valid for 15 minutes.
    /// </summary>
    public string? AccessToken { get; set; }

    /// <summary>
    /// Gets or sets the refresh token (returned after successful verification).
    /// Valid for 7 days. Used to obtain new access tokens.
    /// </summary>
    public string? RefreshToken { get; set; }
}

