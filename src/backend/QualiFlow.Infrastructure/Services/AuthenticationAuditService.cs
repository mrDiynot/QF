// -----------------------------------------------------------------------
// <copyright file="AuthenticationAuditService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.AuditLogs.Services;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service implementation for logging authentication-related audit events.
/// </summary>
public partial class AuthenticationAuditService : IAuthenticationAuditService
{
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<AuthenticationAuditService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AuthenticationAuditService"/> class.
    /// </summary>
    public AuthenticationAuditService(
        QualiFlowDbContext context,
        ILogger<AuthenticationAuditService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task LogLoginSuccessAsync(
        Guid userId,
        string email,
        string provider,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Use AsNoTracking to avoid concurrency conflicts with other operations
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
            var businessId = user?.BusinessId ?? Guid.Empty;

            // Skip audit log if we can't find a valid business (FK constraint would fail)
            if (businessId == Guid.Empty)
            {
                LogLoginSuccessEvent(_logger, userId, email, provider);
                return;
            }

            var auditLog = CreateAuthAuditLog(
                businessId,
                userId,
                email,
                "LoginSuccess",
                $"User logged in via {provider}",
                ipAddress,
                userAgent);

            await _context.AuditLogs.AddAsync(auditLog, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            LogLoginSuccessEvent(_logger, userId, email, provider);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            // Log the event even if audit log fails due to concurrent updates
            _logger.LogWarning(
                ex,
                "Concurrency exception while logging login success for user {UserId}. Audit log skipped.",
                userId);
            LogLoginSuccessEvent(_logger, userId, email, provider);
        }
    }

    /// <inheritdoc/>
    public async Task LogLoginFailedAsync(
        string email,
        string reason,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Login failures don't have a user ID yet - try to find user by email to get businessId
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

            // Skip audit log if we can't find a valid business (FK constraint would fail)
            if (user == null || user.BusinessId == Guid.Empty)
            {
                LogLoginFailedEvent(_logger, email, reason, ipAddress ?? "unknown");
                return;
            }

            var auditLog = CreateAuthAuditLog(
                user.BusinessId,
                user.Id,
                email,
                "LoginFailed",
                $"Login failed: {reason}",
                ipAddress,
                userAgent);

            await _context.AuditLogs.AddAsync(auditLog, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            LogLoginFailedEvent(_logger, email, reason, ipAddress ?? "unknown");
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Concurrency exception while logging login failure for {Email}. Audit log skipped.", email);
            LogLoginFailedEvent(_logger, email, reason, ipAddress ?? "unknown");
        }
    }

    /// <inheritdoc/>
    public async Task LogLogoutAsync(
        Guid userId,
        string? ipAddress,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
            var businessId = user?.BusinessId ?? Guid.Empty;

            // Skip audit log if we can't find a valid business (FK constraint would fail)
            if (businessId == Guid.Empty)
            {
                return;
            }

            var auditLog = CreateAuthAuditLog(
                businessId,
                userId,
                user?.Email ?? "Unknown",
                "Logout",
                "User logged out",
                ipAddress,
                userAgent: null);

            await _context.AuditLogs.AddAsync(auditLog, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Concurrency exception while logging logout for user {UserId}. Audit log skipped.", userId);
        }
    }

    /// <inheritdoc/>
    public async Task LogPasswordChangedAsync(
        Guid userId,
        string? ipAddress,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
            var businessId = user?.BusinessId ?? Guid.Empty;

            // Skip audit log if we can't find a valid business (FK constraint would fail)
            if (businessId == Guid.Empty)
            {
                LogPasswordChangedEvent(_logger, userId);
                return;
            }

            var auditLog = CreateAuthAuditLog(
                businessId,
                userId,
                user?.Email ?? "Unknown",
                "PasswordChanged",
                "User changed password",
                ipAddress,
                userAgent: null);

            await _context.AuditLogs.AddAsync(auditLog, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            LogPasswordChangedEvent(_logger, userId);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Concurrency exception while logging password change for user {UserId}. Audit log skipped.", userId);
            LogPasswordChangedEvent(_logger, userId);
        }
    }

    /// <inheritdoc/>
    public async Task LogPasswordChangeFailedAsync(
        Guid userId,
        string? ipAddress,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
            var businessId = user?.BusinessId ?? Guid.Empty;

            // Skip audit log if we can't find a valid business (FK constraint would fail)
            if (businessId == Guid.Empty)
            {
                LogPasswordChangeFailedEvent(_logger, userId);
                return;
            }

            var auditLog = CreateAuthAuditLog(
                businessId,
                userId,
                user?.Email ?? "Unknown",
                "PasswordChangeFailed",
                "Password change attempt failed",
                ipAddress,
                userAgent: null);

            await _context.AuditLogs.AddAsync(auditLog, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            LogPasswordChangeFailedEvent(_logger, userId);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Concurrency exception while logging password change failure for user {UserId}. Audit log skipped.", userId);
            LogPasswordChangeFailedEvent(_logger, userId);
        }
    }

    /// <inheritdoc/>
    public async Task LogMfaStatusChangedAsync(
        Guid userId,
        bool enabled,
        string? ipAddress,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
            var businessId = user?.BusinessId ?? Guid.Empty;

            // Skip audit log if we can't find a valid business (FK constraint would fail)
            if (businessId == Guid.Empty)
            {
                return;
            }

            var action = enabled ? "MfaEnabled" : "MfaDisabled";
            var description = enabled ? "User enabled MFA" : "User disabled MFA";

            var auditLog = CreateAuthAuditLog(
                businessId, userId, user?.Email ?? "Unknown", action, description, ipAddress, null);

            await _context.AuditLogs.AddAsync(auditLog, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Concurrency exception while logging MFA status change for user {UserId}. Audit log skipped.", userId);
        }
    }

    /// <inheritdoc/>
    public async Task LogOAuthConnectedAsync(
        Guid userId,
        string provider,
        string? ipAddress,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
            var businessId = user?.BusinessId ?? Guid.Empty;

            // Skip audit log if we can't find a valid business (FK constraint would fail)
            if (businessId == Guid.Empty)
            {
                return;
            }

            var auditLog = CreateAuthAuditLog(
                businessId, userId, user?.Email ?? "Unknown",
                "OAuthConnected", $"Connected {provider} OAuth", ipAddress, null);

            await _context.AuditLogs.AddAsync(auditLog, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Concurrency exception while logging OAuth connection for user {UserId}. Audit log skipped.", userId);
        }
    }

    /// <inheritdoc/>
    public async Task LogTokenRefreshedAsync(
        Guid userId,
        string? ipAddress,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
            var businessId = user?.BusinessId ?? Guid.Empty;

            // Skip audit log if we can't find a valid business (FK constraint would fail)
            if (businessId == Guid.Empty)
            {
                return;
            }

            var auditLog = CreateAuthAuditLog(
                businessId, userId, user?.Email ?? "Unknown",
                "TokenRefreshed", "Session token refreshed", ipAddress, null);

            await _context.AuditLogs.AddAsync(auditLog, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Concurrency exception while logging token refresh for user {UserId}. Audit log skipped.", userId);
        }
    }

    /// <inheritdoc/>
    public async Task LogSessionExpiredAsync(
        Guid userId,
        string? ipAddress,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
            var businessId = user?.BusinessId ?? Guid.Empty;

            // Skip audit log if we can't find a valid business (FK constraint would fail)
            if (businessId == Guid.Empty)
            {
                return;
            }

            var auditLog = CreateAuthAuditLog(
                businessId, userId, user?.Email ?? "Unknown",
                "SessionExpired", "User session expired", ipAddress, null);

            await _context.AuditLogs.AddAsync(auditLog, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Concurrency exception while logging session expiration for user {UserId}. Audit log skipped.", userId);
        }
    }

    /// <inheritdoc/>
    public async Task LogAccessDeniedAsync(
        Guid? userId,
        string resource,
        string? ipAddress,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var businessId = Guid.Empty;
            var email = "Unknown";
            var resolvedUserId = Guid.Empty;

            if (userId.HasValue)
            {
                var user = await _context.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Id == userId.Value, cancellationToken);
                businessId = user?.BusinessId ?? Guid.Empty;
                email = user?.Email ?? "Unknown";
                resolvedUserId = userId.Value;
            }

            // Skip audit log if we can't find a valid business (FK constraint would fail)
            if (businessId == Guid.Empty)
            {
                LogAccessDeniedEvent(_logger, userId, resource);
                return;
            }

            var auditLog = CreateAuthAuditLog(
                businessId, resolvedUserId, email,
                "AccessDenied", $"Access denied to: {resource}", ipAddress, null);

            await _context.AuditLogs.AddAsync(auditLog, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            LogAccessDeniedEvent(_logger, userId, resource);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Concurrency exception while logging access denied for user {UserId}. Audit log skipped.", userId);
            LogAccessDeniedEvent(_logger, userId, resource);
        }
    }

