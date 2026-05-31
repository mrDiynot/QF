using System.Diagnostics.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.Email.DTOs;
using QualiFlow.Application.Features.Email.Services;
using QualiFlow.Application.Features.Onboarding.Services;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service implementation for sending welcome emails after onboarding completion.
/// </summary>
[SuppressMessage("SonarAnalyzer.CSharp", "S1075:URIs should not be hardcoded", Justification = "Email templates use configurable base URL with hardcoded paths")]
public partial class WelcomeEmailService : IWelcomeEmailService
{
    private const string DefaultFromEmail = "welcome@qualiflow.ai";
    private const string DefaultFromName = "QualiFlow Team";
    private const string DefaultFrontendUrl = "http://localhost:3000";

    private readonly IEmailService _emailService;
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<WelcomeEmailService> _logger;
    private readonly string _frontendUrl;

    /// <summary>
    /// Initializes a new instance of the <see cref="WelcomeEmailService"/> class.
    /// </summary>
    public WelcomeEmailService(
        IEmailService emailService,
        QualiFlowDbContext context,
        ILogger<WelcomeEmailService> logger,
        IConfiguration configuration)
    {
        _emailService = emailService;
        _context = context;
        _logger = logger;
        _frontendUrl = configuration.GetValue<string>("App:FrontendUrl") ?? DefaultFrontendUrl;
    }

    /// <inheritdoc />
    public async Task<bool> SendWelcomeEmailAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        // Check if welcome email was already sent (idempotency check)
        var onboardingProgress = await _context.OnboardingProgress
            .Where(op => op.BusinessId == businessId)
            .FirstOrDefaultAsync(cancellationToken);

        if (onboardingProgress?.WelcomeEmailSentAt != null)
        {
            LogWelcomeEmailAlreadySent(_logger, businessId, onboardingProgress.WelcomeEmailSentAt.Value);
            return true; // Return true since email was previously sent successfully
        }

        // Look up business information
        var business = await _context.Businesses
            .AsNoTracking()
            .Where(b => b.Id == businessId && b.DeletedAt == null)
            .Select(b => new { b.Name })
            .FirstOrDefaultAsync(cancellationToken);

        if (business == null)
        {
            LogBusinessNotFound(_logger, businessId);
            return false;
        }

        // Look up the business owner (user with Owner role)
        var owner = await _context.Users
            .AsNoTracking()
            .Where(u => u.BusinessId == businessId && u.DeletedAt == null)
            .Join(_context.UserRoles, u => u.Id, ur => ur.UserId, (u, ur) => new { User = u, ur.RoleId })
            .Join(_context.Roles, x => x.RoleId, r => r.Id, (x, r) => new { x.User, Role = r })
            .Where(x => x.Role.Name == ApplicationRole.Owner)
            .Select(x => new { x.User.Email, x.User.FirstName })
            .FirstOrDefaultAsync(cancellationToken);

        if (owner == null || string.IsNullOrEmpty(owner.Email))
        {
            LogOwnerNotFound(_logger, businessId);
            return false;
        }

        var ownerEmail = owner.Email;
        var ownerFirstName = string.IsNullOrEmpty(owner.FirstName) ? "there" : owner.FirstName;
        var businessName = business.Name;

        LogSendingWelcomeEmail(_logger, businessId, ownerEmail);

