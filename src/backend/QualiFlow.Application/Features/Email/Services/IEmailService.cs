using QualiFlow.Application.Features.Email.DTOs;

namespace QualiFlow.Application.Features.Email.Services;

/// <summary>
/// Service interface for sending emails via Resend.
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Sends a transactional email using a template.
    /// </summary>
    /// <param name="request">The email send request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The Resend email ID.</returns>
    Task<string> SendEmailAsync(SendEmailRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a transactional email using a template with variable substitution.
    /// </summary>
    /// <param name="templateId">The email template ID.</param>
    /// <param name="toEmail">The recipient email address.</param>
    /// <param name="toName">The recipient name.</param>
    /// <param name="variables">Template variables for substitution.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The Resend email ID.</returns>
#pragma warning disable MA0016 // Prefer using collection abstraction instead of implementation - Dictionary required for variable substitution
    Task<string> SendTemplateEmailAsync(
        Guid templateId,
        string toEmail,
        string? toName,
        Dictionary<string, string> variables,
        CancellationToken cancellationToken = default);
#pragma warning restore MA0016

    /// <summary>
    /// Sends a bulk email to multiple recipients (for newsletters/campaigns).
    /// </summary>
    /// <param name="request">The bulk email send request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of Resend email IDs.</returns>
    Task<IReadOnlyList<string>> SendBulkEmailAsync(
        SendBulkEmailRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets email delivery status from Resend.
    /// </summary>
    /// <param name="resendEmailId">The Resend email ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The email status.</returns>
    Task<EmailStatusResponse> GetEmailStatusAsync(
        string resendEmailId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Processes a Resend webhook event (delivery, open, click, bounce).
    /// </summary>
    /// <param name="webhookEvent">The webhook event payload.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task ProcessWebhookEventAsync(
        ResendWebhookEvent webhookEvent,
        CancellationToken cancellationToken = default);

    // ============================================================================
    // SUBSCRIPTION NOTIFICATION EMAILS
    // ============================================================================

    /// <summary>
    /// Sends a trial expiring notification email to the business owner.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="daysRemaining">Number of days remaining in trial.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task SendTrialExpiringNotificationAsync(
        Guid businessId,
        int daysRemaining,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a subscription suspended notification email to the business owner.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="failedAttempts">Number of failed payment attempts.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task SendSubscriptionSuspendedNotificationAsync(
        Guid businessId,
        int failedAttempts,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a payment failed notification email to the business owner.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="invoiceId">The Stripe invoice ID.</param>
    /// <param name="amount">The failed payment amount.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task SendPaymentFailedNotificationAsync(
        Guid businessId,
        string invoiceId,
        decimal amount,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a subscription cancelled notification email to the business owner.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task SendSubscriptionCancelledNotificationAsync(
        Guid businessId,
        CancellationToken cancellationToken = default);
}