    /// <inheritdoc/>
    public async Task Log2FAEnabledAsync(
        Guid userId,
        string? ipAddress,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
            var businessId = user?.BusinessId ?? Guid.Empty;

            if (businessId == Guid.Empty)
            {
                Log2FAEnabledEvent(_logger, userId);
                return;
            }

            var auditLog = CreateAuthAuditLog(
                businessId, userId, user?.Email ?? "Unknown",
                "2FAEnabled", "User enabled two-factor authentication", ipAddress, null);

            await _context.AuditLogs.AddAsync(auditLog, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            Log2FAEnabledEvent(_logger, userId);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Concurrency exception while logging 2FA enabled for user {UserId}. Audit log skipped.", userId);
            Log2FAEnabledEvent(_logger, userId);
        }
    }

    /// <inheritdoc/>
    public async Task Log2FADisabledAsync(
        Guid userId,
        string? ipAddress,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
            var businessId = user?.BusinessId ?? Guid.Empty;

            if (businessId == Guid.Empty)
            {
                Log2FADisabledEvent(_logger, userId);
                return;
            }

            var auditLog = CreateAuthAuditLog(
                businessId, userId, user?.Email ?? "Unknown",
                "2FADisabled", "User disabled two-factor authentication", ipAddress, null);

            await _context.AuditLogs.AddAsync(auditLog, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            Log2FADisabledEvent(_logger, userId);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Concurrency exception while logging 2FA disabled for user {UserId}. Audit log skipped.", userId);
            Log2FADisabledEvent(_logger, userId);
        }
    }

