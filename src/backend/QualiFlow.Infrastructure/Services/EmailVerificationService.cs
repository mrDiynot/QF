using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

using QualiFlow.Application.Features.Auth.Services;
using QualiFlow.Application.Features.Email.DTOs;
using QualiFlow.Application.Features.Email.Services;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Constants;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for email verification operations.
/// </summary>
public partial class EmailVerificationService : IEmailVerificationService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailVerificationService> _logger;
    private readonly string _frontendUrl;
    private readonly string _fromEmail;

    /// <summary>
    /// Initializes a new instance of the <see cref="EmailVerificationService"/> class.
    /// </summary>
    public EmailVerificationService(
        UserManager<ApplicationUser> userManager,
        IEmailService emailService,
        IConfiguration configuration,
        ILogger<EmailVerificationService> logger)
    {
        _userManager = userManager;
        _emailService = emailService;
        _configuration = configuration;
        _logger = logger;
        _frontendUrl = configuration["App:FrontendUrl"] ?? "http://localhost:3000";
        _fromEmail = configuration["Email:FromAddress"] ?? EmailConstants.NoReplyEmail;
    }

    /// <inheritdoc />
    public async Task<bool> SendVerificationEmailAsync(
        Guid userId,
        string email,
        string firstName,
        CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            LogUserNotFound(_logger, userId);
            return false;
        }

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = Uri.EscapeDataString(token);
        var verificationUrl = $"{_frontendUrl}/verify-email?userId={userId}&token={encodedToken}";

        var htmlBody = GenerateVerificationEmailHtml(firstName, verificationUrl);
        var textBody = GenerateVerificationEmailText(firstName, verificationUrl);

        try
        {
            var emailRequest = new SendEmailRequest
            {
                BusinessId = user.BusinessId, // Pass business ID explicitly for system emails
                FromEmail = _fromEmail,
                FromName = "QualiFlow",
                ToEmail = email,
                ToName = firstName,
                Subject = "Verify your email address - QualiFlow",
                HtmlBody = htmlBody,
                TextBody = textBody,
                Tags = new Dictionary<string, string> { { "type", "email_verification" } },
            };

            await _emailService.SendEmailAsync(emailRequest, cancellationToken);

            LogVerificationEmailSent(_logger, userId, email);
            return true;
        }
        catch (Exception ex)
        {
            LogVerificationEmailFailed(_logger, userId, email, ex);
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<bool> VerifyEmailAsync(
        string userId,
        string token,
        CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            LogUserNotFoundForVerification(_logger, userId);
            return false;
        }

        if (user.EmailConfirmed)
        {
            LogEmailAlreadyVerified(_logger, userId);
            return true;
        }

        var decodedToken = Uri.UnescapeDataString(token);
        var result = await _userManager.ConfirmEmailAsync(user, decodedToken);

        if (result.Succeeded)
        {
            LogEmailVerified(_logger, userId, user.Email ?? string.Empty);
            return true;
        }

        LogEmailVerificationFailed(_logger, userId, string.Join(", ", result.Errors.Select(e => e.Description)));
        return false;
    }

    /// <inheritdoc />
    public async Task<bool> ResendVerificationEmailAsync(
        string email,
        CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            LogUserNotFoundByEmail(_logger, email);
            return false;
        }

        if (user.EmailConfirmed)
        {
            LogEmailAlreadyVerifiedForResend(_logger, email);
            return true;
        }

        return await SendVerificationEmailAsync(user.Id, email, user.FirstName, cancellationToken);
    }

    private static string GenerateVerificationEmailHtml(string firstName, string verificationUrl)
    {
        return $$"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - QualiFlow</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 12px 12px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">QualiFlow</h1>
                            <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">AI-Powered Lead Qualification</p>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; color: #18181b; font-size: 24px; font-weight: 600;">Verify your email address</h2>
                            <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">Hi {{firstName}},</p>
                            <p style="margin: 0 0 30px; color: #52525b; font-size: 16px; line-height: 1.6;">Thanks for signing up for QualiFlow! Please verify your email address by clicking the button below. This helps us ensure the security of your account.</p>
                            <!-- Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 30px;">
                                <tr>
                                    <td style="border-radius: 8px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);">
                                        <a href="{{verificationUrl}}" target="_blank" style="display: inline-block; padding: 16px 32px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">Verify Email Address</a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 0 0 20px; color: #71717a; font-size: 14px; line-height: 1.6;">If the button doesn't work, copy and paste this link into your browser:</p>
                            <p style="margin: 0 0 30px; word-break: break-all; color: #6366f1; font-size: 14px;">{{verificationUrl}}</p>
                            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e4e4e7;">
                            <p style="margin: 0; color: #a1a1aa; font-size: 13px; line-height: 1.5;">This link will expire in 24 hours. If you didn't create a QualiFlow account, you can safely ignore this email.</p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #fafafa; border-radius: 0 0 12px 12px; text-align: center;">
                            <p style="margin: 0 0 10px; color: #71717a; font-size: 13px;">&copy; 2025 QualiFlow. All rights reserved.</p>
                            <p style="margin: 0; color: #a1a1aa; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
""";
    }

    private static string GenerateVerificationEmailText(string firstName, string verificationUrl)
    {
        return $$"""
QualiFlow - Verify Your Email Address

Hi {{firstName}},

Thanks for signing up for QualiFlow! Please verify your email address by clicking the link below:

{{verificationUrl}}

This link will expire in 24 hours.

If you didn't create a QualiFlow account, you can safely ignore this email.

---
© 2025 QualiFlow. All rights reserved.
This is an automated message. Please do not reply to this email.
""";
    }

    // Logging methods
    [LoggerMessage(Level = LogLevel.Warning, Message = "User not found for verification email: {UserId}")]
    private static partial void LogUserNotFound(ILogger logger, Guid userId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Verification email sent to {Email} for user {UserId}")]
    private static partial void LogVerificationEmailSent(ILogger logger, Guid userId, string email);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to send verification email to {Email} for user {UserId}")]
    private static partial void LogVerificationEmailFailed(ILogger logger, Guid userId, string email, Exception ex);

    [LoggerMessage(Level = LogLevel.Warning, Message = "User not found for email verification: {UserId}")]
    private static partial void LogUserNotFoundForVerification(ILogger logger, string userId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Email already verified for user: {UserId}")]
    private static partial void LogEmailAlreadyVerified(ILogger logger, string userId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Email verified successfully for user {UserId}: {Email}")]
    private static partial void LogEmailVerified(ILogger logger, string userId, string email);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Email verification failed for user {UserId}: {Errors}")]
    private static partial void LogEmailVerificationFailed(ILogger logger, string userId, string errors);

    [LoggerMessage(Level = LogLevel.Warning, Message = "User not found by email for resend: {Email}")]
    private static partial void LogUserNotFoundByEmail(ILogger logger, string email);

    [LoggerMessage(Level = LogLevel.Information, Message = "Email already verified for resend request: {Email}")]
    private static partial void LogEmailAlreadyVerifiedForResend(ILogger logger, string email);
}

