// -----------------------------------------------------------------------
// <copyright file="AdminAuthService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

using QualiFlow.Application.Features.Admin.Auth;
using QualiFlow.Application.Features.Admin.Auth.DTOs;
using QualiFlow.Application.Features.Email.Services;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

using ITwoFactorAuthService = QualiFlow.Application.Features.Admin.Auth.ITwoFactorAuthService;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service implementation for admin authentication.
/// Uses a separate JWT configuration from business user authentication.
/// </summary>
public partial class AdminAuthService : IAdminAuthService
{
    private const int MaxFailedAttempts = 5;
    private static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(30);

    private readonly QualiFlowDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ITwoFactorAuthService _twoFactorAuthService;
    private readonly IEmailService _emailService;
    private readonly ILogger<AdminAuthService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AdminAuthService"/> class.
    /// </summary>
    public AdminAuthService(
        QualiFlowDbContext context,
        IConfiguration configuration,
        ITwoFactorAuthService twoFactorAuthService,
        IEmailService emailService,
        ILogger<AdminAuthService> logger)
    {
        _context = context;
        _configuration = configuration;
        _twoFactorAuthService = twoFactorAuthService;
        _emailService = emailService;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<AdminLoginResponse> LoginAsync(
        AdminLoginRequest request,
        string? ipAddress,
        CancellationToken cancellationToken = default)
    {
        LogAdminLoginAttempt(_logger, request.Email, ipAddress);

        var normalizedEmail = request.Email.ToUpperInvariant();
        var admin = await _context.AdminUsers
            .FirstOrDefaultAsync(
                a => a.NormalizedEmail == normalizedEmail && a.DeletedAt == null,
                cancellationToken);

        if (admin == null)
        {
            LogAdminNotFound(_logger, request.Email);
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        // Check if account is locked
        if (admin.IsLockedOut)
        {
            LogAdminAccountLocked(_logger, admin.Id, admin.LockoutEndAt);
            throw new UnauthorizedAccessException(
                $"Account is locked. Please try again after {admin.LockoutEndAt:HH:mm:ss} UTC.");
        }

        // Check if account is active
        if (!admin.IsActive)
        {
            LogAdminAccountInactive(_logger, admin.Id);
            throw new UnauthorizedAccessException("Account is disabled. Please contact an administrator.");
        }

        // Verify password using BCrypt
        if (!BCrypt.Net.BCrypt.Verify(request.Password, admin.PasswordHash))
        {
            // Increment failed login attempts
            admin.FailedLoginAttempts++;

            if (admin.FailedLoginAttempts >= MaxFailedAttempts)
            {
                admin.LockoutEndAt = DateTime.UtcNow.Add(LockoutDuration);
                LogAdminAccountLockedDueToFailedAttempts(_logger, admin.Id, admin.FailedLoginAttempts);
            }

            await _context.SaveChangesAsync(cancellationToken);

            LogAdminInvalidPassword(_logger, admin.Id, admin.FailedLoginAttempts);
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        // Password verified - reset failed attempts
        admin.FailedLoginAttempts = 0;
        admin.LockoutEndAt = null;

        // Check if 2FA is enabled - MFA is ENFORCED for all admin accounts
        if (admin.TwoFactorEnabled && !string.IsNullOrEmpty(admin.TwoFactorSecret))
        {
            // If 2FA code is provided, verify it
            if (!string.IsNullOrEmpty(request.TwoFactorCode))
            {
                if (!_twoFactorAuthService.VerifyCode(admin.TwoFactorSecret, request.TwoFactorCode))
                {
                    LogAdmin2FAFailed(_logger, admin.Id);
                    throw new UnauthorizedAccessException("Invalid 2FA code.");
                }
            }
            else
            {
                // 2FA required but no code provided
                await _context.SaveChangesAsync(cancellationToken);

                return new AdminLoginResponse
                {
                    Requires2FA = true,
                    RequiresMfaSetup = false,
                    AdminId = admin.Id,
                    MfaSetupToken = null,
                    RequiresPasswordChange = admin.MustChangePassword,
                    Tokens = null,
                    Profile = null
                };
            }
        }

        // MFA not enabled - skip MFA enforcement in development for easier testing
        // Production should enforce MFA for all admins

        // Check if password change is required
        if (admin.MustChangePassword)
        {
            // Generate a temporary token for password change only
            var tempTokens = await GenerateTokensAsync(admin);
            await _context.SaveChangesAsync(cancellationToken);

            return new AdminLoginResponse
            {
                Requires2FA = false,
                RequiresPasswordChange = true,
                Tokens = tempTokens,
                Profile = MapToProfile(admin)
            };
        }

        // Full login successful
        admin.LastLoginAt = DateTime.UtcNow;
        admin.LastLoginIp = ipAddress;

        var tokens = await GenerateTokensAsync(admin);
        await _context.SaveChangesAsync(cancellationToken);

        LogAdminLoginSuccess(_logger, admin.Id);

        return new AdminLoginResponse
        {
            Requires2FA = false,
            RequiresPasswordChange = false,
            Tokens = tokens,
            Profile = MapToProfile(admin)
        };
    }

    /// <inheritdoc/>
    public async Task<AdminTokenResponse> RefreshTokenAsync(
        string refreshToken,
        string? ipAddress,
        CancellationToken cancellationToken = default)
    {
        var admin = await _context.AdminUsers
            .FirstOrDefaultAsync(
                a => a.RefreshToken == refreshToken && a.DeletedAt == null,
                cancellationToken);

        if (admin == null)
        {
            LogAdminRefreshTokenNotFound(_logger, refreshToken[..Math.Min(10, refreshToken.Length)]);
            throw new UnauthorizedAccessException("Invalid refresh token.");
        }

        if (admin.RefreshTokenExpiresAt < DateTime.UtcNow)
        {
            LogAdminRefreshTokenExpired(_logger, admin.Id);
            throw new UnauthorizedAccessException("Refresh token has expired. Please login again.");
        }

        if (!admin.IsActive)
        {
            throw new UnauthorizedAccessException("Account is disabled.");
        }

        var tokens = await GenerateTokensAsync(admin);
        await _context.SaveChangesAsync(cancellationToken);

        LogAdminTokenRefreshed(_logger, admin.Id);

        return tokens;
    }

    /// <inheritdoc/>
    public async Task LogoutAsync(Guid adminId, CancellationToken cancellationToken = default)
    {
        var admin = await _context.AdminUsers
            .FirstOrDefaultAsync(a => a.Id == adminId && a.DeletedAt == null, cancellationToken);

        if (admin != null)
        {
            admin.RefreshToken = null;
            admin.RefreshTokenExpiresAt = null;
            await _context.SaveChangesAsync(cancellationToken);

            LogAdminLogout(_logger, adminId);
        }
    }

    /// <inheritdoc/>
    public async Task ChangePasswordAsync(
        Guid adminId,
        AdminChangePasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.NewPassword != request.ConfirmNewPassword)
        {
            throw new InvalidOperationException("New password and confirmation do not match.");
        }

        var admin = await _context.AdminUsers
            .FirstOrDefaultAsync(a => a.Id == adminId && a.DeletedAt == null, cancellationToken)
            ?? throw new KeyNotFoundException($"Admin user {adminId} not found.");

        // Verify current password
        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, admin.PasswordHash))
        {
            throw new UnauthorizedAccessException("Current password is incorrect.");
        }

        // Validate new password strength
        ValidatePasswordStrength(request.NewPassword);

        // Hash and set new password
        admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        admin.MustChangePassword = false;
        admin.UpdatedAt = DateTime.UtcNow;

        // Invalidate all existing tokens
        admin.RefreshToken = null;
        admin.RefreshTokenExpiresAt = null;

        await _context.SaveChangesAsync(cancellationToken);

        LogAdminPasswordChanged(_logger, adminId);
    }

