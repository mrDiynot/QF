// -----------------------------------------------------------------------
// <copyright file="ConstantsValidationService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

using QualiFlow.Domain.Constants;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Hosted service that validates all code constants match database records on startup.
/// Ensures synchronization between code constants and database seed data for:
/// Subscription Plans (PlanConstants), User Roles (RoleConstants),
/// Features (FeatureConstants), and Plan Limits (LimitConstants).
/// </summary>
public partial class ConstantsValidationService : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ConstantsValidationService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="ConstantsValidationService"/> class.
    /// </summary>
    public ConstantsValidationService(
        IServiceProvider serviceProvider,
        ILogger<ConstantsValidationService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        LogValidationStarted(_logger);

        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<QualiFlowDbContext>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();

        try
        {
            var validationErrors = new List<string>();

            // Validate Plans (Critical - prevents app startup if missing)
            await ValidatePlansAsync(context, validationErrors, cancellationToken);

            // Validate Roles (Critical - prevents app startup if missing)
            await ValidateRolesAsync(roleManager, validationErrors, cancellationToken);

            // Validate Features (Warning only - logs but doesn't block startup)
            await ValidateFeaturesAsync(context, cancellationToken);

            // Validate Limit Keys (Warning only - logs but doesn't block startup)
            await ValidateLimitKeysAsync(context, cancellationToken);

            // If any critical validation errors, throw
            if (validationErrors.Count > 0)
            {
                var allErrors = string.Join("; ", validationErrors);
                throw new InvalidOperationException(
                    $"Constants validation failed: {allErrors}. " +
                    "Please ensure database migrations and seed data are up to date.");
            }

            LogValidationComplete(_logger);
        }
        catch (InvalidOperationException)
        {
            // Re-throw validation failures - these should prevent app startup
            throw;
        }
        catch (Exception ex)
        {
            // Log but don't fail startup for transient DB issues
            LogValidationError(_logger, ex.Message);
        }
    }

    /// <inheritdoc />
    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    // ========================================================================
    // VALIDATION METHODS
    // ========================================================================

    private async Task ValidatePlansAsync(
        QualiFlowDbContext context,
        List<string> errors,
        CancellationToken cancellationToken)
    {
        var dbPlans = await context.SubscriptionPlans
            .Where(p => p.IsActive)
            .Select(p => p.Name)
            .ToListAsync(cancellationToken);

        if (dbPlans.Count == 0)
        {
            LogNoDataWarning(_logger, "subscription_plans");
            return;
        }

        var codePlans = new[]
        {
            PlanConstants.FreeFlow,
            PlanConstants.SmartFlow,
            PlanConstants.UltraFlow,
            PlanConstants.Enterprise,
        };

        var missing = codePlans
            .Where(cp => !dbPlans.Exists(dp =>
                string.Equals(dp, cp, StringComparison.OrdinalIgnoreCase)))
            .ToList();

        if (missing.Count > 0)
        {
            var missingStr = string.Join(", ", missing);
            LogConstantsMissing(_logger, "Plans", missingStr);
            errors.Add($"Plans missing in DB: {missingStr}");
        }
        else
        {
            LogCategorySuccess(_logger, "Plans", codePlans.Length);
        }
    }

    private async Task ValidateRolesAsync(
        RoleManager<ApplicationRole> roleManager,
        List<string> errors,
        CancellationToken cancellationToken)
    {
        var dbRoles = await roleManager.Roles
            .Select(r => r.Name!)
            .ToListAsync(cancellationToken);

        if (dbRoles.Count == 0)
        {
            LogNoDataWarning(_logger, "roles");
            return;
        }

        var missing = RoleConstants.AllRoles
            .Where(cr => !dbRoles.Exists(dr =>
                string.Equals(dr, cr, StringComparison.OrdinalIgnoreCase)))
            .ToList();

        if (missing.Count > 0)
        {
            var missingStr = string.Join(", ", missing);
            LogConstantsMissing(_logger, "Roles", missingStr);
            errors.Add($"Roles missing in DB: {missingStr}");
        }
        else
        {
            LogCategorySuccess(_logger, "Roles", RoleConstants.AllRoles.Length);
        }
    }

    private async Task ValidateFeaturesAsync(
        QualiFlowDbContext context,
        CancellationToken cancellationToken)
    {
        var dbFeatures = await context.Features
            .Where(f => f.IsActive)
            .Select(f => f.FeatureKey)
            .ToListAsync(cancellationToken);

        if (dbFeatures.Count == 0)
        {
            LogNoDataWarning(_logger, "features");
            return;
        }

        var missing = FeatureConstants.AllFeatureKeys
            .Where(cf => !dbFeatures.Exists(df =>
                string.Equals(df, cf, StringComparison.OrdinalIgnoreCase)))
            .ToList();

        if (missing.Count > 0)
        {
            var missingStr = string.Join(", ", missing);
            LogConstantsMissing(_logger, "Features", missingStr);

            // Features are warning only (not critical for app function)
            LogWarningOnly(_logger, "Features", missingStr);
        }
        else
        {
            LogCategorySuccess(_logger, "Features", FeatureConstants.AllFeatureKeys.Length);
        }
    }

    private async Task ValidateLimitKeysAsync(
        QualiFlowDbContext context,
        CancellationToken cancellationToken)
    {
        var dbLimitKeys = await context.PlanLimits
            .Select(l => l.LimitKey)
            .Distinct()
            .ToListAsync(cancellationToken);

        if (dbLimitKeys.Count == 0)
        {
            LogNoDataWarning(_logger, "plan_limits");
            return;
        }

        var missing = LimitConstants.AllLimitKeys
            .Where(cl => !dbLimitKeys.Exists(dl =>
                string.Equals(dl, cl, StringComparison.OrdinalIgnoreCase)))
            .ToList();

        if (missing.Count > 0)
        {
            var missingStr = string.Join(", ", missing);
            LogConstantsMissing(_logger, "LimitKeys", missingStr);

            // Limit keys are warning only (app can still function)
            LogWarningOnly(_logger, "LimitKeys", missingStr);
        }
        else
        {
            LogCategorySuccess(_logger, "LimitKeys", LimitConstants.AllLimitKeys.Length);
        }
    }

    // ========================================================================
    // HIGH-PERFORMANCE LOGGING
    // ========================================================================

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Starting constants validation against database (Plans, Roles, Features, Limits)...")]
    private static partial void LogValidationStarted(ILogger logger);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Constants validation complete. All critical constants verified.")]
    private static partial void LogValidationComplete(ILogger logger);

    [LoggerMessage(
        Level = LogLevel.Warning,
        Message = "No data found in {TableName} table. Skipping validation.")]
    private static partial void LogNoDataWarning(ILogger logger, string tableName);

    [LoggerMessage(
        Level = LogLevel.Critical,
        Message = "{Category} constants missing in database: {Missing}")]
    private static partial void LogConstantsMissing(ILogger logger, string category, string missing);

    [LoggerMessage(
        Level = LogLevel.Warning,
        Message = "{Category} missing (non-critical): {Missing}. Consider updating seed data.")]
    private static partial void LogWarningOnly(ILogger logger, string category, string missing);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "{Category} validation passed: {Count} constants verified.")]
    private static partial void LogCategorySuccess(ILogger logger, string category, int count);

    [LoggerMessage(
        Level = LogLevel.Warning,
        Message = "Could not validate constants: {ErrorMessage}. This may be expected during initial deployment.")]
    private static partial void LogValidationError(ILogger logger, string errorMessage);
}

