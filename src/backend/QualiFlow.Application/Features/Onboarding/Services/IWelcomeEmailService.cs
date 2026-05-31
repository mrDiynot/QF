namespace QualiFlow.Application.Features.Onboarding.Services;

/// <summary>
/// Service interface for sending welcome emails after onboarding completion.
/// </summary>
public interface IWelcomeEmailService
{
    /// <summary>
    /// Sends a welcome email to the business owner after onboarding completion.
    /// Automatically looks up the business and owner information from the database.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the email was sent successfully.</returns>
    Task<bool> SendWelcomeEmailAsync(
        Guid businessId,
        CancellationToken cancellationToken = default);
}

