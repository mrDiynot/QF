// -----------------------------------------------------------------------
// <copyright file="SupportTicketNotificationService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Globalization;
using System.Text;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

using QualiFlow.Application.Features.Email.DTOs;
using QualiFlow.Application.Features.Email.Services;
using QualiFlow.Application.Features.Support;
using QualiFlow.Application.Features.Support.DTOs;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Constants;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for sending support ticket email notifications.
/// </summary>
public partial class SupportTicketNotificationService : ISupportTicketNotificationService
{
    private const string BaseStyles = @"
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .ticket-info { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .label { font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; }
            .value { margin-bottom: 10px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            .priority-critical { color: #dc2626; }
            .priority-high { color: #ea580c; }
            .priority-medium { color: #ca8a04; }
            .priority-low { color: #16a34a; }
        ";

    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SupportTicketNotificationService> _logger;

    private readonly string _supportPortalUrl;
    private readonly string _adminPortalUrl;
    private readonly string _fromEmail;
    private readonly string _fromName;
    private readonly string _supportInbox;

    /// <summary>
    /// Initializes a new instance of the <see cref="SupportTicketNotificationService"/> class.
    /// </summary>
    public SupportTicketNotificationService(
        IEmailService emailService,
        IConfiguration configuration,
        ILogger<SupportTicketNotificationService> logger)
    {
        _emailService = emailService;
        _configuration = configuration;
        _logger = logger;

        _supportPortalUrl = configuration["Support:PortalUrl"] ?? "https://support.qualiflow.ai";
        _adminPortalUrl = configuration["Support:AdminPortalUrl"] ?? "https://admin.qualiflow.ai";
        _fromEmail = configuration["Support:FromEmail"] ?? EmailConstants.SupportEmail;
        _fromName = configuration["Support:FromName"] ?? "QualiFlow Support";
        _supportInbox = configuration["Support:SupportInbox"] ?? EmailConstants.SupportEmail;
    }

    /// <inheritdoc />
    public async Task SendTicketCreatedNotificationAsync(
        SupportTicketDto ticket,
        CancellationToken cancellationToken = default)
    {
        LogSendingTicketCreatedNotification(_logger, ticket.TicketNumber, ticket.ReporterEmail);

        try
        {
            var htmlBody = BuildTicketCreatedEmail(ticket);

            var request = new SendEmailRequest
            {
                ToEmail = ticket.ReporterEmail,
                ToName = ticket.ReporterName,
                FromEmail = _fromEmail,
                FromName = _fromName,
                Subject = $"[{ticket.TicketNumber}] Support Ticket Created: {ticket.Subject}",
                HtmlBody = htmlBody,
                BusinessId = ticket.BusinessId,
                Tags = new Dictionary<string, string>
                {
                    ["ticket_number"] = ticket.TicketNumber,
                    ["notification_type"] = "ticket_created",
                },
            };

            await _emailService.SendEmailAsync(request, cancellationToken);
            LogNotificationSent(_logger, "ticket_created", ticket.TicketNumber, ticket.ReporterEmail);
        }
        catch (Exception ex)
        {
            LogNotificationFailed(_logger, "ticket_created", ticket.TicketNumber, ex.Message);
        }
    }

    /// <inheritdoc />
    public async Task SendTicketAssignedNotificationAsync(
        SupportTicketDto ticket,
        string adminEmail,
        string adminName,
        CancellationToken cancellationToken = default)
    {
        LogSendingAssignedNotification(_logger, ticket.TicketNumber, adminEmail);

        try
        {
            var htmlBody = BuildTicketAssignedEmail(ticket, adminName);

            var request = new SendEmailRequest
            {
                ToEmail = adminEmail,
                ToName = adminName,
                FromEmail = _fromEmail,
                FromName = _fromName,
                Subject = $"[{ticket.TicketNumber}] Ticket Assigned to You: {ticket.Subject}",
                HtmlBody = htmlBody,
                Tags = new Dictionary<string, string>
                {
                    ["ticket_number"] = ticket.TicketNumber,
                    ["notification_type"] = "ticket_assigned",
                },
            };

            await _emailService.SendEmailAsync(request, cancellationToken);
            LogNotificationSent(_logger, "ticket_assigned", ticket.TicketNumber, adminEmail);
        }
        catch (Exception ex)
        {
            LogNotificationFailed(_logger, "ticket_assigned", ticket.TicketNumber, ex.Message);
        }
    }

    /// <inheritdoc />
    public async Task SendStatusUpdateNotificationAsync(
        SupportTicketDto ticket,
        string previousStatus,
        string? note = null,
        CancellationToken cancellationToken = default)
    {
        LogSendingStatusUpdateNotification(_logger, ticket.TicketNumber, ticket.Status.ToString());

        try
        {
            var htmlBody = BuildStatusUpdateEmail(ticket, previousStatus, note);

            var request = new SendEmailRequest
            {
                ToEmail = ticket.ReporterEmail,
                ToName = ticket.ReporterName,
                FromEmail = _fromEmail,
                FromName = _fromName,
                Subject = $"[{ticket.TicketNumber}] Status Update: {ticket.Status}",
                HtmlBody = htmlBody,
                BusinessId = ticket.BusinessId,
                Tags = new Dictionary<string, string>
                {
                    ["ticket_number"] = ticket.TicketNumber,
                    ["notification_type"] = "status_update",
                    ["new_status"] = ticket.Status.ToString(),
                },
            };

            await _emailService.SendEmailAsync(request, cancellationToken);
            LogNotificationSent(_logger, "status_update", ticket.TicketNumber, ticket.ReporterEmail);
        }
        catch (Exception ex)
        {
            LogNotificationFailed(_logger, "status_update", ticket.TicketNumber, ex.Message);
        }
    }

    /// <inheritdoc />
    public async Task SendNewMessageNotificationAsync(
        SupportTicketDto ticket,
        TicketMessageDto message,
        CancellationToken cancellationToken = default)
    {
        // Don't send notifications for internal notes
        if (message.IsInternal)
        {
            return;
        }

        // Determine recipient - if admin sent, notify customer; if customer sent, notify assigned admin
        string recipientEmail;
        string recipientName;
        string notificationType;

        if (message.IsSentByAdmin)
        {
            // Admin sent message, notify customer
            recipientEmail = ticket.ReporterEmail;
            recipientName = ticket.ReporterName;
            notificationType = "new_message_to_customer";
        }
        else
        {
            // Customer sent message, notify support inbox (admin email lookup would require additional service)
            recipientEmail = _supportInbox;
            recipientName = ticket.AssignedToAdminName ?? "Support Team";
            notificationType = "new_message_to_admin";
        }

        LogSendingNewMessageNotification(_logger, ticket.TicketNumber, recipientEmail);

        try
        {
            var htmlBody = BuildNewMessageEmail(ticket, message);

            var request = new SendEmailRequest
            {
                ToEmail = recipientEmail,
                ToName = recipientName,
                FromEmail = _fromEmail,
                FromName = _fromName,
                Subject = $"[{ticket.TicketNumber}] New Message: {ticket.Subject}",
                HtmlBody = htmlBody,
                BusinessId = message.IsSentByAdmin ? ticket.BusinessId : null,
                Tags = new Dictionary<string, string>
                {
                    ["ticket_number"] = ticket.TicketNumber,
                    ["notification_type"] = notificationType,
                },
            };

            await _emailService.SendEmailAsync(request, cancellationToken);
            LogNotificationSent(_logger, notificationType, ticket.TicketNumber, recipientEmail);
        }
        catch (Exception ex)
        {
            LogNotificationFailed(_logger, notificationType, ticket.TicketNumber, ex.Message);
        }
    }

    /// <inheritdoc />
    public async Task SendSlaWarningNotificationAsync(
        SupportTicketDto ticket,
        string adminEmail,
        int minutesRemaining,
        CancellationToken cancellationToken = default)
    {
        LogSendingSlaWarning(_logger, ticket.TicketNumber, minutesRemaining);

        try
        {
            var htmlBody = BuildSlaWarningEmail(ticket, minutesRemaining);

            var request = new SendEmailRequest
            {
                ToEmail = adminEmail,
                FromEmail = _fromEmail,
                FromName = _fromName,
                Subject = $"[URGENT] [{ticket.TicketNumber}] SLA Warning: {minutesRemaining} minutes remaining",
                HtmlBody = htmlBody,
                Tags = new Dictionary<string, string>
                {
                    ["ticket_number"] = ticket.TicketNumber,
                    ["notification_type"] = "sla_warning",
                },
            };

            await _emailService.SendEmailAsync(request, cancellationToken);
            LogNotificationSent(_logger, "sla_warning", ticket.TicketNumber, adminEmail);
        }
        catch (Exception ex)
        {
            LogNotificationFailed(_logger, "sla_warning", ticket.TicketNumber, ex.Message);
        }
    }

    /// <inheritdoc />
    public async Task SendSlaBreachedNotificationAsync(
        SupportTicketDto ticket,
        string adminEmail,
        CancellationToken cancellationToken = default)
    {
        LogSendingSlaBreached(_logger, ticket.TicketNumber);

        try
        {
            var htmlBody = BuildSlaBreachedEmail(ticket);

            var request = new SendEmailRequest
            {
                ToEmail = adminEmail,
                FromEmail = _fromEmail,
                FromName = _fromName,
                Subject = $"[SLA BREACH] [{ticket.TicketNumber}] SLA has been breached",
                HtmlBody = htmlBody,
                Tags = new Dictionary<string, string>
                {
                    ["ticket_number"] = ticket.TicketNumber,
                    ["notification_type"] = "sla_breached",
                },
            };

            await _emailService.SendEmailAsync(request, cancellationToken);
            LogNotificationSent(_logger, "sla_breached", ticket.TicketNumber, adminEmail);
        }
        catch (Exception ex)
        {
            LogNotificationFailed(_logger, "sla_breached", ticket.TicketNumber, ex.Message);
        }
    }

    private string BuildTicketCreatedEmail(SupportTicketDto ticket)
    {
        var ticketUrl = $"{_supportPortalUrl}/tickets/{ticket.Id}";
        var priorityClass = $"priority-{ticket.Priority.ToString().ToLowerInvariant()}";

        var sb = new StringBuilder();
        sb.AppendLine("<!DOCTYPE html><html><head><style>");
        sb.AppendLine(BaseStyles);
        sb.AppendLine(".header { background: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }");
        sb.AppendLine(".button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }");
        sb.AppendLine("</style></head><body><div class=\"container\">");

        sb.AppendLine("<div class=\"header\">");
        sb.AppendLine("<h1 style=\"margin: 0;\">Support Ticket Created</h1>");
        sb.AppendLine($"<p style=\"margin: 5px 0 0 0; opacity: 0.9;\">Ticket #{ticket.TicketNumber}</p>");
        sb.AppendLine("</div>");

        sb.AppendLine("<div class=\"content\">");
        sb.AppendLine($"<p>Hi {ticket.ReporterName},</p>");
        sb.AppendLine("<p>Thank you for contacting QualiFlow Support. Your support ticket has been created and our team will review it shortly.</p>");

        sb.AppendLine("<div class=\"ticket-info\">");
        sb.AppendLine("<div class=\"label\">Subject</div>");
        sb.AppendLine($"<div class=\"value\">{ticket.Subject}</div>");
        sb.AppendLine("<div class=\"label\">Category</div>");
        sb.AppendLine($"<div class=\"value\">{FormatCategory(ticket.Category)}</div>");
        sb.AppendLine("<div class=\"label\">Priority</div>");
        sb.AppendLine($"<div class=\"value {priorityClass}\">{ticket.Priority}</div>");
        sb.AppendLine("<div class=\"label\">Description</div>");
        sb.AppendLine($"<div class=\"value\">{ticket.Description}</div>");
        sb.AppendLine("</div>");

        sb.AppendLine("<p>You can track the status of your ticket and add additional information by clicking the button below:</p>");
        sb.AppendLine($"<a href=\"{ticketUrl}\" class=\"button\">View Ticket</a>");
        sb.AppendLine($"<p style=\"margin-top: 20px; color: #6b7280; font-size: 14px;\">Our support team typically responds within {GetSlaResponseTime(ticket.Priority)}.</p>");
        sb.AppendLine("</div>");

        sb.AppendLine("<div class=\"footer\">");
        sb.AppendLine("<p>This is an automated message from QualiFlow Support.</p>");
        sb.AppendLine("<p>If you did not create this ticket, please ignore this email.</p>");
        sb.AppendLine("</div></div></body></html>");

        return sb.ToString();
    }

    private string BuildTicketAssignedEmail(SupportTicketDto ticket, string adminName)
    {
        var ticketUrl = $"{_adminPortalUrl}/support/tickets/{ticket.Id}";
        var priorityClass = $"priority-{ticket.Priority.ToString().ToLowerInvariant()}";

        var sb = new StringBuilder();
        sb.AppendLine("<!DOCTYPE html><html><head><style>");
        sb.AppendLine(BaseStyles);
        sb.AppendLine(".header { background: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0; }");
        sb.AppendLine(".button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }");
        sb.AppendLine(".sla-info { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 15px 0; }");
        sb.AppendLine("</style></head><body><div class=\"container\">");

        sb.AppendLine("<div class=\"header\">");
        sb.AppendLine("<h1 style=\"margin: 0;\">Ticket Assigned to You</h1>");
        sb.AppendLine($"<p style=\"margin: 5px 0 0 0; opacity: 0.9;\">#{ticket.TicketNumber}</p>");
        sb.AppendLine("</div>");

        sb.AppendLine("<div class=\"content\">");
        sb.AppendLine($"<p>Hi {adminName},</p>");
        sb.AppendLine("<p>A support ticket has been assigned to you:</p>");

        sb.AppendLine("<div class=\"ticket-info\">");
        sb.AppendLine("<div class=\"label\">Subject</div>");
        sb.AppendLine($"<div class=\"value\">{ticket.Subject}</div>");
        sb.AppendLine("<div class=\"label\">Customer</div>");
        sb.AppendLine($"<div class=\"value\">{ticket.ReporterName} ({ticket.ReporterEmail})</div>");
        sb.AppendLine("<div class=\"label\">Category</div>");
        sb.AppendLine($"<div class=\"value\">{FormatCategory(ticket.Category)}</div>");
        sb.AppendLine("<div class=\"label\">Priority</div>");
        sb.AppendLine($"<div class=\"value {priorityClass}\">{ticket.Priority}</div>");
        sb.AppendLine("</div>");

        if (ticket.FirstResponseDue.HasValue)
        {
            sb.AppendLine("<div class=\"sla-info\">");
            sb.AppendLine(CultureInfo.InvariantCulture, $"<strong>SLA Reminder:</strong> First response due by {ticket.FirstResponseDue.Value:g} UTC");
            sb.AppendLine("</div>");
        }

        sb.AppendLine($"<a href=\"{ticketUrl}\" class=\"button\">View &amp; Respond</a>");
        sb.AppendLine("</div></div></body></html>");

        return sb.ToString();
    }

    private string BuildStatusUpdateEmail(SupportTicketDto ticket, string previousStatus, string? note)
    {
        var ticketUrl = $"{_supportPortalUrl}/tickets/{ticket.Id}";
        var statusColor = ticket.Status switch
        {
            TicketStatus.Resolved => "#16a34a",
            TicketStatus.Closed => "#6b7280",
            TicketStatus.InProgress => "#4F46E5",
            TicketStatus.AwaitingCustomer => "#f59e0b",
            _ => "#333",
        };

        var sb = new StringBuilder();
        sb.AppendLine("<!DOCTYPE html><html><head><style>");
        sb.AppendLine(BaseStyles);
        sb.AppendLine($".header {{ background: {statusColor}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }}");
        sb.AppendLine(".status-change { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; text-align: center; }");
        sb.AppendLine(".status { font-size: 18px; padding: 8px 16px; border-radius: 20px; display: inline-block; }");
        sb.AppendLine(".arrow { font-size: 24px; margin: 0 15px; color: #9ca3af; }");
        sb.AppendLine($".note {{ background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid {statusColor}; }}");
        sb.AppendLine(".button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }");
        sb.AppendLine("</style></head><body><div class=\"container\">");

        sb.AppendLine("<div class=\"header\">");
        sb.AppendLine("<h1 style=\"margin: 0;\">Ticket Status Updated</h1>");
        sb.AppendLine($"<p style=\"margin: 5px 0 0 0; opacity: 0.9;\">#{ticket.TicketNumber}</p>");
        sb.AppendLine("</div>");

        sb.AppendLine("<div class=\"content\">");
        sb.AppendLine($"<p>Hi {ticket.ReporterName},</p>");
        sb.AppendLine("<p>The status of your support ticket has been updated:</p>");

        sb.AppendLine("<div class=\"status-change\">");
        sb.AppendLine($"<span class=\"status\" style=\"background: #e5e7eb; color: #6b7280;\">{previousStatus}</span>");
        sb.AppendLine("<span class=\"arrow\">&rarr;</span>");
        sb.AppendLine($"<span class=\"status\" style=\"background: {statusColor}; color: white;\">{ticket.Status}</span>");
        sb.AppendLine("</div>");

        sb.AppendLine($"<p><strong>Subject:</strong> {ticket.Subject}</p>");

        if (!string.IsNullOrEmpty(note))
        {
            sb.AppendLine("<div class=\"note\">");
            sb.AppendLine($"<strong>Note from support:</strong><br/>{note}");
            sb.AppendLine("</div>");
        }

        if (ticket.Status == TicketStatus.AwaitingCustomer)
        {
            sb.AppendLine("<p style=\"color: #f59e0b;\"><strong>Action Required:</strong> We need additional information from you to proceed with this ticket.</p>");
        }

        sb.AppendLine($"<a href=\"{ticketUrl}\" class=\"button\">View Ticket</a>");
        sb.AppendLine("</div>");

        sb.AppendLine("<div class=\"footer\">");
        sb.AppendLine("<p>This is an automated message from QualiFlow Support.</p>");
        sb.AppendLine("</div></div></body></html>");

        return sb.ToString();
    }

    private string BuildNewMessageEmail(SupportTicketDto ticket, TicketMessageDto message)
    {
        var ticketUrl = message.IsSentByAdmin
            ? $"{_supportPortalUrl}/tickets/{ticket.Id}"
            : $"{_adminPortalUrl}/support/tickets/{ticket.Id}";

        var headerColor = message.IsSentByAdmin ? "#4F46E5" : "#059669";
        var headerText = message.IsSentByAdmin
            ? "New Response on Your Ticket"
            : "Customer Reply Received";

        var sb = new StringBuilder();
        sb.AppendLine("<!DOCTYPE html><html><head><style>");
        sb.AppendLine(BaseStyles);
        sb.AppendLine($".header {{ background: {headerColor}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }}");
        sb.AppendLine($".message-box {{ background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid {headerColor}; }}");
        sb.AppendLine(".message-meta { color: #6b7280; font-size: 12px; margin-bottom: 10px; }");
        sb.AppendLine($".button {{ display: inline-block; background: {headerColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }}");
        sb.AppendLine("</style></head><body><div class=\"container\">");

        sb.AppendLine("<div class=\"header\">");
        sb.AppendLine($"<h1 style=\"margin: 0;\">{headerText}</h1>");
        sb.AppendLine($"<p style=\"margin: 5px 0 0 0; opacity: 0.9;\">#{ticket.TicketNumber}: {ticket.Subject}</p>");
        sb.AppendLine("</div>");

        sb.AppendLine("<div class=\"content\">");
        sb.AppendLine("<div class=\"message-box\">");
        sb.AppendLine("<div class=\"message-meta\">");
        sb.AppendLine(CultureInfo.InvariantCulture, $"<strong>{message.SenderName}</strong> &bull; {message.CreatedAt:g} UTC");
        sb.AppendLine("</div>");
        sb.AppendLine("<div class=\"message-content\">");
        sb.AppendLine(message.Content.Replace("\n", "<br/>", StringComparison.Ordinal));
        sb.AppendLine("</div></div>");

        sb.AppendLine($"<a href=\"{ticketUrl}\" class=\"button\">Reply to Ticket</a>");
        sb.AppendLine("</div>");

        sb.AppendLine("<div class=\"footer\">");
        sb.AppendLine("<p>This is an automated message from QualiFlow Support.</p>");
        sb.AppendLine("</div></div></body></html>");

        return sb.ToString();
    }

    private string BuildSlaWarningEmail(SupportTicketDto ticket, int minutesRemaining)
    {
        var ticketUrl = $"{_adminPortalUrl}/support/tickets/{ticket.Id}";
        var timeText = minutesRemaining >= 60
            ? $"{minutesRemaining / 60} hour(s) and {minutesRemaining % 60} minutes"
            : $"{minutesRemaining} minutes";

        var sb = new StringBuilder();
        sb.AppendLine("<!DOCTYPE html><html><head><style>");
        sb.AppendLine(BaseStyles);
        sb.AppendLine(".header { background: #f59e0b; color: white; padding: 20px; border-radius: 8px 8px 0 0; }");
        sb.AppendLine(".content { background: #fffbeb; padding: 20px; border: 1px solid #f59e0b; }");
        sb.AppendLine(".warning-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; text-align: center; }");
        sb.AppendLine(".countdown { font-size: 32px; font-weight: 700; color: #f59e0b; }");
        sb.AppendLine(".button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; font-weight: 600; }");
        sb.AppendLine("</style></head><body><div class=\"container\">");

        sb.AppendLine("<div class=\"header\">");
        sb.AppendLine("<h1 style=\"margin: 0;\">SLA Warning</h1>");
        sb.AppendLine($"<p style=\"margin: 5px 0 0 0; opacity: 0.9;\">Ticket #{ticket.TicketNumber}</p>");
        sb.AppendLine("</div>");

        sb.AppendLine("<div class=\"content\">");
        sb.AppendLine("<div class=\"warning-box\">");
        sb.AppendLine("<p style=\"margin: 0; color: #92400e;\">Time remaining before SLA breach:</p>");
        sb.AppendLine($"<div class=\"countdown\">{timeText}</div>");
        sb.AppendLine("</div>");

        sb.AppendLine("<div class=\"ticket-info\">");
        sb.AppendLine("<div class=\"label\">Subject</div>");
        sb.AppendLine($"<div class=\"value\">{ticket.Subject}</div>");
        sb.AppendLine("<div class=\"label\">Customer</div>");
        sb.AppendLine($"<div class=\"value\">{ticket.ReporterName}</div>");
        sb.AppendLine("<div class=\"label\">Priority</div>");
        sb.AppendLine($"<div class=\"value\" style=\"color: #dc2626; font-weight: 600;\">{ticket.Priority}</div>");
        sb.AppendLine("<div class=\"label\">Current Status</div>");
        sb.AppendLine($"<div class=\"value\">{ticket.Status}</div>");
        sb.AppendLine("</div>");

        sb.AppendLine("<p style=\"text-align: center;\">");
        sb.AppendLine($"<a href=\"{ticketUrl}\" class=\"button\">Respond Now</a>");
        sb.AppendLine("</p></div></div></body></html>");

        return sb.ToString();
    }

    private string BuildSlaBreachedEmail(SupportTicketDto ticket)
    {
        var ticketUrl = $"{_adminPortalUrl}/support/tickets/{ticket.Id}";

        var sb = new StringBuilder();
        sb.AppendLine("<!DOCTYPE html><html><head><style>");
        sb.AppendLine(BaseStyles);
        sb.AppendLine(".header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }");
        sb.AppendLine(".content { background: #fef2f2; padding: 20px; border: 1px solid #dc2626; }");
        sb.AppendLine(".breach-notice { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; text-align: center; border: 2px solid #dc2626; }");
        sb.AppendLine(".button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; font-weight: 600; }");
        sb.AppendLine("</style></head><body><div class=\"container\">");

        sb.AppendLine("<div class=\"header\">");
        sb.AppendLine("<h1 style=\"margin: 0;\">SLA BREACHED</h1>");
        sb.AppendLine($"<p style=\"margin: 5px 0 0 0; opacity: 0.9;\">Ticket #{ticket.TicketNumber}</p>");
        sb.AppendLine("</div>");

        sb.AppendLine("<div class=\"content\">");
        sb.AppendLine("<div class=\"breach-notice\">");
        sb.AppendLine("<p style=\"margin: 0; font-size: 18px; font-weight: 600; color: #dc2626;\">This ticket has exceeded its SLA response time.</p>");
        sb.AppendLine("<p style=\"margin: 10px 0 0 0; color: #6b7280;\">Immediate action is required.</p>");
        sb.AppendLine("</div>");

        sb.AppendLine("<div class=\"ticket-info\">");
        sb.AppendLine("<div class=\"label\">Subject</div>");
        sb.AppendLine($"<div class=\"value\">{ticket.Subject}</div>");
        sb.AppendLine("<div class=\"label\">Customer</div>");
        sb.AppendLine($"<div class=\"value\">{ticket.ReporterName} ({ticket.ReporterEmail})</div>");
        sb.AppendLine("<div class=\"label\">Priority</div>");
        sb.AppendLine($"<div class=\"value\" style=\"color: #dc2626; font-weight: 600;\">{ticket.Priority}</div>");
        sb.AppendLine("<div class=\"label\">First Response Was Due</div>");
        sb.AppendLine(CultureInfo.InvariantCulture, $"<div class=\"value\" style=\"color: #dc2626;\">{ticket.FirstResponseDue:g} UTC</div>");
        sb.AppendLine("<div class=\"label\">Time Since Creation</div>");
        sb.AppendLine($"<div class=\"value\">{GetTimeSinceCreation(ticket.CreatedAt)}</div>");
        sb.AppendLine("</div>");

        sb.AppendLine("<p style=\"text-align: center;\">");
        sb.AppendLine($"<a href=\"{ticketUrl}\" class=\"button\">Take Action Now</a>");
        sb.AppendLine("</p></div></div></body></html>");

        return sb.ToString();
    }

    private static string FormatCategory(TicketCategory category)
    {
        return category switch
        {
            TicketCategory.TechnicalSupport => "Technical Support",
            TicketCategory.BillingInquiry => "Billing Inquiry",
            TicketCategory.FeatureRequest => "Feature Request",
            TicketCategory.AccountIssue => "Account Issue",
            TicketCategory.GeneralQuestion => "General Question",
            _ => category.ToString(),
        };
    }

    private static string GetSlaResponseTime(TicketPriority priority)
    {
        return priority switch
        {
            TicketPriority.Critical => "1 hour",
            TicketPriority.High => "4 hours",
            TicketPriority.Medium => "24 hours",
            TicketPriority.Low => "72 hours",
            _ => "24 hours",
        };
    }

    private static string GetTimeSinceCreation(DateTime createdAt)
    {
        var elapsed = DateTime.UtcNow - createdAt;
        if (elapsed.TotalDays >= 1)
        {
            return $"{(int)elapsed.TotalDays} day(s), {elapsed.Hours} hour(s)";
        }

        if (elapsed.TotalHours >= 1)
        {
            return $"{(int)elapsed.TotalHours} hour(s), {elapsed.Minutes} minute(s)";
        }

        return $"{(int)elapsed.TotalMinutes} minute(s)";
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Sending ticket created notification for {TicketNumber} to {Email}")]
    private static partial void LogSendingTicketCreatedNotification(ILogger logger, string ticketNumber, string email);

    [LoggerMessage(Level = LogLevel.Information, Message = "Sending ticket assigned notification for {TicketNumber} to {Email}")]
    private static partial void LogSendingAssignedNotification(ILogger logger, string ticketNumber, string email);

    [LoggerMessage(Level = LogLevel.Information, Message = "Sending status update notification for {TicketNumber}, new status: {Status}")]
    private static partial void LogSendingStatusUpdateNotification(ILogger logger, string ticketNumber, string status);

    [LoggerMessage(Level = LogLevel.Information, Message = "Sending new message notification for {TicketNumber} to {Email}")]
    private static partial void LogSendingNewMessageNotification(ILogger logger, string ticketNumber, string email);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Sending SLA warning for {TicketNumber}, {MinutesRemaining} minutes remaining")]
    private static partial void LogSendingSlaWarning(ILogger logger, string ticketNumber, int minutesRemaining);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Sending SLA breached notification for {TicketNumber}")]
    private static partial void LogSendingSlaBreached(ILogger logger, string ticketNumber);

    [LoggerMessage(Level = LogLevel.Information, Message = "Notification {Type} sent successfully for {TicketNumber} to {Email}")]
    private static partial void LogNotificationSent(ILogger logger, string type, string ticketNumber, string email);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to send notification {Type} for {TicketNumber}: {Error}")]
    private static partial void LogNotificationFailed(ILogger logger, string type, string ticketNumber, string error);
}
