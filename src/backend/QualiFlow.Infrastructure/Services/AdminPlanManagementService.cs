// -----------------------------------------------------------------------
// <copyright file="AdminPlanManagementService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.Admin.Billing;
using QualiFlow.Application.Features.Admin.Billing.DTOs;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Entities.CMS;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for managing subscription plans, features, and limits.
/// Implements CMS sync to keep billing and display data consistent.
/// </summary>
public partial class AdminPlanManagementService : IAdminPlanManagementService
{
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<AdminPlanManagementService> _logger;

    /// <summary>Initializes a new instance of the <see cref="AdminPlanManagementService"/> class.</summary>
    public AdminPlanManagementService(QualiFlowDbContext context, ILogger<AdminPlanManagementService> logger)
    {
        _context = context;
        _logger = logger;
    }

    // ========================================================================
    // Subscription Plans
    // ========================================================================

    /// <inheritdoc/>
    public async Task<IReadOnlyList<AdminPlanDto>> GetAllPlansAsync(bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        var query = _context.SubscriptionPlans
            .AsNoTracking()
            .AsSplitQuery()
            .Include(p => p.Limits)
            .Include(p => p.Features)
                .ThenInclude(pf => pf.Feature)
            .Where(p => p.DeletedAt == null);

        if (!includeInactive)
        {
            query = query.Where(p => p.IsActive);
        }

        var plans = await query.OrderBy(p => p.SortOrder).ToListAsync(cancellationToken);

        return plans.Select(MapToPlanDto).ToList();
    }

    /// <inheritdoc/>
    public async Task<AdminPlanDto?> GetPlanByIdAsync(Guid planId, CancellationToken cancellationToken = default)
    {
        var plan = await _context.SubscriptionPlans
            .AsNoTracking()
            .AsSplitQuery()
            .Include(p => p.Limits)
            .Include(p => p.Features)
                .ThenInclude(pf => pf.Feature)
            .FirstOrDefaultAsync(p => p.Id == planId && p.DeletedAt == null, cancellationToken);

        return plan == null ? null : MapToPlanDto(plan);
    }

    /// <inheritdoc/>
    public async Task<AdminPlanDto> CreatePlanAsync(AdminPlanRequest request, CancellationToken cancellationToken = default)
    {
        var plan = new SubscriptionPlan
        {
            Id = Guid.NewGuid(),
            Name = request.Name.ToLowerInvariant().Replace(" ", string.Empty, StringComparison.Ordinal),
            DisplayName = request.DisplayName,
            Description = request.Description,
            PriceMonthly = request.PriceMonthly,
            PriceQuarterly = request.PriceQuarterly,
            PriceYearly = request.PriceYearly,
            DiscountQuarterly = request.DiscountQuarterly,
            DiscountAnnual = request.DiscountAnnual,
            OnboardingPrice = request.OnboardingPrice,
            OnboardingRequired = request.OnboardingRequired,
            StripePriceIdMonthly = request.StripePriceIdMonthly,
            StripePriceIdQuarterly = request.StripePriceIdQuarterly,
            StripePriceIdYearly = request.StripePriceIdYearly,
            AllowsTrial = request.AllowsTrial,
            TrialDays = request.TrialDays,
            IsActive = request.IsActive,
            IsPublic = request.IsPublic,
            Version = 1,
            SortOrder = request.SortOrder,
            CreatedAt = DateTime.UtcNow,
        };

        _context.SubscriptionPlans.Add(plan);
        await _context.SaveChangesAsync(cancellationToken);

        LogPlanCreated(plan.Name, plan.Id);

        if (request.SyncToCms)
        {
            await SyncPlanToCmsAsync(plan, cancellationToken);
        }

        return MapToPlanDto(plan);
    }

