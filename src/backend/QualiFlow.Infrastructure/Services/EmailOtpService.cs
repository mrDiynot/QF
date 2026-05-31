using System.Globalization;
using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.Auth.Services;
using QualiFlow.Application.Features.Email.DTOs;
using QualiFlow.Application.Features.Email.Services;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Constants;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Implementation of email-based OTP authentication service.
/// </summary>
public class EmailOtpService : IEmailOtpService
{
    private const int OtpExpiryMinutes = 5;
    private const int MaxFailedAttempts = 3;
    private const int MaxOtpRequestsPerHour = 5;
    private const int ResendCooldownSeconds = 60;

    private readonly QualiFlowDbContext _dbContext;
    private readonly IEmailService _emailService;
    private readonly ILogger<EmailOtpService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="EmailOtpService"/> class.
    /// </summary>
    public EmailOtpService(
        QualiFlowDbContext dbContext,
        IEmailService emailService,
        ILogger<EmailOtpService> logger)
    {
        _dbContext = dbContext;
        _emailService = emailService;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<bool> GenerateAndSendOtpAsync(
        Guid userId,
        string email,
        string firstName,
        string? ipAddress,
        CancellationToken cancellationToken)
    {
        // Invalidate any previous unused OTPs
        var existingOtps = await _dbContext.EmailOtps
            .Where(o => o.UserId == userId && !o.IsUsed)
            .ToListAsync(cancellationToken);

        foreach (var otp in existingOtps)
        {
            otp.IsUsed = true;
            otp.UpdatedAt = DateTime.UtcNow;
        }

        // Generate new 6-digit OTP
        var otpCode = GenerateOtpCode();
        var otpHash = BCrypt.Net.BCrypt.HashPassword(otpCode);

        var emailOtp = new EmailOtp
        {
            UserId = userId,
            OtpCodeHash = otpHash,
            ExpiresAt = DateTime.UtcNow.AddMinutes(OtpExpiryMinutes),
            IsUsed = false,
            FailedAttempts = 0,
            RequestedByIp = ipAddress,
        };

        _dbContext.EmailOtps.Add(emailOtp);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // Send OTP via email
        try
        {
            var emailRequest = new SendEmailRequest
            {
                ToEmail = email,
                FromEmail = EmailConstants.NoReplyEmail,
                FromName = EmailConstants.FromName,
                Subject = $"Your QualiFlow verification code: {otpCode}",
                HtmlBody = GenerateOtpEmailHtml(firstName, otpCode),
                TextBody = GenerateOtpEmailText(firstName, otpCode),
            };

            await _emailService.SendEmailAsync(emailRequest, cancellationToken);
            _logger.LogInformation("OTP sent to user {UserId}", userId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send OTP email to user {UserId}", userId);
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<Guid?> VerifyOtpAsync(
        string email,
        string otpCode,
        CancellationToken cancellationToken)
    {
        // Find user by email (case-insensitive using NormalizedEmail from Identity)
        var normalizedEmail = email.ToUpperInvariant();
        var user = await _dbContext.Users
            .FirstOrDefaultAsync(
                u => u.NormalizedEmail == normalizedEmail,
                cancellationToken);

        if (user == null)
        {
            _logger.LogWarning("OTP verification attempted for non-existent email: {Email}", email);
            return null;
        }

        // Find valid OTP for user
        var otp = await _dbContext.EmailOtps
            .Where(o => o.UserId == user.Id &&
                !o.IsUsed &&
                o.ExpiresAt > DateTime.UtcNow &&
                o.FailedAttempts < MaxFailedAttempts)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (otp == null)
        {
            _logger.LogWarning("No valid OTP found for user {UserId}", user.Id);
            return null;
        }

        // Verify OTP code
        if (!BCrypt.Net.BCrypt.Verify(otpCode, otp.OtpCodeHash))
        {
            otp.FailedAttempts++;
            otp.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogWarning(
                "Invalid OTP attempt for user {UserId}. Attempt {Attempt}/{Max}",
                user.Id,
                otp.FailedAttempts,
                MaxFailedAttempts);

            return null;
        }

        // Mark OTP as used
        otp.IsUsed = true;
        otp.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("OTP verified successfully for user {UserId}", user.Id);
        return user.Id;
    }

    /// <inheritdoc />
    public async Task<bool> CanRequestOtpAsync(Guid userId, CancellationToken cancellationToken)
    {
        var oneHourAgo = DateTime.UtcNow.AddHours(-1);
        var recentRequests = await _dbContext.EmailOtps
            .CountAsync(o => o.UserId == userId && o.CreatedAt > oneHourAgo, cancellationToken);

        return recentRequests < MaxOtpRequestsPerHour;
    }

    /// <inheritdoc />
    public async Task<bool> CanAttemptVerificationAsync(Guid userId, CancellationToken cancellationToken)
    {
        // Check if there's a valid (non-locked) OTP
        var validOtp = await _dbContext.EmailOtps
            .AnyAsync(
                o => o.UserId == userId &&
                    !o.IsUsed &&
                    o.ExpiresAt > DateTime.UtcNow &&
                    o.FailedAttempts < MaxFailedAttempts,
                cancellationToken);

        return validOtp;
    }

    /// <inheritdoc />
    public async Task<int> GetResendCooldownSecondsAsync(Guid userId, CancellationToken cancellationToken)
    {
        var lastOtp = await _dbContext.EmailOtps
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastOtp == null)
        {
            return 0;
        }

        var cooldownEnd = lastOtp.CreatedAt.AddSeconds(ResendCooldownSeconds);
        var remaining = (cooldownEnd - DateTime.UtcNow).TotalSeconds;

        return remaining > 0 ? (int)remaining : 0;
    }

    private static string GenerateOtpCode()
    {
        var bytes = new byte[4];
        RandomNumberGenerator.Fill(bytes);
        var number = Math.Abs(BitConverter.ToInt32(bytes, 0)) % 1000000;
        return number.ToString("D6", CultureInfo.InvariantCulture);
    }

    private static string GenerateOtpEmailHtml(string firstName, string otpCode)
    {
        var content = string.Concat(
            EmailTemplateBuilder.Header("QualiFlow"),
            EmailTemplateBuilder.Greeting(firstName),
            EmailTemplateBuilder.Paragraph("Your verification code is:"),
            EmailTemplateBuilder.OtpCode(otpCode),
            EmailTemplateBuilder.Paragraph("This code will expire in <strong>5 minutes</strong>.", muted: true, fontSize: 14),
            EmailTemplateBuilder.SecurityNotice(
                "If you didn't request this code, you can safely ignore this email. Someone may have entered your email by mistake."));

        return EmailTemplateBuilder.WrapInTemplate("QualiFlow Verification Code", content);
    }

    private static string GenerateOtpEmailText(string firstName, string otpCode)
    {
        return $"""
            QualiFlow Verification Code

            Hi {firstName},

            Your verification code is: {otpCode}

            This code will expire in 5 minutes.

            Security Notice: If you didn't request this code, you can safely ignore this email. Someone may have entered your email by mistake.

            © 2025 QualiFlow. All rights reserved.
            """;
    }
}