        try
        {
            var emailRequest = new SendEmailRequest
            {
                BusinessId = businessId,
                ToEmail = ownerEmail,
                ToName = ownerFirstName,
                FromEmail = DefaultFromEmail,
                FromName = DefaultFromName,
                Subject = $"Welcome to QualiFlow, {ownerFirstName}! 🎉",
                HtmlBody = GenerateWelcomeEmailHtml(ownerFirstName, businessName, _frontendUrl),
                TextBody = GenerateWelcomeEmailText(ownerFirstName, businessName, _frontendUrl),
                Tags = new Dictionary<string, string>
                {
                    ["type"] = "welcome",
                    ["business_id"] = businessId.ToString(),
                },
            };

            await _emailService.SendEmailAsync(emailRequest, cancellationToken);

            // Mark welcome email as sent to prevent duplicates
            if (onboardingProgress != null)
            {
                onboardingProgress.WelcomeEmailSentAt = DateTime.UtcNow;
                await _context.SaveChangesAsync(cancellationToken);
            }

            LogWelcomeEmailSent(_logger, businessId, ownerEmail);
            return true;
        }
        catch (Exception ex)
        {
            LogWelcomeEmailFailed(_logger, businessId, ownerEmail, ex);
            return false;
        }
    }

    private static string GenerateWelcomeEmailHtml(string firstName, string businessName, string frontendUrl)
    {
        // Build AI Readiness Checklist items with clickable links
        // All URLs must point to valid frontend routes
        var checklistItems = EmailTemplateBuilder.NumberedList(
            ("Activate at least one channel (SMS, WhatsApp, or Web Chat)", $"{frontendUrl}/channels"),
            ("Assign a phone number for SMS/Voice", $"{frontendUrl}/channels?setup=sms"),
            ("Enable AI Auto-Response for incoming messages", $"{frontendUrl}/settings/ai-training"),
            ("Configure your AI qualification criteria", $"{frontendUrl}/settings/scoring"),
            ("Add knowledge base articles for better AI responses", $"{frontendUrl}/settings/knowledge-base"));

        // Build onboarding call section content
        var onboardingCallText = EmailTemplateBuilder.Paragraph(
            "Book a <strong>free 30-minute onboarding call</strong> with our team! We'll help you set up your channels, configure AI qualification, and answer any questions.",
            muted: false,
            fontSize: 14);

        var onboardingCallButton =
            "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"margin-top: 12px;\">" +
            "<tr><td align=\"center\">" +
            $"<a href=\"{frontendUrl}/dashboard/onboarding-call\" style=\"display: inline-block; background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;\">📅 Book Onboarding Call</a>" +
            "</td></tr></table>";

        // Build helpful resources (external links stay as-is, internal links use frontendUrl)
        (string text, string url)[] resourceLinks =
        [
            ("Documentation & Guides", "https://docs.qualiflow.com"),
            ("Best Practices Blog", "https://qualiflow.com/blog"),
            ("Contact Support", "mailto:support@qualiflow.com"),
        ];

        var introText = $"Congratulations on completing your onboarding for <strong>{businessName}</strong>! Your account is now fully set up and ready to help you capture, qualify, and convert more leads.";
        var supportText = "If you have any questions or need help getting started, our support team is here for you. Just reply to this email or reach out at <a href=\"mailto:support@qualiflow.com\" style=\"color: #6366f1;\">support@qualiflow.com</a>.";

        var content = string.Concat(
            EmailTemplateBuilder.Header("Welcome to QualiFlow!", "🎉"),
            EmailTemplateBuilder.Greeting(firstName),
            EmailTemplateBuilder.Paragraph(introText),
            EmailTemplateBuilder.HighlightBox("🚀 AI Readiness Checklist", checklistItems),
            EmailTemplateBuilder.Button("View AI Readiness Checklist →", $"{frontendUrl}/dashboard/ai-readiness"),
            EmailTemplateBuilder.InfoBox("📞 Need Personalized Help?", onboardingCallText + onboardingCallButton),
            EmailTemplateBuilder.InfoBox("📚 Helpful Resources", EmailTemplateBuilder.LinkList(resourceLinks)),
            EmailTemplateBuilder.Paragraph(supportText, muted: true, fontSize: 14),
            EmailTemplateBuilder.Signature("Welcome aboard! 🚀", "The QualiFlow Team"));

        return EmailTemplateBuilder.WrapInTemplate("Welcome to QualiFlow", content);
    }

    private static string GenerateWelcomeEmailText(string firstName, string businessName, string frontendUrl)
    {
        return $"""
            Welcome to QualiFlow! 🎉

            Hi {firstName},

            Congratulations on completing your onboarding for {businessName}! Your account is now fully set up and ready to help you capture, qualify, and convert more leads.

            WHAT'S NEXT?
            - Set up your communication channels (SMS, WhatsApp, Web Chat)
            - Configure your AI qualification criteria
            - Import your existing leads or create your first form
            - Invite your team members to collaborate

            Go to your dashboard: {frontendUrl}/dashboard

            HELPFUL RESOURCES
            - Documentation & Guides: https://docs.qualiflow.com
            - Best Practices Blog: https://qualiflow.com/blog
            - Contact Support: support@qualiflow.com

            If you have any questions or need help getting started, our support team is here for you. Just reply to this email or reach out at support@qualiflow.com.

            Welcome aboard! 🚀
            The QualiFlow Team

            ---
            © 2026 QualiFlow. All rights reserved.
            """;
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "Cannot send welcome email: Business {BusinessId} not found")]
    private static partial void LogBusinessNotFound(ILogger logger, Guid businessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Cannot send welcome email: Owner not found for business {BusinessId}")]
    private static partial void LogOwnerNotFound(ILogger logger, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Welcome email already sent for business {BusinessId} at {SentAt} - skipping duplicate")]
    private static partial void LogWelcomeEmailAlreadySent(ILogger logger, Guid businessId, DateTime sentAt);

    [LoggerMessage(Level = LogLevel.Information, Message = "Sending welcome email to business {BusinessId} at {Email}")]
    private static partial void LogSendingWelcomeEmail(ILogger logger, Guid businessId, string email);

    [LoggerMessage(Level = LogLevel.Information, Message = "Welcome email sent successfully to business {BusinessId} at {Email}")]
    private static partial void LogWelcomeEmailSent(ILogger logger, Guid businessId, string email);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to send welcome email to business {BusinessId} at {Email}")]
    private static partial void LogWelcomeEmailFailed(ILogger logger, Guid businessId, string email, Exception ex);
}