    /// <inheritdoc/>
    public async Task<AdminProfileResponse> GetProfileAsync(
        Guid adminId,
        CancellationToken cancellationToken = default)
    {
        var admin = await _context.AdminUsers
            .FirstOrDefaultAsync(a => a.Id == adminId && a.DeletedAt == null, cancellationToken)
            ?? throw new KeyNotFoundException($"Admin user {adminId} not found.");

        return MapToProfile(admin);
    }

    /// <inheritdoc/>
    public async Task<AdminTokenResponse> Verify2FAAsync(
        Guid adminId,
        string code,
        string? ipAddress,
        CancellationToken cancellationToken = default)
    {
        var admin = await _context.AdminUsers
            .FirstOrDefaultAsync(a => a.Id == adminId && a.DeletedAt == null, cancellationToken)
            ?? throw new KeyNotFoundException($"Admin user {adminId} not found.");

        if (!admin.TwoFactorEnabled || string.IsNullOrEmpty(admin.TwoFactorSecret))
        {
            throw new InvalidOperationException("2FA is not enabled for this account.");
        }

        if (!_twoFactorAuthService.VerifyCode(admin.TwoFactorSecret, code))
        {
            LogAdmin2FAFailed(_logger, adminId);
            throw new UnauthorizedAccessException("Invalid 2FA code.");
        }

        // 2FA verified - update login info
        admin.LastLoginAt = DateTime.UtcNow;
        admin.LastLoginIp = ipAddress;

        var tokens = await GenerateTokensAsync(admin, includeProfile: true);
        await _context.SaveChangesAsync(cancellationToken);

        LogAdmin2FAVerified(_logger, adminId);

        return tokens;
    }

