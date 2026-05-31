namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// Response DTO for login when email OTP is required.
/// </summary>
public class LoginOtpRequiredResponse
{
    /// <summary>
    /// Gets or sets a value indicating whether email OTP verification is required.
    /// </summary>
    public bool RequiresEmailOtp { get; set; } = true;

    /// <summary>
    /// Gets or sets the user's email (partially masked for security).
    /// </summary>
    /// <example>j***@example.com.</example>
    public string MaskedEmail { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the number of seconds until the OTP can be resent.
    /// </summary>
    public int ResendCooldownSeconds { get; set; }

    /// <summary>
    /// Gets or sets the OTP expiration time in seconds.
    /// </summary>
    public int OtpExpirationSeconds { get; set; } = 300;

    /// <summary>
    /// Gets or sets a message for the user.
    /// </summary>
    public string Message { get; set; } = "A verification code has been sent to your email.";
}

