// -----------------------------------------------------------------------
// <copyright file="AdminUserService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Security.Cryptography;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

using QualiFlow.Application.Common.Models;
using QualiFlow.Application.Features.Admin.Users;
using QualiFlow.Application.Features.Admin.Users.DTOs;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for managing admin users.
/// Admin users are independent from business users with their own credentials.
/// </summary>
public partial class AdminUserService : IAdminUserService
{
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<AdminUserService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AdminUserService"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="logger">The logger.</param>
    public AdminUserService(
        QualiFlowDbContext context,
        ILogger<AdminUserService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<CreateAdminUserResponse> CreateAdminUserAsync(
        CreateAdminUserRequest request,
        CancellationToken cancellationToken)
    {
        // Check if admin with this email already exists
        var normalizedEmail = request.Email.ToUpperInvariant();
        var existingAdmin = await _context.AdminUsers
            .AsNoTracking()
            .FirstOrDefaultAsync(
                a => a.NormalizedEmail == normalizedEmail && a.DeletedAt == null,
                cancellationToken);

        if (existingAdmin != null)
        {
            throw new InvalidOperationException($"An admin user with email {request.Email} already exists.");
        }

        // Generate a secure temporary password
        var temporaryPassword = GenerateTemporaryPassword();

        var adminUser = new AdminUser
        {
            Email = request.Email,
            NormalizedEmail = request.Email.ToUpperInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(temporaryPassword),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Role = request.Role,
            IsActive = true,
            MustChangePassword = true,
            TwoFactorEnabled = false,
            CreatedAt = DateTime.UtcNow
        };

        // Add IP whitelist if provided
        if (request.IpWhitelist != null)
        {
            foreach (var ip in request.IpWhitelist)
            {
                adminUser.IpWhitelist.Add(ip);
            }
        }

        await _context.AdminUsers.AddAsync(adminUser, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        LogAdminUserCreated(_logger, adminUser.Id, request.Email, request.Role.ToString());

        var dto = MapToDto(adminUser);
        return new CreateAdminUserResponse
        {
            Admin = dto,
            TemporaryPassword = temporaryPassword
        };
    }

    /// <inheritdoc/>
    public async Task<AdminUserDto?> GetAdminUserAsync(Guid adminUserId, CancellationToken cancellationToken)
    {
        var adminUser = await _context.AdminUsers
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == adminUserId && a.DeletedAt == null, cancellationToken);

        return adminUser == null ? null : MapToDto(adminUser);
    }

    /// <inheritdoc/>
    public async Task<AdminUserDto?> GetAdminUserByEmailAsync(string email, CancellationToken cancellationToken)
    {
        var normalizedEmail = email.ToUpperInvariant();
        var adminUser = await _context.AdminUsers
            .AsNoTracking()
            .FirstOrDefaultAsync(
                a => a.NormalizedEmail == normalizedEmail && a.DeletedAt == null,
                cancellationToken);

        return adminUser == null ? null : MapToDto(adminUser);
    }

    /// <inheritdoc/>
    public async Task<PagedResult<AdminUserDto>> GetAdminUsersAsync(
        AdminUserQuery query,
        CancellationToken cancellationToken)
    {
        var queryable = _context.AdminUsers
            .AsNoTracking()
            .Where(a => a.DeletedAt == null);

        // Apply filters
        if (!string.IsNullOrWhiteSpace(query.SearchTerm))
        {
            queryable = queryable.Where(a =>
                a.NormalizedEmail.Contains(query.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                a.FirstName.Contains(query.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                a.LastName.Contains(query.SearchTerm, StringComparison.OrdinalIgnoreCase));
        }

        if (query.Role.HasValue)
        {
            queryable = queryable.Where(a => a.Role == query.Role.Value);
        }

        if (query.IsActive.HasValue)
        {
            queryable = queryable.Where(a => a.IsActive == query.IsActive.Value);
        }

        var totalItems = await queryable.CountAsync(cancellationToken);

        var items = await queryable
            .OrderByDescending(a => a.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<AdminUserDto>
        {
            Items = items.Select(MapToDto).ToList(),
            TotalItems = totalItems,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    /// <inheritdoc/>
    public async Task<AdminUserDto> UpdateAdminRoleAsync(
        Guid adminUserId,
        AdminRole newRole,
        CancellationToken cancellationToken)
    {
        var adminUser = await _context.AdminUsers
            .FirstOrDefaultAsync(a => a.Id == adminUserId && a.DeletedAt == null, cancellationToken)
            ?? throw new KeyNotFoundException($"Admin user {adminUserId} not found.");

        var oldRole = adminUser.Role;
        adminUser.Role = newRole;
        adminUser.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        LogAdminRoleUpdated(_logger, adminUserId, oldRole.ToString(), newRole.ToString());

        return MapToDto(adminUser);
    }

    /// <inheritdoc/>
    public async Task<AdminUserDto> UpdateIpWhitelistAsync(
        Guid adminUserId,
        IReadOnlyList<string> ipWhitelist,
        CancellationToken cancellationToken)
    {
        var adminUser = await _context.AdminUsers
            .FirstOrDefaultAsync(a => a.Id == adminUserId && a.DeletedAt == null, cancellationToken)
            ?? throw new KeyNotFoundException($"Admin user {adminUserId} not found.");

        adminUser.IpWhitelist.Clear();
        foreach (var ip in ipWhitelist)
        {
            adminUser.IpWhitelist.Add(ip);
        }

        adminUser.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        LogIpWhitelistUpdated(_logger, adminUserId, ipWhitelist.Count);

        return MapToDto(adminUser);
    }

    /// <inheritdoc/>
    public async Task DeactivateAdminUserAsync(Guid adminUserId, CancellationToken cancellationToken)
    {
        var adminUser = await _context.AdminUsers
            .FirstOrDefaultAsync(a => a.Id == adminUserId && a.DeletedAt == null, cancellationToken)
            ?? throw new KeyNotFoundException($"Admin user {adminUserId} not found.");

        adminUser.IsActive = false;
        adminUser.UpdatedAt = DateTime.UtcNow;

        // Invalidate refresh token
        adminUser.RefreshToken = null;
        adminUser.RefreshTokenExpiresAt = null;

        await _context.SaveChangesAsync(cancellationToken);

        LogAdminUserDeactivated(_logger, adminUserId);
    }

    /// <inheritdoc/>
    public async Task<AdminUserDto> ReactivateAdminUserAsync(
        Guid adminUserId,
        CancellationToken cancellationToken)
    {
        var adminUser = await _context.AdminUsers
            .FirstOrDefaultAsync(a => a.Id == adminUserId && a.DeletedAt == null, cancellationToken)
            ?? throw new KeyNotFoundException($"Admin user {adminUserId} not found.");

        adminUser.IsActive = true;
        adminUser.UpdatedAt = DateTime.UtcNow;

        // Reset lockout if any
        adminUser.FailedLoginAttempts = 0;
        adminUser.LockoutEndAt = null;

        await _context.SaveChangesAsync(cancellationToken);

        LogAdminUserReactivated(_logger, adminUserId);

        return MapToDto(adminUser);
    }

    /// <inheritdoc/>
    public async Task<string> ResetPasswordAsync(Guid adminUserId, CancellationToken cancellationToken)
    {
        var adminUser = await _context.AdminUsers
            .FirstOrDefaultAsync(a => a.Id == adminUserId && a.DeletedAt == null, cancellationToken)
            ?? throw new KeyNotFoundException($"Admin user {adminUserId} not found.");

        var temporaryPassword = GenerateTemporaryPassword();

        adminUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(temporaryPassword);
        adminUser.MustChangePassword = true;
        adminUser.UpdatedAt = DateTime.UtcNow;

        // Invalidate refresh token
        adminUser.RefreshToken = null;
        adminUser.RefreshTokenExpiresAt = null;

        // Reset lockout
        adminUser.FailedLoginAttempts = 0;
        adminUser.LockoutEndAt = null;

        await _context.SaveChangesAsync(cancellationToken);

        LogAdminPasswordReset(_logger, adminUserId);

        return temporaryPassword;
    }

    /// <inheritdoc/>
    public async Task RecordLoginAsync(Guid adminUserId, string? ipAddress, CancellationToken cancellationToken)
    {
        var adminUser = await _context.AdminUsers
            .FirstOrDefaultAsync(a => a.Id == adminUserId && a.DeletedAt == null, cancellationToken);

        if (adminUser != null)
        {
            adminUser.LastLoginAt = DateTime.UtcNow;
            adminUser.LastLoginIp = ipAddress;
            adminUser.FailedLoginAttempts = 0;

            await _context.SaveChangesAsync(cancellationToken);

            LogAdminLoginRecorded(_logger, adminUserId, ipAddress);
        }
    }

    private static AdminUserDto MapToDto(AdminUser adminUser)
    {
        return new AdminUserDto
        {
            Id = adminUser.Id,
            Email = adminUser.Email,
            FirstName = adminUser.FirstName,
            LastName = adminUser.LastName,
            FullName = adminUser.FullName,
            Role = adminUser.Role,
            IpWhitelist = adminUser.IpWhitelist.ToList(),
            IsActive = adminUser.IsActive,
            MustChangePassword = adminUser.MustChangePassword,
            TwoFactorEnabled = adminUser.TwoFactorEnabled,
            LastLoginAt = adminUser.LastLoginAt,
            LastLoginIp = adminUser.LastLoginIp,
            CreatedAt = adminUser.CreatedAt,
            UpdatedAt = adminUser.UpdatedAt
        };
    }

    private static string GenerateTemporaryPassword()
    {
        const string upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const string lowerCase = "abcdefghijklmnopqrstuvwxyz";
        const string digits = "0123456789";
        const string special = "!@#$%^&*";
        const string allChars = upperCase + lowerCase + digits + special;

        var password = new char[16];
        using var rng = RandomNumberGenerator.Create();

        // Ensure at least one of each type
        password[0] = upperCase[GetRandomIndex(rng, upperCase.Length)];
        password[1] = lowerCase[GetRandomIndex(rng, lowerCase.Length)];
        password[2] = digits[GetRandomIndex(rng, digits.Length)];
        password[3] = special[GetRandomIndex(rng, special.Length)];

        // Fill the rest
        for (int i = 4; i < password.Length; i++)
        {
            password[i] = allChars[GetRandomIndex(rng, allChars.Length)];
        }

        // Shuffle
        var bytes = new byte[password.Length];
        rng.GetBytes(bytes);
        Array.Sort(bytes, password);

        return new string(password);
    }

    private static int GetRandomIndex(RandomNumberGenerator rng, int maxValue)
    {
        var bytes = new byte[4];
        rng.GetBytes(bytes);
        return Math.Abs(BitConverter.ToInt32(bytes, 0)) % maxValue;
    }

    // Logging methods
    [LoggerMessage(Level = LogLevel.Information, Message = "Created admin user {AdminUserId} with email {Email} and role {Role}")]
    private static partial void LogAdminUserCreated(ILogger logger, Guid adminUserId, string email, string role);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updated admin user {AdminUserId} role from {OldRole} to {NewRole}")]
    private static partial void LogAdminRoleUpdated(ILogger logger, Guid adminUserId, string oldRole, string newRole);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updated IP whitelist for admin user {AdminUserId} with {IpCount} addresses")]
    private static partial void LogIpWhitelistUpdated(ILogger logger, Guid adminUserId, int ipCount);

    [LoggerMessage(Level = LogLevel.Information, Message = "Deactivated admin user {AdminUserId}")]
    private static partial void LogAdminUserDeactivated(ILogger logger, Guid adminUserId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Reactivated admin user {AdminUserId}")]
    private static partial void LogAdminUserReactivated(ILogger logger, Guid adminUserId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Reset password for admin user {AdminUserId}")]
    private static partial void LogAdminPasswordReset(ILogger logger, Guid adminUserId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Recorded login for admin user {AdminUserId} from IP {IpAddress}")]
    private static partial void LogAdminLoginRecorded(ILogger logger, Guid adminUserId, string? ipAddress);
}
