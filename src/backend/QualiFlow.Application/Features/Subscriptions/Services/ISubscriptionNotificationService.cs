namespace QualiFlow.Application.Features.Subscriptions.Services;

/// <summary>
/// Service interface for sending subscription-related notifications.
/// </summary>
public interface ISubscriptionNotificationService
{
    /// <summary>
    /// Sends a subscription confirmation email after successful payment.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="planId">The subscription plan ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task SendSubscriptionConfirmationAsync(
        Guid businessId,
        Guid planId,
        CancellationToken cancellationToken = default);
}
