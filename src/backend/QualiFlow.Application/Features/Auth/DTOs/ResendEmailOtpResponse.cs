namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// Response DTO for resend OTP operation.
/// </summary>
public class ResendEmailOtpResponse
{
    /// <summary>
    /// Gets or sets a value indicating whether the OTP was sent successfully.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Gets or sets the number of seconds until the OTP can be resent again.
    /// </summary>
    public int ResendCooldownSeconds { get; set; }

    /// <summary>
    /// Gets or sets a message for the user.
    /// </summary>
    public string Message { get; set; } = string.Empty;
}

