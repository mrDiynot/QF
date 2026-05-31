using System.Globalization;
using Microsoft.EntityFrameworkCore;
using QualiFlow.Infrastructure.Constants;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Partial class for EmailService containing subscription email HTML templates.
/// </summary>
#pragma warning disable SA1122 // Use string.Empty for empty strings - empty strings in ternary operators are intentional for HTML templates
public partial class EmailService
{
    /// <summary>
    /// Gets business and owner information for notification emails.
    /// </summary>
#pragma warning disable SA1316 // Tuple element names should use correct casing - PascalCase is more readable for named tuples
    private async Task<(string OwnerEmail, string OwnerName, string BusinessName, string PlanName, string? PlanDisplayName)?> GetBusinessNotificationInfoAsync(
        Guid businessId,
        CancellationToken cancellationToken)
    {
        // Get business with users and subscription
        var business = await _dbContext.Businesses
            .Include(b => b.Users)
            .Include(b => b.Subscription)
                .ThenInclude(s => s!.Plan)
            .FirstOrDefaultAsync(b => b.Id == businessId, cancellationToken);

        if (business == null)
        {
            return null;
        }

        // Get the first user (owner) of the business
        var owner = business.Users.FirstOrDefault();
        var ownerEmail = owner?.Email ?? business.Email;
        var ownerName = owner?.FirstName ?? "Valued Customer";

        if (string.IsNullOrEmpty(ownerEmail))
        {
            return null;
        }

        var planName = business.Subscription?.Plan?.Name ?? "Free Flow";
        var planDisplayName = business.Subscription?.Plan?.DisplayName;

        return (ownerEmail, ownerName, business.Name, planName, planDisplayName);
    }
#pragma warning restore SA1316

