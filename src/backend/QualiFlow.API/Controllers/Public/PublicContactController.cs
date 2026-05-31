// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using QualiFlow.Application.Common.Options;
using QualiFlow.Application.Features.Email.DTOs;
using QualiFlow.Application.Features.Email.Services;

namespace QualiFlow.API.Controllers.Public;

/// <summary>
/// Public controller for contact form submissions (no authentication required).
/// </summary>
[ApiController]
[Route("api/v{version:apiVersion}/public/contact")]
[AllowAnonymous]
[Produces("application/json")]
public class PublicContactController : ControllerBase
{
    private readonly IEmailService _emailService;
    private readonly ContactFormOptions _options;
    private readonly ILogger<PublicContactController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="PublicContactController"/> class.
    /// </summary>
    /// <param name="emailService">Email service for sending notifications.</param>
    /// <param name="options">Contact form configuration options.</param>
    /// <param name="logger">Logger instance.</param>
    public PublicContactController(
        IEmailService emailService,
        IOptions<ContactFormOptions> options,
        ILogger<PublicContactController> logger)
    {
        _emailService = emailService;
        _options = options.Value;
        _logger = logger;
    }

    /// <summary>
    /// Submits a contact form from the public website.
    /// </summary>
    /// <param name="request">Contact form data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Success response.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ContactFormResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SubmitContactForm(
        [FromBody] ContactFormRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { error = "Name is required" });
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { error = "Email is required" });
        }

        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { error = "Message is required" });
        }

        _logger.LogInformation(
            "Contact form submitted: Name={Name}, Email={Email}, Subject={Subject}",
            request.Name,
            request.Email,
            request.Subject ?? "No subject");

        try
        {
            // Build email subject
            var emailSubject = string.IsNullOrWhiteSpace(request.Subject)
                ? $"{_options.SubjectPrefix} New message from {request.Name}"
                : $"{_options.SubjectPrefix} {request.Subject}";

            // Build email HTML body
            var htmlBody = BuildContactFormEmailHtml(request);

            // Build plain text body
            var textBody = BuildContactFormEmailText(request);

            // Send notification email
            await _emailService.SendEmailAsync(
                new SendEmailRequest
                {
                    ToEmail = _options.DestinationEmail,
                    ToName = "QualiflowAI Team",
                    FromEmail = _options.FromEmail,
                    FromName = _options.FromName,
                    Subject = emailSubject,
                    HtmlBody = htmlBody,
                    TextBody = textBody,
                    ReplyTo = request.Email,
                    CcEmail = _options.CcEmail,
                },
                cancellationToken);

            _logger.LogInformation(
                "Contact form email sent to {DestinationEmail} from {SenderEmail}",
                _options.DestinationEmail,
                request.Email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send contact form email notification. To={To}, From={From}, CcEmail={CcEmail}",
                _options.DestinationEmail,
                _options.FromEmail,
                _options.CcEmail ?? "(null)");

            // Return error details in non-production for diagnostics, success in production
            return Ok(new ContactFormResponse
            {
                Success = false,
                Message = $"Form received but email notification failed: {ex.Message}",
            });
        }

        return Ok(new ContactFormResponse
        {
            Success = true,
            Message = "Thank you for contacting us! We'll get back to you soon.",
        });
    }

    private static string BuildContactFormEmailHtml(ContactFormRequest request)
    {
        var timestamp = DateTime.UtcNow.ToString("MMMM dd, yyyy 'at' h:mm tt 'UTC'", System.Globalization.CultureInfo.InvariantCulture);

        var hasCompany = !string.IsNullOrWhiteSpace(request.Company);
        var hasPhone = !string.IsNullOrWhiteSpace(request.Phone);
        var companyBottomPadding = hasPhone ? "12" : "0";
        var companyHtml = hasCompany ? $@"
                                                        <tr>
                                                            <td style=""padding-bottom: {companyBottomPadding}px;"">
                                                                <p style=""margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #6B2D9E; text-transform: uppercase; letter-spacing: 0.5px;"">Company</p>
                                                                <p style=""margin: 0; font-size: 15px; color: #374151;"">{System.Net.WebUtility.HtmlEncode(request.Company)}</p>
                                                            </td>
                                                        </tr>" : string.Empty;
        var phoneHtml = hasPhone ? $@"
                                                        <tr>
                                                            <td>
                                                                <p style=""margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #6B2D9E; text-transform: uppercase; letter-spacing: 0.5px;"">Phone</p>
                                                                <p style=""margin: 0; font-size: 15px; color: #374151;""><a href=""tel:{System.Net.WebUtility.HtmlEncode(request.Phone)}"" style=""color: #374151; text-decoration: none;"">{System.Net.WebUtility.HtmlEncode(request.Phone)}</a></p>
                                                            </td>
                                                        </tr>" : string.Empty;
        var contactDetailsHtml = (hasCompany || hasPhone) ? $@"
                                        <!-- Contact Details -->
                                        <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""margin-bottom: 24px;"">
                                            <tr>
                                                <td style=""background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;"">
                                                    <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"">
                                                        {companyHtml}
                                                        {phoneHtml}
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        " : string.Empty;

        return $@"
<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>New Contact Form Submission</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
</head>
<body style=""margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;"">
    <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""background-color: #f3f4f6; padding: 40px 20px;"">
        <tr>
            <td align=""center"">
                <table role=""presentation"" width=""600"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; width: 100%;"">
                    <!-- Logo Header -->
                    <tr>
                        <td align=""center"" style=""padding: 0 0 32px 0;"">
                            <table role=""presentation"" cellspacing=""0"" cellpadding=""0"" border=""0"">
                                <tr>
                                    <td style=""vertical-align: middle; padding-right: 10px;"">
                                        <img src=""https://www.qualiflow.ai/assets/qualiflow-logo_no_text.png"" alt=""Q"" width=""44"" height=""44"" style=""display: block; border-radius: 10px;"" />
                                    </td>
                                    <td style=""vertical-align: middle;"">
                                        <span style=""font-size: 26px; font-weight: 700; color: #5D3FD3; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"">QualiFlow</span><span style=""font-size: 14px; font-weight: 700; color: #5D3FD3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0ecff; border: 1px solid rgba(93,63,211,0.2); border-radius: 4px; padding: 2px 6px; margin-left: 6px; letter-spacing: 0.05em;"">AI</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Main Card -->
                    <tr>
                        <td>
                            <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.03); overflow: hidden;"">
                                <!-- Purple Header Bar -->
                                <tr>
                                    <td style=""background: linear-gradient(135deg, #6B2D9E 0%, #8B3DAE 50%, #EC4899 100%); padding: 32px 40px;"">
                                        <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"">
                                            <tr>
                                                <td>
                                                    <p style=""margin: 0 0 8px 0; font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 1px;"">New Message</p>
                                                    <h1 style=""margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.3;"">Contact Form Submission</h1>
                                                </td>
                                                <td align=""right"" style=""vertical-align: top;"">
                                                    <div style=""width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center;"">
                                                        <span style=""font-size: 28px;"">📬</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Content -->
                                <tr>
                                    <td style=""padding: 40px;"">
                                        <!-- Sender Info Card -->
                                        <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""background: linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%); border-radius: 12px; margin-bottom: 24px;"">
                                            <tr>
                                                <td style=""padding: 20px;"">
                                                    <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"">
                                                        <tr>
                                                            <td style=""width: 48px; vertical-align: top;"">
                                                                <div style=""width: 48px; height: 48px; background: linear-gradient(135deg, #6B2D9E, #EC4899); border-radius: 50%; display: flex; align-items: center; justify-content: center;"">
                                                                    <span style=""color: white; font-size: 20px; font-weight: 600;"">{System.Net.WebUtility.HtmlEncode(request.Name.Substring(0, 1).ToUpperInvariant())}</span>
                                                                </div>
                                                            </td>
                                                            <td style=""padding-left: 16px; vertical-align: middle;"">
                                                                <p style=""margin: 0; font-size: 18px; font-weight: 600; color: #1f2937;"">{System.Net.WebUtility.HtmlEncode(request.Name)}</p>
                                                                <p style=""margin: 4px 0 0 0; font-size: 14px; color: #6B2D9E;"">
                                                                    <a href=""mailto:{System.Net.WebUtility.HtmlEncode(request.Email)}"" style=""color: #6B2D9E; text-decoration: none;"">{System.Net.WebUtility.HtmlEncode(request.Email)}</a>
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        {contactDetailsHtml}

                                        {(string.IsNullOrWhiteSpace(request.Subject) ? string.Empty : $@"
                                        <!-- Subject -->
                                        <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""margin-bottom: 24px;"">
                                            <tr>
                                                <td>
                                                    <p style=""margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #6B2D9E; text-transform: uppercase; letter-spacing: 0.5px;"">Subject</p>
                                                    <p style=""margin: 0; font-size: 16px; font-weight: 500; color: #1f2937;"">{System.Net.WebUtility.HtmlEncode(request.Subject)}</p>
                                                </td>
                                            </tr>
                                        </table>
                                        ")}

                                        <!-- Message -->
                                        <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"">
                                            <tr>
                                                <td>
                                                    <p style=""margin: 0 0 12px 0; font-size: 12px; font-weight: 600; color: #6B2D9E; text-transform: uppercase; letter-spacing: 0.5px;"">Message</p>
                                                    <div style=""background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;"">
                                                        <p style=""margin: 0; font-size: 15px; line-height: 1.7; color: #374151; white-space: pre-wrap;"">{System.Net.WebUtility.HtmlEncode(request.Message)}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Reply Button -->
                                        <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""margin-top: 32px;"">
                                            <tr>
                                                <td align=""center"">
                                                    <a href=""mailto:{System.Net.WebUtility.HtmlEncode(request.Email)}?subject=Re: {System.Net.WebUtility.HtmlEncode(request.Subject ?? "Your inquiry to QualiflowAI")}"" style=""display: inline-block; background: linear-gradient(135deg, #6B2D9E, #8B3DAE); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(107, 45, 158, 0.3);"">
                                                        Reply to {System.Net.WebUtility.HtmlEncode(request.Name.Split(' ')[0])}
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Footer -->
                                <tr>
                                    <td style=""background: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;"">
                                        <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"">
                                            <tr>
                                                <td>
                                                    <p style=""margin: 0; font-size: 13px; color: #6b7280;"">
                                                        <span style=""color: #9ca3af;"">📅</span> Received on {timestamp}
                                                    </p>
                                                    <p style=""margin: 8px 0 0 0; font-size: 13px; color: #9ca3af;"">
                                                        You can reply directly to this email to respond.
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Bottom Branding -->
                    <tr>
                        <td align=""center"" style=""padding: 32px 0;"">
                            <p style=""margin: 0 0 8px 0; font-size: 14px; color: #6b7280;"">Sent from</p>
                            <p style=""margin: 0; font-size: 16px; font-weight: 600; color: #5D3FD3;"">QualiFlow AI Contact Form</p>
                            <p style=""margin: 12px 0 0 0; font-size: 13px; color: #9ca3af;"">
                                <a href=""https://qualiflow.ai"" style=""color: #6B2D9E; text-decoration: none;"">qualiflow.ai</a>
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

    private static string BuildContactFormEmailText(ContactFormRequest request)
    {
        var subject = string.IsNullOrWhiteSpace(request.Subject) ? string.Empty : $"\nSubject: {request.Subject}";
        var company = string.IsNullOrWhiteSpace(request.Company) ? string.Empty : $"\nCompany: {request.Company}";
        var phone = string.IsNullOrWhiteSpace(request.Phone) ? string.Empty : $"\nPhone: {request.Phone}";

        return $@"New Contact Form Submission
=============================

Name: {request.Name}
Email: {request.Email}{company}{phone}{subject}

Message:
{request.Message}

---
Reply directly to this email to respond to {request.Name}.
Sent from QualiflowAI Contact Form";
    }
}

/// <summary>
/// Request model for contact form submission.
/// </summary>
public record ContactFormRequest
{
    /// <summary>Gets the sender's name.</summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>Gets the sender's email.</summary>
    public string Email { get; init; } = string.Empty;

    /// <summary>Gets the message subject.</summary>
    public string? Subject { get; init; }

    /// <summary>Gets the message content.</summary>
    public string Message { get; init; } = string.Empty;

    /// <summary>Gets the sender's company name.</summary>
    public string? Company { get; init; }

    /// <summary>Gets the sender's phone number.</summary>
    public string? Phone { get; init; }
}

/// <summary>
/// Response model for contact form submission.
/// </summary>
public record ContactFormResponse
{
    /// <summary>Gets a value indicating whether the submission was successful.</summary>
    public bool Success { get; init; }

    /// <summary>Gets the response message.</summary>
    public string Message { get; init; } = string.Empty;
}
