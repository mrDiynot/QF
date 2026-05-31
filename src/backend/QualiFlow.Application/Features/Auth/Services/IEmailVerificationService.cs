namespace QualiFlow.Application.Features.Auth.Services;

/// <summary>
/// Service interface for email verification operations.
/// </summary>
public interface IEmailVerificationService
{
    /// <summary>
    /// Sends a verification email to the user.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="email">The email address.</param>
    /// <param name="firstName">The user's first name.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the email was sent successfully.</returns>
    Task<bool> SendVerificationEmailAsync(
        Guid userId,
        string email,
        string firstName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Verifies a user's email using the provided token.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="token">The verification token.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the email was verified successfully.</returns>
    Task<bool> VerifyEmailAsync(
        string userId,
        string token,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Resends the verification email to the user.
    /// </summary>
    /// <param name="email">The email address.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the email was resent successfully.</returns>
    Task<bool> ResendVerificationEmailAsync(
        string email,
        CancellationToken cancellationToken = default);
}