    /// <inheritdoc/>
    public async Task<AdminPlanDto?> UpdatePlanAsync(Guid planId, AdminPlanRequest request, CancellationToken cancellationToken = default)
    {
        var plan = await _context.SubscriptionPlans
            .Include(p => p.Limits)
            .Include(p => p.Features)
                .ThenInclude(pf => pf.Feature)
            .FirstOrDefaultAsync(p => p.Id == planId && p.DeletedAt == null, cancellationToken);

        if (plan == null)
        {
            return null;
        }

        plan.Name = request.Name.ToLowerInvariant().Replace(" ", string.Empty, StringComparison.Ordinal);
        plan.DisplayName = request.DisplayName;
        plan.Description = request.Description;
        plan.PriceMonthly = request.PriceMonthly;
        plan.PriceQuarterly = request.PriceQuarterly;
        plan.PriceYearly = request.PriceYearly;
        plan.DiscountQuarterly = request.DiscountQuarterly;
        plan.DiscountAnnual = request.DiscountAnnual;
        plan.OnboardingPrice = request.OnboardingPrice;
        plan.OnboardingRequired = request.OnboardingRequired;
        plan.StripePriceIdMonthly = request.StripePriceIdMonthly;
        plan.StripePriceIdQuarterly = request.StripePriceIdQuarterly;
        plan.StripePriceIdYearly = request.StripePriceIdYearly;
        plan.AllowsTrial = request.AllowsTrial;
        plan.TrialDays = request.TrialDays;
        plan.IsActive = request.IsActive;
        plan.IsPublic = request.IsPublic;
        plan.SortOrder = request.SortOrder;
        plan.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        LogPlanUpdated(plan.Name, plan.Id);

        if (request.SyncToCms)
        {
            await SyncPlanToCmsAsync(plan, cancellationToken);
        }

        return MapToPlanDto(plan);
    }

    /// <inheritdoc/>
    public async Task<AdminPlanDto?> TogglePlanStatusAsync(Guid planId, bool? isActive = null, bool? isPublic = null, CancellationToken cancellationToken = default)
    {
        var plan = await _context.SubscriptionPlans
            .Include(p => p.Limits)
            .Include(p => p.Features)
                .ThenInclude(pf => pf.Feature)
            .FirstOrDefaultAsync(p => p.Id == planId && p.DeletedAt == null, cancellationToken);

        if (plan == null)
        {
            return null;
        }

        if (isActive.HasValue)
        {
            plan.IsActive = isActive.Value;
        }

        if (isPublic.HasValue)
        {
            plan.IsPublic = isPublic.Value;
        }

        plan.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Plan {PlanId} status toggled: IsActive={IsActive}, IsPublic={IsPublic}", planId, plan.IsActive, plan.IsPublic);

        return MapToPlanDto(plan);
    }