    /// <inheritdoc/>
    public async Task Log2FAVerifiedAsync(
        Guid userId,
        string? ipAddress,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
            var businessId = user?.BusinessId ?? Guid.Empty;

            if (businessId == Guid.Empty)
            {
                Log2FAVerifiedEvent(_logger, userId);
                return;
            }

            var auditLog = CreateAuthAuditLog(
                businessId, userId, user?.Email ?? "Unknown",
                "2FAVerified", "User completed two-factor authentication", ipAddress, null);

            await _context.AuditLogs.AddAsync(auditLog, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            Log2FAVerifiedEvent(_logger, userId);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Concurrency exception while logging 2FA verified for user {UserId}. Audit log skipped.", userId);
            Log2FAVerifiedEvent(_logger, userId);
        }
    }

    /// <inheritdoc/>
    public async Task Log2FAFailedAsync(
        Guid userId,
        string? ipAddress,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
            var businessId = user?.BusinessId ?? Guid.Empty;

            if (businessId == Guid.Empty)
            {
                Log2FAFailedEvent(_logger, userId, ipAddress ?? "unknown");
                return;
            }

            var auditLog = CreateAuthAuditLog(
                businessId, userId, user?.Email ?? "Unknown",
                "2FAFailed", "Two-factor authentication verification failed", ipAddress, null);

            await _context.AuditLogs.AddAsync(auditLog, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            Log2FAFailedEvent(_logger, userId, ipAddress ?? "unknown");
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Concurrency exception while logging 2FA failed for user {UserId}. Audit log skipped.", userId);
            Log2FAFailedEvent(_logger, userId, ipAddress ?? "unknown");
        }
    }

    private static AuditLog CreateAuthAuditLog(
        Guid businessId,
        Guid userId,
        string username,
        string action,
        string description,
        string? ipAddress,
        string? userAgent)
    {
        return new AuditLog
        {
            BusinessId = businessId,
            UserId = userId,
            Username = username,
            EntityType = "Authentication",
            EntityId = userId,
            Action = AuditAction.Read, // Authentication events use Read as placeholder
            OldValues = null,
            NewValues = $"{{\"action\":\"{action}\",\"description\":\"{description}\"}}",
            IpAddress = ipAddress ?? string.Empty,
            UserAgent = userAgent,
            CreatedAt = DateTime.UtcNow
        };
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Login success: UserId={UserId}, Email={Email}, Provider={Provider}")]
    private static partial void LogLoginSuccessEvent(ILogger logger, Guid userId, string email, string provider);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Login failed: Email={Email}, Reason={Reason}, IP={IpAddress}")]
    private static partial void LogLoginFailedEvent(ILogger logger, string email, string reason, string ipAddress);

    [LoggerMessage(Level = LogLevel.Information, Message = "Password changed: UserId={UserId}")]
    private static partial void LogPasswordChangedEvent(ILogger logger, Guid userId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Password change failed: UserId={UserId}")]
    private static partial void LogPasswordChangeFailedEvent(ILogger logger, Guid userId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Access denied: UserId={UserId}, Resource={Resource}")]
    private static partial void LogAccessDeniedEvent(ILogger logger, Guid? userId, string resource);

    [LoggerMessage(Level = LogLevel.Information, Message = "2FA enabled: UserId={UserId}")]
    private static partial void Log2FAEnabledEvent(ILogger logger, Guid userId);

    [LoggerMessage(Level = LogLevel.Information, Message = "2FA disabled: UserId={UserId}")]
    private static partial void Log2FADisabledEvent(ILogger logger, Guid userId);

    [LoggerMessage(Level = LogLevel.Information, Message = "2FA verified: UserId={UserId}")]
    private static partial void Log2FAVerifiedEvent(ILogger logger, Guid userId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "2FA failed: UserId={UserId}, IP={IpAddress}")]
    private static partial void Log2FAFailedEvent(ILogger logger, Guid userId, string ipAddress);
}

