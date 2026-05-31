using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Email.DTOs;
using QualiFlow.Application.Features.Email.Services;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Constants;
using QualiFlow.Infrastructure.Data;
using QualiFlow.Infrastructure.Data.Repositories;

using Resend;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service implementation for sending emails via Resend.
/// </summary>
public partial class EmailService : IEmailService
{
    private readonly IResend _resend;
    private readonly IEmailLogRepository _emailLogRepository;
    private readonly IEmailTemplateRepository _emailTemplateRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly QualiFlowDbContext _dbContext;
    private readonly ILogger<EmailService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="EmailService"/> class.
    /// </summary>
    /// <param name="resend">The Resend client.</param>
    /// <param name="emailLogRepository">The email log repository.</param>
    /// <param name="emailTemplateRepository">The email template repository.</param>
    /// <param name="currentUserService">The current user service.</param>
    /// <param name="dbContext">The database context for subscription notifications.</param>
    /// <param name="logger">The logger.</param>
    public EmailService(
        IResend resend,
        IEmailLogRepository emailLogRepository,
        IEmailTemplateRepository emailTemplateRepository,
        ICurrentUserService currentUserService,
        QualiFlowDbContext dbContext,
        ILogger<EmailService> logger)
    {
        _resend = resend;
        _emailLogRepository = emailLogRepository;
        _emailTemplateRepository = emailTemplateRepository;
        _currentUserService = currentUserService;
        _dbContext = dbContext;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<string> SendEmailAsync(SendEmailRequest request, CancellationToken cancellationToken = default)
    {
        // Use provided BusinessId for system emails (e.g., verification), otherwise use current user's business
        Guid? businessId = request.BusinessId;
        if (businessId == null)
        {
            // Try to get business ID from current user, but don't throw if not available
            businessId = _currentUserService.TryGetBusinessId();
        }

        LogSendingEmail(_logger, businessId ?? Guid.Empty, request.ToEmail, request.Subject);

        // IMPORTANT: Resend test mode requires plain email addresses (no display names)
        // When sending to the same email in test mode, use plain format
        var message = new EmailMessage
        {
            From = request.FromEmail, // Use plain email for test mode compatibility
            To = request.ToEmail,     // Use plain email for test mode compatibility
            Subject = request.Subject,
            HtmlBody = request.HtmlBody,
            TextBody = request.TextBody,
        };

        if (!string.IsNullOrEmpty(request.ReplyTo))
        {
            message.ReplyTo = request.ReplyTo;
        }

        // Add CC recipients if provided
        if (!string.IsNullOrEmpty(request.CcEmail))
        {
            message.Cc = request.CcEmail;
        }

        // Convert tags to Resend format if provided
        if (request.Tags != null && request.Tags.Count > 0)
        {
            message.Tags = request.Tags.Select(kvp => new EmailTag { Name = kvp.Key, Value = kvp.Value }).ToList();
        }

        var response = await _resend.EmailSendAsync(message, cancellationToken);

        if (response == null)
        {
            LogEmailSendFailed(_logger, businessId ?? Guid.Empty, request.ToEmail, "No response from Resend");
            throw new InvalidOperationException("Failed to send email via Resend");
        }

        // The Resend SDK returns the email ID in the Content property (a Guid)
        var resendEmailId = response.Content == Guid.Empty
            ? Guid.NewGuid().ToString() // Fallback for test mode when Resend returns empty ID
            : response.Content.ToString();

        // Create email log only if we have a business ID (for multi-tenancy compliance)
        if (businessId.HasValue)
        {
            var emailLog = new EmailLog
            {
                BusinessId = businessId.Value,
                ResendEmailId = resendEmailId,
                ToEmail = request.ToEmail,
                ToName = request.ToName,
                FromEmail = request.FromEmail,
                FromName = request.FromName,
                Subject = request.Subject,
                Status = Domain.Entities.EmailStatus.Sent,
                SentAt = DateTime.UtcNow,
            };

            await _emailLogRepository.CreateAsync(emailLog, cancellationToken);
        }

        LogEmailSent(_logger, businessId ?? Guid.Empty, request.ToEmail, resendEmailId);

        return resendEmailId;
    }

    /// <inheritdoc />
    public async Task<string> SendTemplateEmailAsync(
        Guid templateId,
        string toEmail,
        string? toName,
        Dictionary<string, string> variables,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        LogSendingTemplateEmail(_logger, businessId, templateId, toEmail);

        var template = await _emailTemplateRepository.GetByIdAsync(templateId, cancellationToken);
        if (template == null)
        {
            LogTemplateNotFound(_logger, templateId, businessId);
            throw new InvalidOperationException($"Email template {templateId} not found");
        }

        if (!template.IsActive)
        {
            LogTemplateInactive(_logger, templateId, businessId);
            throw new InvalidOperationException($"Email template {templateId} is inactive");
        }

        // Substitute variables in subject and body
        var subject = SubstituteVariables(template.Subject, variables);
        var htmlBody = SubstituteVariables(template.HtmlBody, variables);
        var textBody = template.TextBody != null ? SubstituteVariables(template.TextBody, variables) : null;

        var request = new SendEmailRequest
        {
            ToEmail = toEmail,
            ToName = toName,
            FromEmail = EmailConstants.NoReplyEmail, // FUTURE: Make configurable per business
            FromName = EmailConstants.FromName,
            Subject = subject,
            HtmlBody = htmlBody,
            TextBody = textBody,
        };

        var resendEmailId = await SendEmailAsync(request, cancellationToken);

        // Update email log with template ID
        var emailLog = await _emailLogRepository.GetByResendEmailIdAsync(resendEmailId, cancellationToken);
        if (emailLog != null)
        {
            emailLog.EmailTemplateId = templateId;
            await _emailLogRepository.UpdateAsync(emailLog, cancellationToken);
        }

        return resendEmailId;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<string>> SendBulkEmailAsync(
        SendBulkEmailRequest request,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        LogSendingBulkEmail(_logger, businessId, request.Recipients.Count);

        var emailIds = new List<string>();

        foreach (var recipient in request.Recipients)
        {
            var htmlBody = request.HtmlBody;
            var textBody = request.TextBody;

            // Substitute variables if provided
            if (recipient.Variables != null && recipient.Variables.Count > 0)
            {
                htmlBody = SubstituteVariables(htmlBody, recipient.Variables);
                if (textBody != null)
                {
                    textBody = SubstituteVariables(textBody, recipient.Variables);
                }
            }

            var emailRequest = new SendEmailRequest
            {
                ToEmail = recipient.Email,
                ToName = recipient.Name,
                FromEmail = request.FromEmail,
                FromName = request.FromName,
                Subject = request.Subject,
                HtmlBody = htmlBody,
                TextBody = textBody,
            };

            var emailId = await SendEmailAsync(emailRequest, cancellationToken);
            emailIds.Add(emailId);
        }

        LogBulkEmailSent(_logger, businessId, emailIds.Count);

        return emailIds.AsReadOnly();
    }

    /// <inheritdoc />
    public async Task<EmailStatusResponse> GetEmailStatusAsync(
        string resendEmailId,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        LogGettingEmailStatus(_logger, businessId, resendEmailId);

        var emailLog = await _emailLogRepository.GetByResendEmailIdAsync(resendEmailId, cancellationToken);
        if (emailLog == null)
        {
            LogEmailLogNotFound(_logger, resendEmailId, businessId);
            throw new InvalidOperationException($"Email log for Resend email ID {resendEmailId} not found");
        }

        return new EmailStatusResponse
        {
            ResendEmailId = emailLog.ResendEmailId,
            Status = emailLog.Status.ToString(),
            SentAt = emailLog.SentAt,
            DeliveredAt = emailLog.DeliveredAt,
            OpenedAt = emailLog.OpenedAt,
            ClickedAt = emailLog.ClickedAt,
        };
    }

    /// <inheritdoc />
    public async Task ProcessWebhookEventAsync(
        ResendWebhookEvent webhookEvent,
        CancellationToken cancellationToken = default)
    {
        LogProcessingWebhookEvent(_logger, webhookEvent.Type, webhookEvent.EmailId);

        var emailLog = await _emailLogRepository.GetByResendEmailIdAsync(webhookEvent.EmailId, cancellationToken);
        if (emailLog == null)
        {
            LogEmailLogNotFound(_logger, webhookEvent.EmailId, Guid.Empty);
            return; // Silently ignore if email log not found
        }

        switch (webhookEvent.Type)
        {
            case "email.delivered":
                emailLog.Status = Domain.Entities.EmailStatus.Delivered;
                emailLog.DeliveredAt = webhookEvent.CreatedAt;
                break;

            case "email.opened":
                emailLog.Status = Domain.Entities.EmailStatus.Opened;
                emailLog.OpenedAt ??= webhookEvent.CreatedAt;
                emailLog.OpenCount++;
                break;

            case "email.clicked":
                emailLog.Status = Domain.Entities.EmailStatus.Clicked;
                emailLog.ClickedAt ??= webhookEvent.CreatedAt;
                emailLog.ClickCount++;
                break;

            case "email.bounced":
                emailLog.Status = Domain.Entities.EmailStatus.Bounced;
                emailLog.BouncedAt = webhookEvent.CreatedAt;
                emailLog.BounceReason = webhookEvent.Data?.GetValueOrDefault("reason")?.ToString();
                break;

            default:
                LogUnknownWebhookEvent(_logger, webhookEvent.Type);
                return;
        }

        await _emailLogRepository.UpdateAsync(emailLog, cancellationToken);

        LogWebhookEventProcessed(_logger, webhookEvent.Type, webhookEvent.EmailId);
    }

    private static string SubstituteVariables(string template, Dictionary<string, string> variables)
    {
        var result = template;
        foreach (var (key, value) in variables)
        {
            result = result.Replace($"{{{{{key}}}}}", value, StringComparison.OrdinalIgnoreCase);
        }

        return result;
    }
}

