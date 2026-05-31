namespace QualiFlow.Application.Features.Auth.Services;

/// <summary>
/// Service interface for email-based OTP authentication.
/// Handles OTP generation, validation, and email delivery.
/// </summary>
public interface IEmailOtpService
{
    /// <summary>
    /// Generates a new OTP for the specified user and sends it via email.
    /// Invalidates any previous unused OTPs for the same user.
    /// </summary>
    /// <param name="userId">The user's ID.</param>
    /// <param name="email">The user's email address.</param>
    /// <param name="firstName">The user's first name for personalization.</param>
    /// <param name="ipAddress">The IP address requesting the OTP.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if OTP was generated and sent successfully.</returns>
    Task<bool> GenerateAndSendOtpAsync(
        Guid userId,
        string email,
        string firstName,
        string? ipAddress,
        CancellationToken cancellationToken);

    /// <summary>
    /// Verifies the OTP code for the specified user.
    /// </summary>
    /// <param name="email">The user's email address.</param>
    /// <param name="otpCode">The 6-digit OTP code.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The user ID if verification succeeds, null otherwise.</returns>
    Task<Guid?> VerifyOtpAsync(
        string email,
        string otpCode,
        CancellationToken cancellationToken);

    /// <summary>
    /// Checks if the user can request a new OTP (rate limiting).
    /// Max 5 OTP generation requests per hour per user.
    /// </summary>
    /// <param name="userId">The user's ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if user can request a new OTP.</returns>
    Task<bool> CanRequestOtpAsync(Guid userId, CancellationToken cancellationToken);

    /// <summary>
    /// Checks if the user can attempt OTP verification (rate limiting).
    /// Max 3 OTP verification attempts per 15 minutes per user.
    /// </summary>
    /// <param name="userId">The user's ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if user can attempt verification.</returns>
    Task<bool> CanAttemptVerificationAsync(Guid userId, CancellationToken cancellationToken);

    /// <summary>
    /// Gets the remaining seconds until the user can resend OTP.
    /// </summary>
    /// <param name="userId">The user's ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Seconds remaining, or 0 if can resend now.</returns>
    Task<int> GetResendCooldownSecondsAsync(Guid userId, CancellationToken cancellationToken);
}

