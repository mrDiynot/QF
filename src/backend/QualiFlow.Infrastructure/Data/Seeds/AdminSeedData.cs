// -----------------------------------------------------------------------
// <copyright file="AdminSeedData.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Data.Seeds;

/// <summary>
/// Provides seed data for admin users.
/// </summary>
public static class AdminSeedData
{
    /// <summary>
    /// Seeds the SuperAdmin user if none exists.
    /// The SuperAdmin is created with a configured password that must be changed on first login.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="configuration">The application configuration.</param>
    /// <param name="logger">The logger instance.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    public static async Task SeedSuperAdminAsync(
        QualiFlowDbContext context,
        IConfiguration configuration,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        // Check if any admin users exist
        var existingAdmins = await context.AdminUsers
            .AsNoTracking()
            .AnyAsync(a => a.DeletedAt == null, cancellationToken);

        if (existingAdmins)
        {
            logger.LogInformation("Admin users already exist. Skipping seed.");
            return;
        }

        // Get SuperAdmin configuration
        var email = configuration["AdminSeed:Email"] ?? "superadmin@qualiflow.ai";
        var firstName = configuration["AdminSeed:FirstName"] ?? "Super";
        var lastName = configuration["AdminSeed:LastName"] ?? "Admin";
        var password = configuration["AdminSeed:Password"];
        var environment = configuration["ASPNETCORE_ENVIRONMENT"] ?? Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        var isProduction = string.Equals(environment, "Production", StringComparison.OrdinalIgnoreCase);

        if (string.IsNullOrEmpty(password))
        {
            if (isProduction)
            {
                logger.LogError(
                    "CRITICAL: AdminSeed:Password is not configured. " +
                    "SuperAdmin cannot be created in Production without a configured password. " +
                    "Set AdminSeed:Password in Azure Key Vault or environment variables.");
                throw new InvalidOperationException(
                    "AdminSeed:Password must be configured in Production. " +
                    "SuperAdmin seeding aborted for security.");
            }

            // Only allow default password in Development/Staging with strong warning
            logger.LogWarning(
                "⚠️ AdminSeed:Password not configured. Using development default password. " +
                "This is ONLY acceptable in Development environment!");
            password = "Dev@Admin123!";
        }

        var superAdmin = new AdminUser
        {
            Email = email,
            NormalizedEmail = email.ToUpperInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            FirstName = firstName,
            LastName = lastName,
            Role = AdminRole.SuperAdmin,
            IsActive = true,
            MustChangePassword = false,
            TwoFactorEnabled = false,
            CreatedAt = DateTime.UtcNow
        };

        await context.AdminUsers.AddAsync(superAdmin, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        logger.LogInformation(
            "SuperAdmin user created with email {Email}. Password must be changed on first login.",
            email);
    }
}
