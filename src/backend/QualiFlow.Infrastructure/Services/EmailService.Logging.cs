using Microsoft.Extensions.Logging;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Logging partial class for EmailService.
/// </summary>
public partial class EmailService
{
    [LoggerMessage(
        EventId = 1,
        Level = LogLevel.Information,
        Message = "Sending email to {ToEmail} with subject '{Subject}' for business {BusinessId}")]
    private static partial void LogSendingEmail(ILogger logger, Guid businessId, string toEmail, string subject);

    [LoggerMessage(
        EventId = 2,
        Level = LogLevel.Information,
        Message = "Email sent successfully to {ToEmail} with Resend ID {ResendEmailId} for business {BusinessId}")]
    private static partial void LogEmailSent(ILogger logger, Guid businessId, string toEmail, string resendEmailId);

    [LoggerMessage(
        EventId = 3,
        Level = LogLevel.Error,
        Message = "Failed to send email to {ToEmail} for business {BusinessId}: {ErrorMessage}")]
    private static partial void LogEmailSendFailed(ILogger logger, Guid businessId, string toEmail, string errorMessage);

    [LoggerMessage(
        EventId = 4,
        Level = LogLevel.Information,
        Message = "Sending template email using template {TemplateId} to {ToEmail} for business {BusinessId}")]
    private static partial void LogSendingTemplateEmail(ILogger logger, Guid businessId, Guid templateId, string toEmail);

    [LoggerMessage(
        EventId = 5,
        Level = LogLevel.Warning,
        Message = "Email template {TemplateId} not found for business {BusinessId}")]
    private static partial void LogTemplateNotFound(ILogger logger, Guid templateId, Guid businessId);

    [LoggerMessage(
        EventId = 6,
        Level = LogLevel.Warning,
        Message = "Email template {TemplateId} is inactive for business {BusinessId}")]
    private static partial void LogTemplateInactive(ILogger logger, Guid templateId, Guid businessId);

    [LoggerMessage(
        EventId = 7,
        Level = LogLevel.Information,
        Message = "Sending bulk email to {RecipientCount} recipients for business {BusinessId}")]
    private static partial void LogSendingBulkEmail(ILogger logger, Guid businessId, int recipientCount);

    [LoggerMessage(
        EventId = 8,
        Level = LogLevel.Information,
        Message = "Bulk email sent successfully to {EmailCount} recipients for business {BusinessId}")]
    private static partial void LogBulkEmailSent(ILogger logger, Guid businessId, int emailCount);

    [LoggerMessage(
        EventId = 9,
        Level = LogLevel.Information,
        Message = "Getting email status for Resend email ID {ResendEmailId} for business {BusinessId}")]
    private static partial void LogGettingEmailStatus(ILogger logger, Guid businessId, string resendEmailId);

    [LoggerMessage(
        EventId = 10,
        Level = LogLevel.Warning,
        Message = "Email log not found for Resend email ID {ResendEmailId} for business {BusinessId}")]
    private static partial void LogEmailLogNotFound(ILogger logger, string resendEmailId, Guid businessId);

    [LoggerMessage(
        EventId = 11,
        Level = LogLevel.Information,
        Message = "Processing Resend webhook event {EventType} for email ID {EmailId}")]
    private static partial void LogProcessingWebhookEvent(ILogger logger, string eventType, string emailId);

    [LoggerMessage(
        EventId = 12,
        Level = LogLevel.Information,
        Message = "Webhook event {EventType} processed successfully for email ID {EmailId}")]
    private static partial void LogWebhookEventProcessed(ILogger logger, string eventType, string emailId);

    [LoggerMessage(
        EventId = 13,
        Level = LogLevel.Warning,
        Message = "Unknown webhook event type: {EventType}")]
    private static partial void LogUnknownWebhookEvent(ILogger logger, string eventType);
}