    /// <inheritdoc/>
    public async Task<bool> DeletePlanAsync(Guid planId, CancellationToken cancellationToken = default)
    {
        var plan = await _context.SubscriptionPlans
            .FirstOrDefaultAsync(p => p.Id == planId && p.DeletedAt == null, cancellationToken);

        if (plan == null)
        {
            return false;
        }

        // Check if any subscriptions use this plan
        var hasSubscriptions = await _context.Subscriptions
            .AnyAsync(s => s.PlanId == planId, cancellationToken);

        if (hasSubscriptions)
        {
            // Soft-delete (deactivate) instead of hard delete
            plan.IsActive = false;
            plan.IsPublic = false;
            plan.UpdatedAt = DateTime.UtcNow;
            LogPlanDeactivated(plan.Name, plan.Id);
        }
        else
        {
            // Hard delete if no subscriptions
            plan.DeletedAt = DateTime.UtcNow;
            LogPlanDeleted(plan.Name, plan.Id);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    // ========================================================================
    // Features
    // ========================================================================

    /// <inheritdoc/>
    public async Task<IReadOnlyList<AdminFeatureDto>> GetAllFeaturesAsync(bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        var query = _context.Features
            .AsNoTracking()
            .Include(f => f.PlanFeatures)
                .ThenInclude(pf => pf.Plan)
            .Where(f => f.DeletedAt == null);

        if (!includeInactive)
        {
            query = query.Where(f => f.IsActive);
        }

        var features = await query.OrderBy(f => f.Category).ThenBy(f => f.FeatureKey).ToListAsync(cancellationToken);

        return features.Select(MapToFeatureDto).ToList();
    }

    /// <inheritdoc/>
    public async Task<AdminFeatureDto?> GetFeatureByIdAsync(Guid featureId, CancellationToken cancellationToken = default)
    {
        var feature = await _context.Features
            .AsNoTracking()
            .Include(f => f.PlanFeatures)
                .ThenInclude(pf => pf.Plan)
            .FirstOrDefaultAsync(f => f.Id == featureId && f.DeletedAt == null, cancellationToken);

        return feature == null ? null : MapToFeatureDto(feature);
    }

    /// <inheritdoc/>
    public async Task<AdminFeatureDto> CreateFeatureAsync(AdminFeatureRequest request, CancellationToken cancellationToken = default)
    {
        var feature = new Feature
        {
            Id = Guid.NewGuid(),
            FeatureKey = request.FeatureKey.ToLowerInvariant().Replace(" ", "_", StringComparison.Ordinal),
            DisplayName = request.DisplayName,
            Description = request.Description,
            Category = request.Category.ToLowerInvariant(),
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow,
        };

        _context.Features.Add(feature);
        await _context.SaveChangesAsync(cancellationToken);

        LogFeatureCreated(feature.FeatureKey, feature.Id);

        return MapToFeatureDto(feature);
    }

    /// <inheritdoc/>
    public async Task<AdminFeatureDto?> UpdateFeatureAsync(Guid featureId, AdminFeatureRequest request, CancellationToken cancellationToken = default)
    {
        var feature = await _context.Features
            .Include(f => f.PlanFeatures)
                .ThenInclude(pf => pf.Plan)
            .FirstOrDefaultAsync(f => f.Id == featureId && f.DeletedAt == null, cancellationToken);

        if (feature == null)
        {
            return null;
        }

        feature.FeatureKey = request.FeatureKey.ToLowerInvariant().Replace(" ", "_", StringComparison.Ordinal);
        feature.DisplayName = request.DisplayName;
        feature.Description = request.Description;
        feature.Category = request.Category.ToLowerInvariant();
        feature.IsActive = request.IsActive;
        feature.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        LogFeatureUpdated(feature.FeatureKey, feature.Id);

        return MapToFeatureDto(feature);
    }

    /// <inheritdoc/>
    public async Task<bool> DeleteFeatureAsync(Guid featureId, CancellationToken cancellationToken = default)
    {
        var feature = await _context.Features
            .FirstOrDefaultAsync(f => f.Id == featureId && f.DeletedAt == null, cancellationToken);

        if (feature == null)
        {
            return false;
        }

        feature.DeletedAt = DateTime.UtcNow;
        feature.IsActive = false;
        await _context.SaveChangesAsync(cancellationToken);

        LogFeatureDeleted(feature.FeatureKey, feature.Id);

        return true;
    }

    // ========================================================================
    // Plan Limits
    // ========================================================================

    /// <inheritdoc/>
    public async Task<IReadOnlyList<AdminPlanLimitDto>> GetAllPlanLimitsAsync(Guid? planId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.PlanLimits
            .AsNoTracking()
            .Include(l => l.Plan)
            .Where(l => l.Plan.DeletedAt == null);

        if (planId.HasValue)
        {
            query = query.Where(l => l.PlanId == planId.Value);
        }

        var limits = await query.OrderBy(l => l.Plan.SortOrder).ThenBy(l => l.LimitKey).ToListAsync(cancellationToken);

        return limits.Select(l => new AdminPlanLimitDto
        {
            Id = l.Id,
            PlanId = l.PlanId,
            PlanName = l.Plan.DisplayName ?? l.Plan.Name,
            LimitKey = l.LimitKey,
            LimitValue = l.LimitValue,
            LimitType = l.LimitType,
            CreatedAt = l.CreatedAt,
        }).ToList();
    }

    /// <inheritdoc/>
    public async Task<AdminPlanLimitDto?> GetPlanLimitByIdAsync(Guid limitId, CancellationToken cancellationToken = default)
    {
        var limit = await _context.PlanLimits
            .AsNoTracking()
            .Include(l => l.Plan)
            .FirstOrDefaultAsync(l => l.Id == limitId, cancellationToken);

        if (limit == null)
        {
            return null;
        }

        return new AdminPlanLimitDto
        {
            Id = limit.Id,
            PlanId = limit.PlanId,
            PlanName = limit.Plan.DisplayName ?? limit.Plan.Name,
            LimitKey = limit.LimitKey,
            LimitValue = limit.LimitValue,
            LimitType = limit.LimitType,
            CreatedAt = limit.CreatedAt,
        };
    }

    /// <inheritdoc/>
    public async Task<AdminPlanLimitDto> UpsertPlanLimitAsync(AdminPlanLimitRequest request, CancellationToken cancellationToken = default)
    {
        var existing = await _context.PlanLimits
            .Include(l => l.Plan)
            .FirstOrDefaultAsync(l => l.PlanId == request.PlanId && l.LimitKey == request.LimitKey, cancellationToken);

        if (existing != null)
        {
            existing.LimitValue = request.LimitValue;
            existing.LimitType = request.LimitType;
            existing.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
            LogPlanLimitUpdated(request.LimitKey, request.PlanId);
        }
        else
        {
            existing = new PlanLimit
            {
                Id = Guid.NewGuid(),
                PlanId = request.PlanId,
                LimitKey = request.LimitKey,
                LimitValue = request.LimitValue,
                LimitType = request.LimitType,
                CreatedAt = DateTime.UtcNow,
            };
            _context.PlanLimits.Add(existing);
            await _context.SaveChangesAsync(cancellationToken);

            // Reload with Plan
            existing = await _context.PlanLimits
                .Include(l => l.Plan)
                .FirstAsync(l => l.Id == existing.Id, cancellationToken);

            LogPlanLimitCreated(request.LimitKey, request.PlanId);
        }

        return new AdminPlanLimitDto
        {
            Id = existing.Id,
            PlanId = existing.PlanId,
            PlanName = existing.Plan.DisplayName ?? existing.Plan.Name,
            LimitKey = existing.LimitKey,
            LimitValue = existing.LimitValue,
            LimitType = existing.LimitType,
            CreatedAt = existing.CreatedAt,
        };
    }

    /// <inheritdoc/>
    public async Task<bool> DeletePlanLimitAsync(Guid limitId, CancellationToken cancellationToken = default)
    {
        var limit = await _context.PlanLimits.FirstOrDefaultAsync(l => l.Id == limitId, cancellationToken);

        if (limit == null)
        {
            return false;
        }

        _context.PlanLimits.Remove(limit);
        await _context.SaveChangesAsync(cancellationToken);

        LogPlanLimitDeleted(limit.LimitKey, limit.PlanId);

        return true;
    }

    // ========================================================================
    // Plan Features (Assignments)
    // ========================================================================

    /// <inheritdoc/>
    public async Task<IReadOnlyList<AdminPlanFeatureDto>> GetAllPlanFeaturesAsync(Guid? planId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.PlanFeatures
            .AsNoTracking()
            .Include(pf => pf.Plan)
            .Include(pf => pf.Feature)
            .Where(pf => pf.Plan.DeletedAt == null && pf.Feature.DeletedAt == null);

        if (planId.HasValue)
        {
            query = query.Where(pf => pf.PlanId == planId.Value);
        }

        var planFeatures = await query.OrderBy(pf => pf.Plan.SortOrder).ThenBy(pf => pf.Feature.FeatureKey).ToListAsync(cancellationToken);

        return planFeatures.Select(pf => new AdminPlanFeatureDto
        {
            Id = pf.Id,
            PlanId = pf.PlanId,
            PlanName = pf.Plan.DisplayName ?? pf.Plan.Name,
            FeatureId = pf.FeatureId,
            FeatureKey = pf.Feature.FeatureKey,
            FeatureDisplayName = pf.Feature.DisplayName,
            CreatedAt = pf.CreatedAt,
        }).ToList();
    }

    /// <inheritdoc/>
    public async Task<AdminPlanFeatureDto> AssignFeatureToPlanAsync(AdminPlanFeatureRequest request, CancellationToken cancellationToken = default)
    {
        // Check if already exists
        var existing = await _context.PlanFeatures
            .Include(pf => pf.Plan)
            .Include(pf => pf.Feature)
            .FirstOrDefaultAsync(pf => pf.PlanId == request.PlanId && pf.FeatureId == request.FeatureId, cancellationToken);

        if (existing != null)
        {
            return new AdminPlanFeatureDto
            {
                Id = existing.Id,
                PlanId = existing.PlanId,
                PlanName = existing.Plan.DisplayName ?? existing.Plan.Name,
                FeatureId = existing.FeatureId,
                FeatureKey = existing.Feature.FeatureKey,
                FeatureDisplayName = existing.Feature.DisplayName,
                CreatedAt = existing.CreatedAt,
            };
        }

        var planFeature = new PlanFeature
        {
            Id = Guid.NewGuid(),
            PlanId = request.PlanId,
            FeatureId = request.FeatureId,
            CreatedAt = DateTime.UtcNow,
        };

        _context.PlanFeatures.Add(planFeature);
        await _context.SaveChangesAsync(cancellationToken);

        // Reload with navigation properties
        var result = await _context.PlanFeatures
            .Include(pf => pf.Plan)
            .Include(pf => pf.Feature)
            .FirstAsync(pf => pf.Id == planFeature.Id, cancellationToken);

        LogPlanFeatureAssigned(result.Feature.FeatureKey, result.Plan.Name);

        return new AdminPlanFeatureDto
        {
            Id = result.Id,
            PlanId = result.PlanId,
            PlanName = result.Plan.DisplayName ?? result.Plan.Name,
            FeatureId = result.FeatureId,
            FeatureKey = result.Feature.FeatureKey,
            FeatureDisplayName = result.Feature.DisplayName,
            CreatedAt = result.CreatedAt,
        };
    }

    /// <inheritdoc/>
    public async Task<bool> RemoveFeatureFromPlanAsync(Guid planId, Guid featureId, CancellationToken cancellationToken = default)
    {
        var planFeature = await _context.PlanFeatures
            .Include(pf => pf.Plan)
            .Include(pf => pf.Feature)
            .FirstOrDefaultAsync(pf => pf.PlanId == planId && pf.FeatureId == featureId, cancellationToken);

        if (planFeature == null)
        {
            return false;
        }

        _context.PlanFeatures.Remove(planFeature);
        await _context.SaveChangesAsync(cancellationToken);

        LogPlanFeatureRemoved(planFeature.Feature.FeatureKey, planFeature.Plan.Name);

        return true;
    }

    // ========================================================================
    // CMS Sync
    // ========================================================================

    /// <inheritdoc/>
    public async Task<int> SyncAllPlansToCmsAsync(CancellationToken cancellationToken = default)
    {
        var plans = await _context.SubscriptionPlans
            .Where(p => p.DeletedAt == null && p.IsActive)
            .ToListAsync(cancellationToken);

        var syncCount = 0;
        foreach (var plan in plans)
        {
            await SyncPlanToCmsAsync(plan, cancellationToken);
            syncCount++;
        }

        LogCmsSyncCompleted(syncCount);

        return syncCount;
    }

    /// <inheritdoc/>
    public async Task<CmsBillingValidationResult> ValidateCmsBillingConsistencyAsync(CancellationToken cancellationToken = default)
    {
        var billingPlans = await _context.SubscriptionPlans
            .Where(p => p.DeletedAt == null && p.IsActive)
            .OrderBy(p => p.SortOrder)
            .ToListAsync(cancellationToken);

        var cmsPlans = await _context.CmsPricingPlans
            .Where(p => p.DeletedAt == null && p.IsActive)
            .OrderBy(p => p.DisplayOrder)
            .ToListAsync(cancellationToken);

        var inconsistencies = new List<string>();
        var comparisons = new List<PlanComparisonDetail>();

        foreach (var billing in billingPlans)
        {
            var cms = cmsPlans.Find(c =>
                c.Name.Replace(" ", string.Empty, StringComparison.Ordinal)
                    .Equals(billing.DisplayName?.Replace(" ", string.Empty, StringComparison.Ordinal), StringComparison.OrdinalIgnoreCase)
                || c.Name.Replace(" ", string.Empty, StringComparison.Ordinal)
                    .Equals(billing.Name, StringComparison.OrdinalIgnoreCase));

            var differences = new List<string>();

            if (cms == null)
            {
                inconsistencies.Add($"Billing plan '{billing.DisplayName}' has no matching CMS plan");
                comparisons.Add(new PlanComparisonDetail
                {
                    PlanName = billing.DisplayName ?? billing.Name,
                    IsInSync = false,
                    BillingMonthly = billing.PriceMonthly,
                    CmsMonthly = null,
                    Differences = ["Missing CMS plan"],
                });
                continue;
            }

            // Compare monthly price
            var cmsMonthlyDecimal = ParseCmsPrice(cms.MonthlyPrice);
            if (cmsMonthlyDecimal != billing.PriceMonthly)
            {
                differences.Add($"Monthly: Billing=${billing.PriceMonthly}, CMS={cms.MonthlyPrice}");
            }

            // Compare onboarding
            if (cms.OnboardingPrice != billing.OnboardingPrice)
            {
                differences.Add($"Onboarding: Billing=${billing.OnboardingPrice}, CMS=${cms.OnboardingPrice}");
            }

            if (cms.OnboardingRequired != billing.OnboardingRequired)
            {
                differences.Add($"OnboardingRequired: Billing={billing.OnboardingRequired}, CMS={cms.OnboardingRequired}");
            }

            if (differences.Count > 0)
            {
                inconsistencies.AddRange(differences.Select(d => $"{billing.DisplayName}: {d}"));
            }

            comparisons.Add(new PlanComparisonDetail
            {
                PlanName = billing.DisplayName ?? billing.Name,
                IsInSync = differences.Count == 0,
                BillingMonthly = billing.PriceMonthly,
                CmsMonthly = cms.MonthlyPrice,
                BillingOnboarding = billing.OnboardingPrice,
                CmsOnboarding = cms.OnboardingPrice,
                Differences = differences,
            });
        }

        return new CmsBillingValidationResult
        {
            IsValid = inconsistencies.Count == 0,
            Inconsistencies = inconsistencies,
            PlanComparisons = comparisons,
        };
    }

    // ========================================================================
    // Private Helper Methods
    // ========================================================================

    private async Task SyncPlanToCmsAsync(SubscriptionPlan plan, CancellationToken cancellationToken)
    {
        var planNameNormalized = plan.Name.ToUpperInvariant();
        var displayNameNormalized = (plan.DisplayName ?? string.Empty)
            .Replace(" ", string.Empty, StringComparison.Ordinal)
            .ToUpperInvariant();

        // EF Core translates these to SQL UPPER() function
        var cmsPlans = await _context.CmsPricingPlans.ToListAsync(cancellationToken);
        var cmsPlan = cmsPlans.Find(c =>
            c.Name.Replace(" ", string.Empty, StringComparison.Ordinal)
                .Equals(planNameNormalized, StringComparison.OrdinalIgnoreCase)
            || c.Name.Replace(" ", string.Empty, StringComparison.Ordinal)
                .Equals(displayNameNormalized, StringComparison.OrdinalIgnoreCase));

        if (cmsPlan == null)
        {
            // Create new CMS plan
            cmsPlan = new CmsPricingPlan
            {
                Id = Guid.NewGuid(),
                Name = plan.DisplayName ?? plan.Name,
                MonthlyPrice = plan.PriceMonthly == 0 ? "$0" : $"${plan.PriceMonthly:0}",
                QuarterlyPrice = plan.PriceQuarterly.HasValue ? $"${plan.PriceQuarterly:0}" : null,
                AnnualPrice = plan.PriceYearly.HasValue ? $"${plan.PriceYearly:0}" : null,
                PricePeriod = "/mo",
                OnboardingPrice = plan.OnboardingPrice,
                OnboardingRequired = plan.OnboardingRequired,
                IsPopular = plan.Name == "smartflow",
                IsActive = plan.IsActive,
                DisplayOrder = plan.SortOrder,
                CtaText = plan.PriceMonthly == 0 ? "Start Free Trial" : "Get Started",
                CtaLink = $"/signup?plan={plan.Name}",
                Description = plan.Description,
                FeaturesJson = "[]",
                CreatedAt = DateTime.UtcNow,
            };
            _context.CmsPricingPlans.Add(cmsPlan);
            LogCmsPlanCreated(plan.Name);
        }
        else
        {
            // Update existing CMS plan
            cmsPlan.MonthlyPrice = GetMonthlyPriceDisplay(plan);
            cmsPlan.QuarterlyPrice = plan.PriceQuarterly.HasValue ? $"${plan.PriceQuarterly:0}" : null;
            cmsPlan.AnnualPrice = plan.PriceYearly.HasValue ? $"${plan.PriceYearly:0}" : null;
            cmsPlan.OnboardingPrice = plan.OnboardingPrice;
            cmsPlan.OnboardingRequired = plan.OnboardingRequired;
            cmsPlan.IsActive = plan.IsActive;
            cmsPlan.DisplayOrder = plan.SortOrder;
            cmsPlan.UpdatedAt = DateTime.UtcNow;
            LogCmsPlanUpdated(plan.Name);
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    private static string GetMonthlyPriceDisplay(SubscriptionPlan plan)
    {
        if (plan.PriceMonthly == 0)
        {
            return string.Equals(plan.Name, "enterprise", StringComparison.OrdinalIgnoreCase)
                ? "Custom"
                : "$0";
        }

        return $"${plan.PriceMonthly:0}";
    }

    private static decimal ParseCmsPrice(string? price)
    {
        if (string.IsNullOrEmpty(price) || price == "Custom")
        {
            return 0;
        }

        var cleaned = price
            .Replace("$", string.Empty, StringComparison.Ordinal)
            .Replace(",", string.Empty, StringComparison.Ordinal)
            .Trim();
        return decimal.TryParse(cleaned, CultureInfo.InvariantCulture, out var result) ? result : 0;
    }

    private static AdminPlanDto MapToPlanDto(SubscriptionPlan plan)
    {
        return new AdminPlanDto
        {
            Id = plan.Id,
            Name = plan.Name,
            DisplayName = plan.DisplayName,
            Description = plan.Description,
            PriceMonthly = plan.PriceMonthly,
            PriceQuarterly = plan.PriceQuarterly,
            PriceYearly = plan.PriceYearly,
            DiscountQuarterly = plan.DiscountQuarterly,
            DiscountAnnual = plan.DiscountAnnual,
            OnboardingPrice = plan.OnboardingPrice,
            OnboardingRequired = plan.OnboardingRequired,
            StripePriceIdMonthly = plan.StripePriceIdMonthly,
            StripePriceIdQuarterly = plan.StripePriceIdQuarterly,
            StripePriceIdYearly = plan.StripePriceIdYearly,
            AllowsTrial = plan.AllowsTrial,
            TrialDays = plan.TrialDays,
            IsActive = plan.IsActive,
            IsPublic = plan.IsPublic,
            Version = plan.Version,
            SortOrder = plan.SortOrder,
            Limits = plan.Limits?.ToDictionary(l => l.LimitKey, l => l.LimitValue) ?? [],
            FeatureKeys = plan.Features?.Select(f => f.Feature?.FeatureKey ?? string.Empty).Where(k => !string.IsNullOrEmpty(k)).ToList() ?? [],
            CreatedAt = plan.CreatedAt,
            UpdatedAt = plan.UpdatedAt,
        };
    }

    private static AdminFeatureDto MapToFeatureDto(Feature feature)
    {
        return new AdminFeatureDto
        {
            Id = feature.Id,
            FeatureKey = feature.FeatureKey,
            DisplayName = feature.DisplayName,
            Description = feature.Description,
            Category = feature.Category,
            IsActive = feature.IsActive,
            EnabledInPlans = feature.PlanFeatures?.Where(pf => pf.Plan != null).Select(pf => pf.Plan.DisplayName ?? pf.Plan.Name).ToList() ?? [],
            CreatedAt = feature.CreatedAt,
            UpdatedAt = feature.UpdatedAt,
        };
    }

    // ========================================================================
    // Logging
    // ========================================================================

    [LoggerMessage(Level = LogLevel.Information, Message = "Created subscription plan {PlanName} with ID {PlanId}")]
    private partial void LogPlanCreated(string planName, Guid planId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updated subscription plan {PlanName} with ID {PlanId}")]
    private partial void LogPlanUpdated(string planName, Guid planId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Deactivated subscription plan {PlanName} with ID {PlanId}")]
    private partial void LogPlanDeactivated(string planName, Guid planId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Deleted subscription plan {PlanName} with ID {PlanId}")]
    private partial void LogPlanDeleted(string planName, Guid planId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Created feature {FeatureKey} with ID {FeatureId}")]
    private partial void LogFeatureCreated(string featureKey, Guid featureId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updated feature {FeatureKey} with ID {FeatureId}")]
    private partial void LogFeatureUpdated(string featureKey, Guid featureId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Deleted feature {FeatureKey} with ID {FeatureId}")]
    private partial void LogFeatureDeleted(string featureKey, Guid featureId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Created plan limit {LimitKey} for plan {PlanId}")]
    private partial void LogPlanLimitCreated(string limitKey, Guid planId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updated plan limit {LimitKey} for plan {PlanId}")]
    private partial void LogPlanLimitUpdated(string limitKey, Guid planId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Deleted plan limit {LimitKey} for plan {PlanId}")]
    private partial void LogPlanLimitDeleted(string limitKey, Guid planId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Assigned feature {FeatureKey} to plan {PlanName}")]
    private partial void LogPlanFeatureAssigned(string featureKey, string planName);

    [LoggerMessage(Level = LogLevel.Information, Message = "Removed feature {FeatureKey} from plan {PlanName}")]
    private partial void LogPlanFeatureRemoved(string featureKey, string planName);

    [LoggerMessage(Level = LogLevel.Information, Message = "CMS sync completed for {Count} plans")]
    private partial void LogCmsSyncCompleted(int count);

    [LoggerMessage(Level = LogLevel.Information, Message = "Created CMS pricing plan for {PlanName}")]
    private partial void LogCmsPlanCreated(string planName);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updated CMS pricing plan for {PlanName}")]
    private partial void LogCmsPlanUpdated(string planName);
}