    // ============================================================================
    // TRIAL EXPIRING EMAIL TEMPLATES
    // ============================================================================

#pragma warning disable S1172 // Unused method parameters - planName reserved for future template customization
    private static string BuildTrialExpiringHtml(string customerName, string businessName, int daysRemaining, string planName)
    {
        var urgencyColor = daysRemaining <= 1 ? "#ef4444" : "#f59e0b"; // Red for 1 day, amber otherwise

        return $@"
<!DOCTYPE html>
<html>
<head>
  <meta charset=""utf-8"">
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
  <title>Trial Expiring</title>
</head>
<body style=""margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;"">
  <table role=""presentation"" style=""width: 100%; border-collapse: collapse;"">
    <tr>
      <td style=""padding: 40px 20px;"">
        <table role=""presentation"" style=""max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;"">
          
          <!-- Header -->
          <tr>
            <td style=""background: linear-gradient(135deg, {urgencyColor} 0%, #f97316 100%); padding: 40px 32px; text-align: center;"">
              <img src=""https://qualiflow.ai/logo-white.png"" alt=""QualiFlow"" style=""height: 40px; margin-bottom: 20px;"" />
              <h1 style=""color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px 0;"">Your Trial Expires in {daysRemaining} Day{(daysRemaining != 1 ? "s" : "")}</h1>
              <p style=""color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0;"">Don't lose access to your lead qualification tools</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style=""padding: 32px;"">
              <p style=""color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;"">
                Hi {customerName},
              </p>
              <p style=""color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;"">
                Your free trial for <strong>{businessName}</strong> will expire in <strong>{daysRemaining} day{(daysRemaining != 1 ? "s" : "")}</strong>. 
                To continue using QualiFlow and keep qualifying your leads, upgrade to a paid plan now.
              </p>

              <!-- Urgency Box -->
              <table role=""presentation"" style=""width: 100%; background-color: #fef3c7; border-radius: 12px; margin-bottom: 24px;"">
                <tr>
                  <td style=""padding: 20px;"">
                    <p style=""color: #92400e; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;"">⏰ What happens when your trial ends?</p>
                    <ul style=""color: #78350f; font-size: 14px; margin: 0; padding-left: 20px;"">
                      <li style=""margin-bottom: 4px;"">You'll lose access to AI lead qualification</li>
                      <li style=""margin-bottom: 4px;"">Existing conversations will be paused</li>
                      <li style=""margin-bottom: 4px;"">Your data will be preserved for 30 days</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role=""presentation"" style=""width: 100%;"">
                <tr>
                  <td style=""text-align: center; padding: 16px 0;"">
                    <a href=""{EmailConstants.PricingUrl}"" style=""display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f97316 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 600;"">
                      View Plans & Upgrade →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Help -->
              <table role=""presentation"" style=""width: 100%; background-color: #f3f4f6; border-radius: 12px; margin-top: 24px;"">
                <tr>
                  <td style=""padding: 16px 20px;"">
                    <p style=""color: #4b5563; font-size: 14px; margin: 0;"">
                      <strong>Questions?</strong> Reply to this email or contact us at 
                      <a href=""mailto:{EmailConstants.SupportEmail}"" style=""color: #7c3aed; text-decoration: none;"">{EmailConstants.SupportEmail}</a>
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
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>";
    }

    private static string BuildTrialExpiringText(string customerName, string businessName, int daysRemaining, string planName)
    {
        return $@"
Your Trial Expires in {daysRemaining} Day{(daysRemaining != 1 ? "s" : "")}

Hi {customerName},

Your free trial for {businessName} will expire in {daysRemaining} day{(daysRemaining != 1 ? "s" : "")}.

To continue using QualiFlow and keep qualifying your leads, upgrade to a paid plan now.

WHAT HAPPENS WHEN YOUR TRIAL ENDS?
- You'll lose access to AI lead qualification
- Existing conversations will be paused
- Your data will be preserved for 30 days

Upgrade now: {EmailConstants.PricingUrl}

Questions? Contact us at {EmailConstants.SupportEmail}

© {DateTime.UtcNow.Year} QualiFlow. All rights reserved.
";
    }
#pragma warning restore S1172

    // ============================================================================
    // SUBSCRIPTION SUSPENDED EMAIL TEMPLATES
    // ============================================================================

    private static string BuildSubscriptionSuspendedHtml(string customerName, string businessName, int failedAttempts, string planName)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
  <meta charset=""utf-8"">
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
  <title>Subscription Suspended</title>
</head>
<body style=""margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;"">
  <table role=""presentation"" style=""width: 100%; border-collapse: collapse;"">
    <tr>
      <td style=""padding: 40px 20px;"">
        <table role=""presentation"" style=""max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;"">

          <!-- Header -->
          <tr>
            <td style=""background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 32px; text-align: center;"">
              <img src=""https://qualiflow.ai/logo-white.png"" alt=""QualiFlow"" style=""height: 40px; margin-bottom: 20px;"" />
              <h1 style=""color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px 0;"">Action Required</h1>
              <p style=""color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0;"">Your subscription has been suspended</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style=""padding: 32px;"">
              <p style=""color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;"">
                Hi {customerName},
              </p>
              <p style=""color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;"">
                We were unable to process payment for your <strong>{planName}</strong> subscription for <strong>{businessName}</strong>
                after {failedAttempts} attempt{(failedAttempts != 1 ? "s" : "")}. Your subscription has been temporarily suspended.
              </p>

              <!-- Warning Box -->
              <table role=""presentation"" style=""width: 100%; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; margin-bottom: 24px;"">
                <tr>
                  <td style=""padding: 20px;"">
                    <p style=""color: #991b1b; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;"">⚠️ While suspended:</p>
                    <ul style=""color: #b91c1c; font-size: 14px; margin: 0; padding-left: 20px;"">
                      <li style=""margin-bottom: 4px;"">AI lead qualification is paused</li>
                      <li style=""margin-bottom: 4px;"">New conversations won't be processed</li>
                      <li style=""margin-bottom: 4px;"">Your data remains safe and accessible</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role=""presentation"" style=""width: 100%;"">
                <tr>
                  <td style=""text-align: center; padding: 16px 0;"">
                    <a href=""{EmailConstants.PaymentMethodsUrl}"" style=""display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f97316 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 600;"">
                      Update Payment Method →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Help -->
              <table role=""presentation"" style=""width: 100%; background-color: #f3f4f6; border-radius: 12px; margin-top: 24px;"">
                <tr>
                  <td style=""padding: 16px 20px;"">
                    <p style=""color: #4b5563; font-size: 14px; margin: 0;"">
                      <strong>Need help?</strong> Contact us at
                      <a href=""mailto:{EmailConstants.SupportEmail}"" style=""color: #7c3aed; text-decoration: none;"">{EmailConstants.SupportEmail}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style=""background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;"">
              <p style=""color: #6b7280; font-size: 14px; margin: 0;"">
                © {DateTime.UtcNow.Year} QualiFlow. All rights reserved.
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

    private static string BuildSubscriptionSuspendedText(string customerName, string businessName, int failedAttempts, string planName)
    {
        return $@"
ACTION REQUIRED: Your Subscription is Suspended

Hi {customerName},

We were unable to process payment for your {planName} subscription for {businessName} after {failedAttempts} attempt{(failedAttempts != 1 ? "s" : "")}.

Your subscription has been temporarily suspended.

WHILE SUSPENDED:
- AI lead qualification is paused
- New conversations won't be processed
- Your data remains safe and accessible

Update your payment method: {EmailConstants.PaymentMethodsUrl}

Need help? Contact us at {EmailConstants.SupportEmail}

© {DateTime.UtcNow.Year} QualiFlow. All rights reserved.
";
    }

    // ============================================================================
    // PAYMENT FAILED EMAIL TEMPLATES
    // ============================================================================

    private static string BuildPaymentFailedHtml(string customerName, string businessName, decimal amount, string planName)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
  <meta charset=""utf-8"">
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
  <title>Payment Failed</title>
</head>
<body style=""margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;"">
  <table role=""presentation"" style=""width: 100%; border-collapse: collapse;"">
    <tr>
      <td style=""padding: 40px 20px;"">
        <table role=""presentation"" style=""max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;"">

          <!-- Header -->
          <tr>
            <td style=""background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 32px; text-align: center;"">
              <img src=""https://qualiflow.ai/logo-white.png"" alt=""QualiFlow"" style=""height: 40px; margin-bottom: 20px;"" />
              <h1 style=""color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px 0;"">Payment Failed</h1>
              <p style=""color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0;"">We couldn't process your payment</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style=""padding: 32px;"">
              <p style=""color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;"">
                Hi {customerName},
              </p>
              <p style=""color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;"">
                We were unable to process your payment of <strong>${amount:F2}</strong> for the <strong>{planName}</strong> subscription
                for <strong>{businessName}</strong>.
              </p>

              <!-- Info Box -->
              <table role=""presentation"" style=""width: 100%; background-color: #fef3c7; border-radius: 12px; margin-bottom: 24px;"">
                <tr>
                  <td style=""padding: 20px;"">
                    <p style=""color: #92400e; font-size: 14px; margin: 0;"">
                      <strong>Common reasons for payment failure:</strong><br/>
                      • Insufficient funds<br/>
                      • Card expired or cancelled<br/>
                      • Incorrect card details
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role=""presentation"" style=""width: 100%;"">
                <tr>
                  <td style=""text-align: center; padding: 16px 0;"">
                    <a href=""{EmailConstants.PaymentMethodsUrl}"" style=""display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f97316 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 600;"">
                      Update Payment Method →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style=""background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;"">
              <p style=""color: #6b7280; font-size: 14px; margin: 0;"">
                © {DateTime.UtcNow.Year} QualiFlow. All rights reserved.
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

    private static string BuildPaymentFailedText(string customerName, string businessName, decimal amount, string planName)
    {
        return $@"
PAYMENT FAILED

Hi {customerName},

We were unable to process your payment of ${amount:F2} for the {planName} subscription for {businessName}.

COMMON REASONS FOR PAYMENT FAILURE:
- Insufficient funds
- Card expired or cancelled
- Incorrect card details

Update your payment method: {EmailConstants.PaymentMethodsUrl}

© {DateTime.UtcNow.Year} QualiFlow. All rights reserved.
";
    }

    // ============================================================================
    // SUBSCRIPTION CANCELLED EMAIL TEMPLATES
    // ============================================================================

    private static string BuildSubscriptionCancelledHtml(string customerName, string businessName, string planName)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
  <meta charset=""utf-8"">
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
  <title>Subscription Cancelled</title>
</head>
<body style=""margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;"">
  <table role=""presentation"" style=""width: 100%; border-collapse: collapse;"">
    <tr>
      <td style=""padding: 40px 20px;"">
        <table role=""presentation"" style=""max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;"">

          <!-- Header -->
          <tr>
            <td style=""background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 40px 32px; text-align: center;"">
              <img src=""https://qualiflow.ai/logo-white.png"" alt=""QualiFlow"" style=""height: 40px; margin-bottom: 20px;"" />
              <h1 style=""color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px 0;"">Subscription Cancelled</h1>
              <p style=""color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0;"">We're sorry to see you go</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style=""padding: 32px;"">
              <p style=""color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;"">
                Hi {customerName},
              </p>
              <p style=""color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;"">
                Your <strong>{planName}</strong> subscription for <strong>{businessName}</strong> has been cancelled.
              </p>

              <!-- Info Box -->
              <table role=""presentation"" style=""width: 100%; background-color: #f3f4f6; border-radius: 12px; margin-bottom: 24px;"">
                <tr>
                  <td style=""padding: 20px;"">
                    <p style=""color: #374151; font-size: 14px; margin: 0;"">
                      <strong>Your data will be preserved for 30 days.</strong><br/>
                      If you change your mind, you can reactivate your subscription anytime.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role=""presentation"" style=""width: 100%;"">
                <tr>
                  <td style=""text-align: center; padding: 16px 0;"">
                    <a href=""{EmailConstants.PricingUrl}"" style=""display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f97316 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 600;"">
                      Resubscribe →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style=""background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;"">
              <p style=""color: #6b7280; font-size: 14px; margin: 0;"">
                © {DateTime.UtcNow.Year} QualiFlow. All rights reserved.
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

    private static string BuildSubscriptionCancelledText(string customerName, string businessName, string planName)
    {
        return $@"
SUBSCRIPTION CANCELLED

Hi {customerName},

Your {planName} subscription for {businessName} has been cancelled.

Your data will be preserved for 30 days. If you change your mind, you can reactivate your subscription anytime.

Resubscribe: {EmailConstants.PricingUrl}

© {DateTime.UtcNow.Year} QualiFlow. All rights reserved.
";
    }
}
#pragma warning restore SA1122