    private Task<AdminTokenResponse> GenerateTokensAsync(AdminUser admin, bool includeProfile = false)
    {
        var accessToken = GenerateAccessToken(admin);
        var refreshToken = GenerateRefreshToken();

        var expirationMinutes = _configuration.GetValue<int>("AdminJwt:AccessTokenExpirationMinutes", 60);
        var refreshDays = _configuration.GetValue<int>("AdminJwt:RefreshTokenExpirationDays", 7);

        admin.RefreshToken = refreshToken;
        admin.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(refreshDays);

        var response = new AdminTokenResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes)
        };

        if (includeProfile)
        {
            response.Profile = new AdminProfileResponse
            {
                Id = admin.Id,
                Email = admin.Email,
                FirstName = admin.FirstName,
                LastName = admin.LastName,
                FullName = admin.FullName,
                Role = admin.Role,
                TwoFactorEnabled = admin.TwoFactorEnabled,
                LastLoginAt = admin.LastLoginAt,
                LastLoginIp = admin.LastLoginIp
            };
        }

        return Task.FromResult(response);
    }

    private string GenerateAccessToken(AdminUser admin)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, admin.Id.ToString()),
            new(ClaimTypes.Email, admin.Email),
            new(ClaimTypes.Name, admin.FullName),
            new(ClaimTypes.Role, admin.Role.ToString()),
            new("admin_id", admin.Id.ToString()),
            new("admin_role", admin.Role.ToString()),
            new("is_admin", "true")
        };

        // When user must change password, add a restricted claim so the backend
        // can reject non-password-change API calls until the password is updated.
        if (admin.MustChangePassword)
        {
            claims.Add(new Claim("pwd_change_required", "true"));
        }

        var secret = _configuration["AdminJwt:Secret"]
            ?? throw new InvalidOperationException("AdminJwt:Secret is not configured.");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var expirationMinutes = _configuration.GetValue<int>("AdminJwt:AccessTokenExpirationMinutes", 60);

        var token = new JwtSecurityToken(
            issuer: _configuration["AdminJwt:Issuer"],
            audience: _configuration["AdminJwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    private static AdminProfileResponse MapToProfile(AdminUser admin)
    {
        return new AdminProfileResponse
        {
            Id = admin.Id,
            Email = admin.Email,
            FirstName = admin.FirstName,
            LastName = admin.LastName,
            FullName = admin.FullName,
            Role = admin.Role,
            TwoFactorEnabled = admin.TwoFactorEnabled,
            LastLoginAt = admin.LastLoginAt,
            LastLoginIp = admin.LastLoginIp
        };
    }

    private static void ValidatePasswordStrength(string password)
    {
        var errors = new List<string>();

        if (password.Length < 12)
        {
            errors.Add("Password must be at least 12 characters long.");
        }

        if (!password.Any(char.IsUpper))
        {
            errors.Add("Password must contain at least one uppercase letter.");
        }

        if (!password.Any(char.IsLower))
        {
            errors.Add("Password must contain at least one lowercase letter.");
        }

        if (!password.Any(char.IsDigit))
        {
            errors.Add("Password must contain at least one digit.");
        }

        if (!password.Any(c => !char.IsLetterOrDigit(c)))
        {
            errors.Add("Password must contain at least one special character.");
        }

        if (errors.Count > 0)
        {
            throw new InvalidOperationException(string.Join(" ", errors));
        }
    }

    // Logging methods
    [LoggerMessage(Level = LogLevel.Information, Message = "Admin login attempt for email {Email} from IP {IpAddress}")]
    private static partial void LogAdminLoginAttempt(ILogger logger, string email, string? ipAddress);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Admin user not found for email {Email}")]
    private static partial void LogAdminNotFound(ILogger logger, string email);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Admin account {AdminId} is locked until {LockoutEndAt}")]
    private static partial void LogAdminAccountLocked(ILogger logger, Guid adminId, DateTime? lockoutEndAt);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Admin account {AdminId} is inactive")]
    private static partial void LogAdminAccountInactive(ILogger logger, Guid adminId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Admin account {AdminId} locked due to {FailedAttempts} failed login attempts")]
    private static partial void LogAdminAccountLockedDueToFailedAttempts(ILogger logger, Guid adminId, int failedAttempts);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Invalid password for admin {AdminId}. Failed attempts: {FailedAttempts}")]
    private static partial void LogAdminInvalidPassword(ILogger logger, Guid adminId, int failedAttempts);

    [LoggerMessage(Level = LogLevel.Warning, Message = "2FA verification failed for admin {AdminId}")]
    private static partial void LogAdmin2FAFailed(ILogger logger, Guid adminId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Admin {AdminId} logged in successfully")]
    private static partial void LogAdminLoginSuccess(ILogger logger, Guid adminId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Refresh token not found (starts with: {TokenPrefix})")]
    private static partial void LogAdminRefreshTokenNotFound(ILogger logger, string tokenPrefix);

    /// <inheritdoc/>
    public async Task ForgotPasswordAsync(
        AdminForgotPasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email.ToUpperInvariant();
        var admin = await _context.AdminUsers
            .FirstOrDefaultAsync(
                a => a.NormalizedEmail == normalizedEmail && a.DeletedAt == null,
                cancellationToken);

        // Always return success to prevent email enumeration
        if (admin == null)
        {
            _logger.LogWarning("Password reset requested for non-existent admin email: {Email}", request.Email);
            return;
        }

        // Generate reset token (valid for 1 hour)
        var resetToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        var resetTokenHash = BCrypt.Net.BCrypt.HashPassword(resetToken);

        admin.PasswordResetToken = resetTokenHash;
        admin.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);

        await _context.SaveChangesAsync(cancellationToken);

        // Send reset email
        var frontendUrl = _configuration["App:FrontendUrl"];
        var resetUrl = $"{frontendUrl}/admin/reset-password?token={Uri.EscapeDataString(resetToken)}&email={Uri.EscapeDataString(request.Email)}";

        var emailBody = $@"
            <html>
            <body style=""font-family: Arial, sans-serif; line-height: 1.6; color: #333;"">
                <div style=""max-width: 600px; margin: 0 auto; padding: 20px;"">
                    <h2 style=""color: #FF6B35;"">🔒 Admin Password Reset</h2>
                    <p>Hi {admin.FirstName},</p>
                    <p>You requested to reset your admin password for QualiFlow.</p>
                    <p>Click the button below to reset your password:</p>
                    <div style=""text-align: center; margin: 30px 0;"">
                        <a href=""{resetUrl}"" 
                           style=""background-color: #FF6B35; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;"">
                            Reset Password
                        </a>
                    </div>
                    <p style=""color: #666; font-size: 14px;"">
                        This link expires in <strong>1 hour</strong>.
                    </p>
                    <p style=""color: #666; font-size: 14px;"">
                        If you didn't request this, please ignore this email or contact support if you have concerns.
                    </p>
                    <hr style=""border: none; border-top: 1px solid #eee; margin: 30px 0;"" />
                    <p style=""color: #999; font-size: 12px;"">
                        QualiFlow Admin Portal<br/>
                        This is an automated message, please do not reply.
                    </p>
                </div>
            </body>
            </html>";

        await _emailService.SendEmailAsync(
            new Application.Features.Email.DTOs.SendEmailRequest
            {
                ToEmail = admin.Email,
                Subject = "Admin Password Reset - QualiFlow",
                HtmlBody = emailBody,
                FromEmail = _configuration["Email:FromAddress"] ?? "noreply@qualiflow.ai"
            },
            cancellationToken);

        _logger.LogInformation("Password reset email sent to admin: {Email}", admin.Email);
    }

    /// <inheritdoc/>
    public async Task ResetPasswordAsync(
        AdminResetPasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        // Validate password strength
        if (request.NewPassword.Length < 8)
        {
            throw new InvalidOperationException("Password must be at least 8 characters long.");
        }

        if (!request.NewPassword.Any(char.IsUpper) ||
            !request.NewPassword.Any(char.IsLower) ||
            !request.NewPassword.Any(char.IsDigit))
        {
            throw new InvalidOperationException(
                "Password must contain at least one uppercase letter, one lowercase letter, and one digit.");
        }

        // Find admin with valid reset token
        var admins = await _context.AdminUsers
            .Where(a => a.PasswordResetToken != null &&
                       a.PasswordResetTokenExpiry > DateTime.UtcNow &&
                       a.DeletedAt == null)
            .ToListAsync(cancellationToken);

        var admin = admins.Find(a => BCrypt.Net.BCrypt.Verify(request.Token, a.PasswordResetToken!));

        if (admin == null)
        {
            throw new UnauthorizedAccessException("Invalid or expired reset token.");
        }

        // Update password and clear reset token
        admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        admin.PasswordResetToken = null;
        admin.PasswordResetTokenExpiry = null;
        admin.MustChangePassword = false;
        admin.FailedLoginAttempts = 0;
        admin.LockoutEndAt = null;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Password reset successful for admin: {AdminId}", admin.Id);
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "Refresh token expired for admin {AdminId}")]
    private static partial void LogAdminRefreshTokenExpired(ILogger logger, Guid adminId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Token refreshed for admin {AdminId}")]
    private static partial void LogAdminTokenRefreshed(ILogger logger, Guid adminId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Admin {AdminId} logged out")]
    private static partial void LogAdminLogout(ILogger logger, Guid adminId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Password changed for admin {AdminId}")]
    private static partial void LogAdminPasswordChanged(ILogger logger, Guid adminId);

    [LoggerMessage(Level = LogLevel.Information, Message = "2FA verified for admin {AdminId}")]
    private static partial void LogAdmin2FAVerified(ILogger logger, Guid adminId);

    /// <inheritdoc/>
    public async Task<bool> EmergencyResetPasswordAsync(
        string email,
        string newPassword,
        CancellationToken cancellationToken = default)
    {
        var normalizedEmail = email.ToUpperInvariant();
        var admin = await _context.AdminUsers
            .FirstOrDefaultAsync(
                a => a.NormalizedEmail == normalizedEmail && a.DeletedAt == null,
                cancellationToken);

        if (admin == null)
        {
            _logger.LogWarning("Emergency reset attempted for non-existent admin: {Email}", email);
            return false;
        }

        // Validate password strength
        ValidatePasswordStrength(newPassword);

        // Update password and reset failed attempts
        admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        admin.PasswordResetToken = null;
        admin.PasswordResetTokenExpiry = null;
        admin.MustChangePassword = false;
        admin.FailedLoginAttempts = 0;
        admin.LockoutEndAt = null;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogWarning("Emergency password reset performed for admin: {AdminId}", admin.Id);
        return true;
    }

    /// <inheritdoc/>
    public async Task<bool> Enable2FAAsync(
        Guid adminId,
        string secret,
        string code,
        CancellationToken cancellationToken = default)
    {
        var admin = await _context.AdminUsers
            .FirstOrDefaultAsync(a => a.Id == adminId && a.DeletedAt == null, cancellationToken);

        if (admin == null)
        {
            _logger.LogWarning("Enable 2FA attempted for non-existent admin: {AdminId}", adminId);
            return false;
        }

        if (admin.TwoFactorEnabled)
        {
            _logger.LogWarning("Enable 2FA attempted but already enabled for admin: {AdminId}", adminId);
            return false;
        }

        // Verify the code against the secret
        if (!_twoFactorAuthService.VerifyCode(secret, code))
        {
            _logger.LogWarning("Invalid 2FA code during enable for admin: {AdminId}", adminId);
            return false;
        }

        // Store secret and enable 2FA
        admin.TwoFactorSecret = secret;
        admin.TwoFactorEnabled = true;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("2FA enabled for admin: {AdminId}", adminId);
        return true;
    }
}
