using System.Globalization;
using Microsoft.EntityFrameworkCore;
using QualiFlow.Application.Features.Email.DTOs;
using QualiFlow.Infrastructure.Constants;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Partial class for EmailService containing subscription notification email methods.
/// </summary>
#pragma warning disable CA1863 // Use CompositeFormat - simple format operations don't need caching
public partial class EmailService
{
    /// <inheritdoc />
    public async Task SendTrialExpiringNotificationAsync(
        Guid businessId,
        int daysRemaining,
        CancellationToken cancellationToken = default)
    {
        // Get business and owner information
        var businessInfo = await GetBusinessNotificationInfoAsync(businessId, cancellationToken);
        if (businessInfo == null)
        {
            LogEmailSendFailed(_logger, businessId, "unknown", "Business or owner not found for trial expiring notification");
            return;
        }

        var (ownerEmail, ownerName, businessName, planName, planDisplayName) = businessInfo.Value;

        var htmlBody = BuildTrialExpiringHtml(ownerName, businessName, daysRemaining, planDisplayName ?? planName);
        var textBody = BuildTrialExpiringText(ownerName, businessName, daysRemaining, planDisplayName ?? planName);

        var emailRequest = new SendEmailRequest
        {
            ToEmail = ownerEmail,
            ToName = ownerName,
            FromEmail = EmailConstants.NoReplyEmail,
            FromName = EmailConstants.FromName,
            Subject = string.Format(CultureInfo.InvariantCulture, EmailConstants.TrialExpiringSubject, daysRemaining),
            HtmlBody = htmlBody,
            TextBody = textBody,
            BusinessId = businessId,
            Tags = new Dictionary<string, string>
            {
                { "type", EmailConstants.TagTypeTrialExpiring },
                { "days_remaining", daysRemaining.ToString(CultureInfo.InvariantCulture) }
            }
        };

        try
        {
            await SendEmailAsync(emailRequest, cancellationToken);
            LogEmailSent(_logger, businessId, ownerEmail, "trial_expiring");
        }
        catch (Exception ex)
        {
            LogEmailSendFailed(_logger, businessId, ownerEmail, ex.Message);
        }
    }

    /// <inheritdoc />
    public async Task SendSubscriptionSuspendedNotificationAsync(
        Guid businessId,
        int failedAttempts,
        CancellationToken cancellationToken = default)
    {
        var businessInfo = await GetBusinessNotificationInfoAsync(businessId, cancellationToken);
        if (businessInfo == null)
        {
            LogEmailSendFailed(_logger, businessId, "unknown", "Business or owner not found for suspended notification");
            return;
        }

        var (ownerEmail, ownerName, businessName, planName, planDisplayName) = businessInfo.Value;

        var htmlBody = BuildSubscriptionSuspendedHtml(ownerName, businessName, failedAttempts, planDisplayName ?? planName);
        var textBody = BuildSubscriptionSuspendedText(ownerName, businessName, failedAttempts, planDisplayName ?? planName);

        var emailRequest = new SendEmailRequest
        {
            ToEmail = ownerEmail,
            ToName = ownerName,
            FromEmail = EmailConstants.NoReplyEmail,
            FromName = EmailConstants.FromName,
            Subject = EmailConstants.SubscriptionSuspendedSubject,
            HtmlBody = htmlBody,
            TextBody = textBody,
            BusinessId = businessId,
            Tags = new Dictionary<string, string>
            {
                { "type", EmailConstants.TagTypeSubscriptionSuspended },
                { "failed_attempts", failedAttempts.ToString(CultureInfo.InvariantCulture) }
            }
        };

        try
        {
            await SendEmailAsync(emailRequest, cancellationToken);
            LogEmailSent(_logger, businessId, ownerEmail, "subscription_suspended");
        }
        catch (Exception ex)
        {
            LogEmailSendFailed(_logger, businessId, ownerEmail, ex.Message);
        }
    }

    /// <inheritdoc />
    public async Task SendPaymentFailedNotificationAsync(
        Guid businessId,
        string invoiceId,
        decimal amount,
        CancellationToken cancellationToken = default)
    {
        var businessInfo = await GetBusinessNotificationInfoAsync(businessId, cancellationToken);
        if (businessInfo == null)
        {
            LogEmailSendFailed(_logger, businessId, "unknown", "Business or owner not found for payment failed notification");
            return;
        }

        var (ownerEmail, ownerName, businessName, planName, planDisplayName) = businessInfo.Value;

        var htmlBody = BuildPaymentFailedHtml(ownerName, businessName, amount, planDisplayName ?? planName);
        var textBody = BuildPaymentFailedText(ownerName, businessName, amount, planDisplayName ?? planName);

        var emailRequest = new SendEmailRequest
        {
            ToEmail = ownerEmail,
            ToName = ownerName,
            FromEmail = EmailConstants.NoReplyEmail,
            FromName = EmailConstants.FromName,
            Subject = EmailConstants.PaymentFailedSubject,
            HtmlBody = htmlBody,
            TextBody = textBody,
            BusinessId = businessId,
            Tags = new Dictionary<string, string>
            {
                { "type", EmailConstants.TagTypePaymentFailed },
                { "invoice_id", invoiceId }
            }
        };

        try
        {
            await SendEmailAsync(emailRequest, cancellationToken);
            LogEmailSent(_logger, businessId, ownerEmail, "payment_failed");
        }
        catch (Exception ex)
        {
            LogEmailSendFailed(_logger, businessId, ownerEmail, ex.Message);
        }
    }

    /// <inheritdoc />
    public async Task SendSubscriptionCancelledNotificationAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        var businessInfo = await GetBusinessNotificationInfoAsync(businessId, cancellationToken);
        if (businessInfo == null)
        {
            LogEmailSendFailed(_logger, businessId, "unknown", "Business or owner not found for cancellation notification");
            return;
        }

        var (ownerEmail, ownerName, businessName, planName, planDisplayName) = businessInfo.Value;

        var htmlBody = BuildSubscriptionCancelledHtml(ownerName, businessName, planDisplayName ?? planName);
        var textBody = BuildSubscriptionCancelledText(ownerName, businessName, planDisplayName ?? planName);

        var emailRequest = new SendEmailRequest
        {
            ToEmail = ownerEmail,
            ToName = ownerName,
            FromEmail = EmailConstants.NoReplyEmail,
            FromName = EmailConstants.FromName,
            Subject = EmailConstants.SubscriptionCancelledSubject,
            HtmlBody = htmlBody,
            TextBody = textBody,
            BusinessId = businessId,
            Tags = new Dictionary<string, string>
            {
                { "type", EmailConstants.TagTypeSubscriptionCancelled }
            }
        };

        try
        {
            await SendEmailAsync(emailRequest, cancellationToken);
            LogEmailSent(_logger, businessId, ownerEmail, "subscription_cancelled");
        }
        catch (Exception ex)
        {
            LogEmailSendFailed(_logger, businessId, ownerEmail, ex.Message);
        }
    }
}
#pragma warning restore CA1863

