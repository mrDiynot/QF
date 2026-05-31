using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.Email.DTOs;
using QualiFlow.Application.Features.Email.Services;
using QualiFlow.Application.Features.Subscriptions.Services;
using QualiFlow.Infrastructure.Constants;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for sending subscription-related notifications.
/// </summary>
public partial class SubscriptionNotificationService : ISubscriptionNotificationService
{
    private readonly QualiFlowDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<SubscriptionNotificationService> _logger;

    public SubscriptionNotificationService(
        QualiFlowDbContext context,
        IEmailService emailService,
        ILogger<SubscriptionNotificationService> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task SendSubscriptionConfirmationAsync(
        Guid businessId,
        Guid planId,
        CancellationToken cancellationToken = default)
    {
        LogSendingConfirmation(_logger, businessId, planId);

        // Get business with users
        var business = await _context.Businesses
            .Include(b => b.Users)
            .Include(b => b.Subscription)
            .FirstOrDefaultAsync(b => b.Id == businessId, cancellationToken);

        if (business == null)
        {
            LogBusinessNotFound(_logger, businessId);
            return;
        }

        // Get plan details
        var plan = await _context.SubscriptionPlans
            .Include(p => p.Features)
                .ThenInclude(pf => pf.Feature)
            .FirstOrDefaultAsync(p => p.Id == planId, cancellationToken);

        if (plan == null)
        {
            LogPlanNotFound(_logger, planId);
            return;
        }

        // Get the first user (owner) of the business
        var owner = business.Users.FirstOrDefault();
        var ownerEmail = owner?.Email ?? business.Email;
        var ownerName = owner?.FirstName ?? "Valued Customer";

        if (string.IsNullOrEmpty(ownerEmail))
        {
            LogNoOwnerEmail(_logger, businessId);
            return;
        }

        // Get subscription dates
        var subscriptionStart = business.Subscription?.CurrentPeriodStart ?? DateTime.UtcNow;
        var subscriptionEnd = business.Subscription?.CurrentPeriodEnd ?? DateTime.UtcNow.AddMonths(1);
        var yearlyPrice = plan.PriceYearly ?? plan.PriceMonthly * 12;
        var billingInterval = business.Subscription?.MonthlyAmount == yearlyPrice / 12 ? "Yearly" : "Monthly";
        var amount = billingInterval == "Yearly" ? yearlyPrice : plan.PriceMonthly;

        // Get features list
        var features = plan.Features
            .Where(pf => pf.Feature != null)
            .Select(pf => pf.Feature!.DisplayName ?? pf.Feature.FeatureKey)
            .Take(10)
            .ToList();

        var additionalFeaturesCount = plan.Features.Count - features.Count;

        // Build the email HTML
        var htmlBody = BuildSubscriptionConfirmationEmail(
            ownerName,
            business.Name,
            plan.DisplayName ?? plan.Name,
            billingInterval,
            amount,
            subscriptionStart,
            subscriptionEnd,
            features,
            additionalFeaturesCount);

        var textBody = BuildSubscriptionConfirmationText(
            ownerName,
            business.Name,
            plan.DisplayName ?? plan.Name,
            billingInterval,
            amount,
            subscriptionStart,
            subscriptionEnd,
            features);

        var emailRequest = new SendEmailRequest
        {
            ToEmail = ownerEmail,
            ToName = ownerName,
            FromEmail = EmailConstants.NoReplyEmail,
            FromName = EmailConstants.FromName,
            Subject = $"Welcome to {plan.DisplayName ?? plan.Name}! Your Subscription is Active",
            HtmlBody = htmlBody,
            TextBody = textBody,
            BusinessId = businessId,
            Tags = new Dictionary<string, string>
            {
                { "type", "subscription_confirmation" },
                { "plan", plan.Name }
            }
        };

        try
        {
            await _emailService.SendEmailAsync(emailRequest, cancellationToken);
            LogConfirmationSent(_logger, businessId, ownerEmail);
        }
        catch (Exception ex)
        {
            LogConfirmationFailed(_logger, businessId, ownerEmail, ex.Message);
        }
    }

    private static string BuildSubscriptionConfirmationEmail(
        string customerName,
        string businessName,
        string planName,
        string billingInterval,
        decimal amount,
        DateTime startDate,
        DateTime endDate,
        List<string> features,
        int additionalFeaturesCount)
    {
        var featuresHtml = string.Join(string.Empty, features.Select(f => $@"
            <tr>
              <td style=""padding: 8px 0; border-bottom: 1px solid #f3f4f6;"">
                <span style=""color: #10b981; margin-right: 8px;"">✓</span>
                <span style=""color: #374151;"">{f}</span>
              </td>
            </tr>"));

        var additionalText = additionalFeaturesCount > 0
            ? $@"<tr><td style=""padding: 12px 0; color: #6b7280; font-size: 14px;"">+{additionalFeaturesCount} more features included</td></tr>"
            : string.Empty;

        return $@"
<!DOCTYPE html>
<html>
<head>
  <meta charset=""utf-8"">
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
  <title>Subscription Confirmation</title>
</head>
<body style=""margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;"">
  <table role=""presentation"" style=""width: 100%; border-collapse: collapse;"">
    <tr>
      <td style=""padding: 40px 20px;"">
        <table role=""presentation"" style=""max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;"">
          
          <!-- Header -->
          <tr>
            <td style=""background: linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f97316 100%); padding: 40px 32px; text-align: center;"">
              <img src=""https://qualiflow.ai/logo-white.png"" alt=""QualiFlow"" style=""height: 40px; margin-bottom: 20px;"" />
              <h1 style=""color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px 0;"">Payment Successful!</h1>
              <p style=""color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0;"">Welcome to QualiFlow. Your subscription is now active.</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style=""padding: 32px;"">
              <p style=""color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;"">
                Hi {customerName},
              </p>
              <p style=""color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;"">
                Thank you for subscribing to QualiFlow! Your <strong>{planName}</strong> subscription for <strong>{businessName}</strong> is now active.
              </p>

              <!-- Plan Card -->
              <table role=""presentation"" style=""width: 100%; background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); border-radius: 12px; margin-bottom: 24px;"">
                <tr>
                  <td style=""padding: 24px;"">
                    <table role=""presentation"" style=""width: 100%;"">
                      <tr>
                        <td>
                          <p style=""color: rgba(255, 255, 255, 0.8); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;"">Your Plan</p>
                          <h2 style=""color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;"">{planName}</h2>
                          <p style=""color: rgba(255, 255, 255, 0.9); font-size: 14px; margin: 8px 0 0 0;"">{billingInterval} Subscription for {businessName}</p>
                        </td>
                        <td style=""text-align: right; vertical-align: top;"">
                          <p style=""color: #ffffff; font-size: 32px; font-weight: 700; margin: 0;"">${amount:F2}</p>
                          <p style=""color: rgba(255, 255, 255, 0.8); font-size: 14px; margin: 4px 0 0 0;"">/{billingInterval.ToLower(CultureInfo.InvariantCulture)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Billing Details -->
              <table role=""presentation"" style=""width: 100%; background-color: #f9fafb; border-radius: 12px; margin-bottom: 24px;"">
                <tr>
                  <td style=""padding: 20px;"">
                    <table role=""presentation"" style=""width: 100%;"">
                      <tr>
                        <td style=""width: 50%; padding-right: 12px;"">
                          <p style=""color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0;"">Billing Started</p>
                          <p style=""color: #111827; font-size: 16px; font-weight: 600; margin: 0;"">{startDate:MMMM d, yyyy}</p>
                        </td>
                        <td style=""width: 50%; padding-left: 12px; border-left: 1px solid #e5e7eb;"">
                          <p style=""color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0;"">Next Billing</p>
                          <p style=""color: #111827; font-size: 16px; font-weight: 600; margin: 0;"">{endDate:MMMM d, yyyy}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Features -->
              <h3 style=""color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;"">Features Included</h3>
              <table role=""presentation"" style=""width: 100%; margin-bottom: 24px;"">
                {featuresHtml}
                {additionalText}
              </table>

              <!-- CTA Button -->
              <table role=""presentation"" style=""width: 100%;"">
                <tr>
                  <td style=""text-align: center; padding: 16px 0;"">
                    <a href=""https://app.qualiflow.ai/dashboard"" style=""display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f97316 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 600;"">
                      Go to Dashboard →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Help -->
              <table role=""presentation"" style=""width: 100%; background-color: #fef3c7; border-radius: 12px; margin-top: 24px;"">
                <tr>
                  <td style=""padding: 16px 20px;"">
                    <p style=""color: #92400e; font-size: 14px; margin: 0;"">
                      <strong>Need help getting started?</strong> Our support team is here to help you set up your channels and start qualifying leads. 
                      <a href=""mailto:support@qualiflow.ai"" style=""color: #7c3aed; text-decoration: none;"">Contact Support</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style=""background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;"">
              <p style=""color: #6b7280; font-size: 14px; margin: 0 0 8px 0;"">
                © {DateTime.UtcNow.Year} QualiFlow. All rights reserved.
              </p>
              <p style=""color: #9ca3af; font-size: 12px; margin: 0;"">
                You're receiving this email because you subscribed to QualiFlow.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>";
    }

    private static string BuildSubscriptionConfirmationText(
        string customerName,
        string businessName,
        string planName,
        string billingInterval,
        decimal amount,
        DateTime startDate,
        DateTime endDate,
        List<string> features)
    {
        var featuresText = string.Join("\n", features.Select(f => $"  ✓ {f}"));

        return $@"
Payment Successful!

Hi {customerName},

Thank you for subscribing to QualiFlow! Your {planName} subscription for {businessName} is now active.

SUBSCRIPTION DETAILS
--------------------
Plan: {planName}
Amount: ${amount:F2}/{billingInterval.ToLower(CultureInfo.InvariantCulture)}
Billing Started: {startDate:MMMM d, yyyy}
Next Billing: {endDate:MMMM d, yyyy}

FEATURES INCLUDED
-----------------
{featuresText}

Get started now: https://app.qualiflow.ai/dashboard

Need help? Contact us at support@qualiflow.ai

© {DateTime.UtcNow.Year} QualiFlow. All rights reserved.
";
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Sending subscription confirmation for business {BusinessId} with plan {PlanId}")]
    private static partial void LogSendingConfirmation(ILogger logger, Guid businessId, Guid planId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Business {BusinessId} not found for subscription confirmation")]
    private static partial void LogBusinessNotFound(ILogger logger, Guid businessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Plan {PlanId} not found for subscription confirmation")]
    private static partial void LogPlanNotFound(ILogger logger, Guid planId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "No owner email found for business {BusinessId}")]
    private static partial void LogNoOwnerEmail(ILogger logger, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Subscription confirmation sent to {Email} for business {BusinessId}")]
    private static partial void LogConfirmationSent(ILogger logger, Guid businessId, string email);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to send subscription confirmation to {Email} for business {BusinessId}: {Error}")]
    private static partial void LogConfirmationFailed(ILogger logger, Guid businessId, string email, string error);
}
