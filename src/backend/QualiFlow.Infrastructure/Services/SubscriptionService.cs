using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Domain.ValueObjects;
using QualiFlow.Infrastructure.Constants;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for managing business subscriptions and tier changes.
/// </summary>
public class SubscriptionService : ISubscriptionService
{
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<SubscriptionService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="SubscriptionService"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="logger">The logger.</param>
    public SubscriptionService(
        QualiFlowDbContext context,
        ILogger<SubscriptionService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<SubscriptionPlan>> GetAllPlansAsync(bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        var query = _context.Set<SubscriptionPlan>()
            .AsNoTracking()
            .AsSplitQuery() // Use split queries to avoid Cartesian explosion
            .Include(p => p.Limits)
            .Include(p => p.Features)
                .ThenInclude(pf => pf.Feature)
            .Where(p => p.DeletedAt == null);

        if (!includeInactive)
        {
            query = query.Where(p => p.IsActive && p.IsPublic);
        }

        return await query
            .OrderBy(p => p.SortOrder)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<SubscriptionPlan?> GetPlanByIdAsync(Guid planId, CancellationToken cancellationToken)
    {
        return await _context.Set<SubscriptionPlan>()
            .AsNoTracking()
            .AsSplitQuery()
            .Include(p => p.Limits)
            .Include(p => p.Features)
                .ThenInclude(pf => pf.Feature)
            .FirstOrDefaultAsync(p => p.Id == planId && p.DeletedAt == null, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<SubscriptionPlan?> GetPlanBySlugAsync(string slug, CancellationToken cancellationToken)
    {
        // Normalize slug for comparison (e.g., "smart-flow" matches "Smart Flow" or "smartflow")
        var normalizedSlug = NormalizeSlug(slug);

        var plans = await _context.Set<SubscriptionPlan>()
            .AsNoTracking()
            .AsSplitQuery()
            .Include(p => p.Limits)
            .Include(p => p.Features)
                .ThenInclude(pf => pf.Feature)
            .Where(p => p.DeletedAt == null && p.IsActive)
            .ToListAsync(cancellationToken);

        return plans.Find(p =>
            NormalizeSlug(p.Name) == normalizedSlug ||
            (p.DisplayName != null && NormalizeSlug(p.DisplayName) == normalizedSlug));
    }

    private static string NormalizeSlug(string value)
    {
        return value.ToLowerInvariant()
            .Replace("-", string.Empty, StringComparison.Ordinal)
            .Replace("_", string.Empty, StringComparison.Ordinal)
            .Replace(" ", string.Empty, StringComparison.Ordinal);
    }

    /// <inheritdoc/>
    public Task<Subscription?> GetSubscriptionAsync(Guid businessId, CancellationToken cancellationToken)
    {
        return _context.Set<Subscription>()
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.BusinessId == businessId, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyDictionary<string, string>> GetPlanLimitsAsync(
        Guid planId,
        CancellationToken cancellationToken)
    {
        var limits = await _context.PlanLimits
            .Where(pl => pl.PlanId == planId)
            .ToDictionaryAsync(pl => pl.LimitKey, pl => pl.LimitValue, cancellationToken);

        return limits;
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyDictionary<string, string>> GetBusinessLimitsAsync(
        Guid businessId,
        CancellationToken cancellationToken)
    {
        // Get subscription with plan
        var subscription = await _context.Set<Subscription>()
            .Include(s => s.Plan)
                .ThenInclude(p => p.Limits)
            .FirstOrDefaultAsync(s => s.BusinessId == businessId, cancellationToken);

        if (subscription == null)
        {
            return new Dictionary<string, string>();
        }

        // Start with plan limits
        var limits = subscription.Plan.Limits.ToDictionary(l => l.LimitKey, l => l.LimitValue);

        // Apply business overrides
        var overrides = await _context.BusinessOverrides
            .Where(bo => bo.BusinessId == businessId
                && bo.OverrideType == "limit"
                && (bo.ExpiresAt == null || bo.ExpiresAt > DateTime.UtcNow))
            .ToListAsync(cancellationToken);

        foreach (var @override in overrides)
        {
            limits[@override.OverrideKey] = @override.OverrideValue;
        }

        return limits;
    }

    /// <inheritdoc/>
    public async Task<Subscription> UpgradeSubscriptionAsync(
        Guid businessId,
        Guid targetPlanId,
        CancellationToken cancellationToken)
    {
        // Get target plan
        var targetPlan = await _context.SubscriptionPlans
            .FirstOrDefaultAsync(p => p.Id == targetPlanId, cancellationToken)
            ?? throw new InvalidOperationException($"Plan {targetPlanId} not found");

        // Get business with subscription
        var business = await _context.Businesses
            .Include(b => b.Subscription)
                .ThenInclude(s => s!.Plan)
            .FirstOrDefaultAsync(b => b.Id == businessId, cancellationToken)
            ?? throw new InvalidOperationException($"Business {businessId} not found");

        _logger.LogInformation(
            "Upgrading subscription for business {BusinessId} to plan {PlanName}",
            businessId,
            targetPlan.DisplayName);

        // Update or create subscription record
        if (business.Subscription == null)
        {
            business.Subscription = new Subscription
            {
                BusinessId = businessId,
                PlanId = targetPlanId,
                PlanVersion = targetPlan.Version,
                Status = SubscriptionStatus.Active,
                BillingCycle = SubscriptionConstants.BillingIntervalMonthly,
                Currency = SubscriptionConstants.DefaultCurrency,
                CurrentPeriodStart = DateTime.UtcNow,
                CurrentPeriodEnd = DateTime.UtcNow.AddMonths(1),
                CreatedAt = DateTime.UtcNow
            };
            _context.Set<Subscription>().Add(business.Subscription);
        }
        else
        {
            business.Subscription.PlanId = targetPlanId;
            business.Subscription.PlanVersion = targetPlan.Version;
            business.Subscription.Status = SubscriptionStatus.Active;
            business.Subscription.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Successfully upgraded subscription for business {BusinessId} to plan {PlanName}",
            businessId,
            targetPlan.DisplayName);

        return business.Subscription;
    }

    /// <inheritdoc/>
    public async Task<Subscription> DowngradeSubscriptionAsync(
        Guid businessId,
        Guid targetPlanId,
        CancellationToken cancellationToken)
    {
        // Get target plan
        var targetPlan = await _context.SubscriptionPlans
            .FirstOrDefaultAsync(p => p.Id == targetPlanId, cancellationToken)
            ?? throw new InvalidOperationException($"Plan {targetPlanId} not found");

        // Get business with subscription
        var business = await _context.Businesses
            .Include(b => b.Subscription)
                .ThenInclude(s => s!.Plan)
            .FirstOrDefaultAsync(b => b.Id == businessId, cancellationToken)
            ?? throw new InvalidOperationException($"Business {businessId} not found");

        _logger.LogInformation(
            "Scheduling downgrade for business {BusinessId} to plan {PlanName}",
            businessId,
            targetPlan.DisplayName);

        // Schedule downgrade for next billing cycle
        if (business.Subscription != null)
        {
            business.Subscription.ScheduledPlanId = targetPlanId;
            business.Subscription.ScheduledChangeDate = business.Subscription.CurrentPeriodEnd ?? DateTime.UtcNow.AddMonths(1);
            business.Subscription.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Scheduled downgrade for business {BusinessId} to plan {PlanName} on {ScheduledDate}",
                businessId,
                targetPlan.DisplayName,
                business.Subscription.ScheduledChangeDate);

            return business.Subscription;
        }

        throw new InvalidOperationException($"No subscription found for business {businessId}");
    }

    /// <inheritdoc/>
    public async Task<Subscription> CancelSubscriptionAsync(Guid businessId, CancellationToken cancellationToken)
    {
        var business = await _context.Businesses
            .Include(b => b.Subscription)
            .FirstOrDefaultAsync(b => b.Id == businessId, cancellationToken)
            ?? throw new InvalidOperationException($"Business {businessId} not found");

        if (business.Subscription == null)
        {
            throw new InvalidOperationException($"No subscription found for business {businessId}");
        }

        _logger.LogInformation("Cancelling subscription for business {BusinessId}", businessId);

        // Mark for cancellation at period end
        business.Subscription.CancelAtPeriodEnd = true;
        business.Subscription.CancelledAt = DateTime.UtcNow;
        business.Subscription.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Subscription for business {BusinessId} will be cancelled on {CancellationDate}",
            businessId, business.Subscription.CurrentPeriodEnd);

        return business.Subscription;
    }

    /// <inheritdoc/>
    public async Task<Subscription> SuspendSubscriptionAsync(Guid businessId, CancellationToken cancellationToken)
    {
        var business = await _context.Businesses
            .Include(b => b.Subscription)
            .FirstOrDefaultAsync(b => b.Id == businessId, cancellationToken)
            ?? throw new InvalidOperationException($"Business {businessId} not found");

        _logger.LogInformation("Suspending subscription for business {BusinessId}", businessId);

        if (business.Subscription != null)
        {
            business.Subscription.Status = SubscriptionStatus.Suspended;
            business.Subscription.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogWarning("Subscription suspended for business {BusinessId} due to payment failure", businessId);

        return business.Subscription!;
    }

    /// <inheritdoc/>
    public async Task<Subscription> ReactivateSubscriptionAsync(Guid businessId, CancellationToken cancellationToken)
    {
        var business = await _context.Businesses
            .Include(b => b.Subscription)
            .FirstOrDefaultAsync(b => b.Id == businessId, cancellationToken)
            ?? throw new InvalidOperationException($"Business {businessId} not found");

        _logger.LogInformation("Reactivating subscription for business {BusinessId}", businessId);

        if (business.Subscription != null)
        {
            business.Subscription.Status = SubscriptionStatus.Active;
            business.Subscription.CancelAtPeriodEnd = false;
            business.Subscription.CancelledAt = null;
            business.Subscription.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Subscription reactivated for business {BusinessId}", businessId);

        return business.Subscription!;
    }

    /// <inheritdoc/>
    public async Task<bool> IsSubscriptionActiveAsync(Guid businessId, CancellationToken cancellationToken)
    {
        var subscription = await _context.Set<Subscription>()
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.BusinessId == businessId, cancellationToken);

        if (subscription == null)
        {
            return false;
        }

        // Check if trial expired
        if (subscription.Status == SubscriptionStatus.Trial)
        {
            return subscription.TrialEnd == null || subscription.TrialEnd > DateTime.UtcNow;
        }

        // Check if subscription is active
        return subscription.Status == SubscriptionStatus.Active;
    }

    /// <inheritdoc/>
    public async Task<bool> IsTrialExpiredAsync(Guid businessId, CancellationToken cancellationToken)
    {
        var subscription = await _context.Set<Subscription>()
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.BusinessId == businessId, cancellationToken);

        if (subscription == null)
        {
            return true; // Treat non-existent subscription as expired
        }

        if (subscription.Status != SubscriptionStatus.Trial)
        {
            return false; // Not on trial
        }

        return subscription.TrialEnd != null && subscription.TrialEnd <= DateTime.UtcNow;
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<SubscriptionWithDetailsDto>> GetAllSubscriptionsForAdminAsync(CancellationToken cancellationToken)
    {
        var subscriptions = await _context.Set<Subscription>()
            .AsNoTracking()
            .Include(s => s.Business)
            .Include(s => s.Plan)
            .Where(s => s.Business != null && s.Business.DeletedAt == null) // Exclude orphaned subscriptions
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new SubscriptionWithDetailsDto
            {
                Id = s.Id,
                BusinessId = s.BusinessId,
                BusinessName = s.Business != null ? s.Business.Name : "Unknown",
                BusinessEmail = s.Business != null ? s.Business.Email : string.Empty,
                PlanId = s.PlanId,
                PlanName = s.Plan != null ? (s.Plan.DisplayName ?? s.Plan.Name) : "Unknown",
                Status = s.Status.ToString().ToLowerInvariant(),
                MonthlyPrice = s.Plan != null ? s.Plan.PriceMonthly : 0,
                CurrentPeriodStart = s.CurrentPeriodStart,
                CurrentPeriodEnd = s.CurrentPeriodEnd,
                CancelAtPeriodEnd = s.CancelAtPeriodEnd,
                TrialEnd = s.TrialEnd,
                CreatedAt = s.CreatedAt,
            })
            .ToListAsync(cancellationToken);

        return subscriptions;
    }

    /// <inheritdoc/>
    public async Task<SubscriptionWithDetailsDto?> GetSubscriptionByIdForAdminAsync(Guid subscriptionId, CancellationToken cancellationToken)
    {
        return await _context.Set<Subscription>()
            .AsNoTracking()
            .Include(s => s.Business)
            .Include(s => s.Plan)
            .Where(s => s.Id == subscriptionId)
            .Select(s => new SubscriptionWithDetailsDto
            {
                Id = s.Id,
                BusinessId = s.BusinessId,
                BusinessName = s.Business != null ? s.Business.Name : "Unknown",
                BusinessEmail = s.Business != null ? s.Business.Email : string.Empty,
                PlanId = s.PlanId,
                PlanName = s.Plan != null ? (s.Plan.DisplayName ?? s.Plan.Name) : "Unknown",
                Status = s.Status.ToString().ToLowerInvariant(),
                MonthlyPrice = s.Plan != null ? s.Plan.PriceMonthly : 0,
                CurrentPeriodStart = s.CurrentPeriodStart,
                CurrentPeriodEnd = s.CurrentPeriodEnd,
                CancelAtPeriodEnd = s.CancelAtPeriodEnd,
                TrialEnd = s.TrialEnd,
                CreatedAt = s.CreatedAt,
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<SubscriptionStatsDto> GetSubscriptionStatsAsync(CancellationToken cancellationToken)
    {
        var subscriptions = await _context.Set<Subscription>()
            .AsNoTracking()
            .Include(s => s.Plan)
            .Where(s => s.DeletedAt == null)
            .ToListAsync(cancellationToken);

        var activeCount = subscriptions.Count(s => s.Status == SubscriptionStatus.Active);
        var trialingCount = subscriptions.Count(s => s.Status == SubscriptionStatus.Trial);
        var cancelledCount = subscriptions.Count(s => s.Status == SubscriptionStatus.Cancelled);
        var pastDueCount = subscriptions.Count(s => s.Status == SubscriptionStatus.Suspended);

        var totalMrr = subscriptions
            .Where(s => s.Status == SubscriptionStatus.Active && s.Plan != null)
            .Sum(s => s.Plan!.PriceMonthly);

        // Compute canceled this month
        var startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var canceledThisMonth = subscriptions.Count(s =>
            s.Status == SubscriptionStatus.Cancelled &&
            s.UpdatedAt.HasValue &&
            s.UpdatedAt.Value >= startOfMonth);

        // Compute churn rate: canceled this month / (active + canceled this month) * 100
        var baseForChurn = activeCount + canceledThisMonth;
        var churnRate = baseForChurn > 0
            ? Math.Round((decimal)canceledThisMonth / baseForChurn * 100, 1)
            : 0m;

        // Compute ARPU: MRR / active subscriptions
        var arpu = activeCount > 0
            ? Math.Round(totalMrr / activeCount, 2)
            : 0m;

        var totalSubscriptions = subscriptions.Count;

        var byPlan = subscriptions
            .Where(s => s.Plan != null)
            .GroupBy(s => new { s.PlanId, PlanName = s.Plan!.DisplayName ?? s.Plan.Name })
            .Select(g => new PlanSubscriptionStatsDto
            {
                PlanId = g.Key.PlanId,
                PlanName = g.Key.PlanName,
                Count = g.Count(),
                Mrr = g.Where(s => s.Status == SubscriptionStatus.Active).Sum(s => s.Plan!.PriceMonthly),
                Percentage = totalSubscriptions > 0
                    ? Math.Round((decimal)g.Count() / totalSubscriptions * 100, 1)
                    : 0,
            })
            .ToList()
            .AsReadOnly();

        return new SubscriptionStatsDto
        {
            TotalSubscriptions = totalSubscriptions,
            ActiveSubscriptions = activeCount,
            TrialingSubscriptions = trialingCount,
            CancelledSubscriptions = cancelledCount,
            PastDueSubscriptions = pastDueCount,
            TotalMRR = totalMrr,
            ChurnRate = churnRate,
            AverageRevenuePerUser = arpu,
            CanceledThisMonth = canceledThisMonth,
            ByPlan = byPlan,
        };
    }

    /// <inheritdoc/>
    public async Task<Subscription> AdminChangePlanAsync(
        Guid businessId,
        Guid newPlanId,
        bool immediate,
        CancellationToken cancellationToken)
    {
        var targetPlan = await _context.SubscriptionPlans
            .FirstOrDefaultAsync(p => p.Id == newPlanId, cancellationToken)
            ?? throw new InvalidOperationException($"Plan {newPlanId} not found");

        var business = await _context.Businesses
            .Include(b => b.Subscription)
            .FirstOrDefaultAsync(b => b.Id == businessId, cancellationToken)
            ?? throw new InvalidOperationException($"Business {businessId} not found");

        _logger.LogInformation(
            "Admin changing plan for business {BusinessId} to {PlanName} (immediate: {Immediate})",
            businessId, targetPlan.DisplayName, immediate);

        if (business.Subscription == null)
        {
            business.Subscription = new Subscription
            {
                BusinessId = businessId,
                PlanId = newPlanId,
                PlanVersion = targetPlan.Version,
                Status = SubscriptionStatus.Active,
                BillingCycle = SubscriptionConstants.BillingIntervalMonthly,
                Currency = SubscriptionConstants.DefaultCurrency,
                CurrentPeriodStart = DateTime.UtcNow,
                CurrentPeriodEnd = DateTime.UtcNow.AddMonths(1),
                CreatedAt = DateTime.UtcNow,
            };
            _context.Set<Subscription>().Add(business.Subscription);
        }
        else if (immediate)
        {
            business.Subscription.PlanId = newPlanId;
            business.Subscription.PlanVersion = targetPlan.Version;
            business.Subscription.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            business.Subscription.ScheduledPlanId = newPlanId;
            business.Subscription.ScheduledChangeDate = business.Subscription.CurrentPeriodEnd ?? DateTime.UtcNow.AddMonths(1);
            business.Subscription.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Admin successfully changed plan for business {BusinessId} to {PlanName}",
            businessId, targetPlan.DisplayName);

        return business.Subscription;
    }

    /// <inheritdoc/>
    public async Task<Subscription> CreateDefaultSubscriptionAsync(Guid businessId, CancellationToken cancellationToken)
    {
        // Check if subscription already exists - include Plan for proper plan name resolution
        var existingSubscription = await _context.Set<Subscription>()
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.BusinessId == businessId, cancellationToken);

        if (existingSubscription != null)
        {
            _logger.LogInformation("Subscription already exists for business {BusinessId}", businessId);
            return existingSubscription;
        }

        // Get the FreeFlow plan (default for OAuth users)
        var plan = await _context.Set<SubscriptionPlan>()
            .FirstOrDefaultAsync(p => p.Name == SubscriptionConstants.DefaultPlanName && p.IsActive, cancellationToken);

        if (plan == null)
        {
            _logger.LogError("FreeFlow plan not found. Cannot create default subscription for business {BusinessId}", businessId);
            throw new InvalidOperationException("FreeFlow plan not found. Please contact support.");
        }

        // Determine subscription status and trial dates based on plan settings
        var now = DateTime.UtcNow;
        var hasTrial = plan.AllowsTrial && plan.TrialDays > 0;
        var status = hasTrial ? SubscriptionStatus.Trial : SubscriptionStatus.Active;

        var subscription = new Subscription
        {
            BusinessId = businessId,
            PlanId = plan.Id,
            PlanVersion = plan.Version,
            Status = status,
            BillingCycle = SubscriptionConstants.BillingIntervalMonthly,
            Currency = SubscriptionConstants.DefaultCurrency,
            CurrentPeriodStart = now,
            CurrentPeriodEnd = hasTrial ? now.AddDays(plan.TrialDays) : now.AddMonths(1),
            TrialStart = hasTrial ? now : null,
            TrialEnd = hasTrial ? now.AddDays(plan.TrialDays) : null,
            MonthlyAmount = plan.PriceMonthly,
            CreatedAt = now,
        };

        await _context.Set<Subscription>().AddAsync(subscription, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Created default subscription for business {BusinessId} with plan {PlanName}, status {Status}",
            businessId, plan.DisplayName ?? plan.Name, status);

        // Reload with Plan navigation property for proper plan name resolution
        subscription.Plan = plan;
        return subscription;
    }

    /// <inheritdoc/>
    public async Task ExtendTrialAsync(Guid businessId, int days, CancellationToken cancellationToken)
    {
        if (days <= 0)
        {
            throw new ArgumentException("Days must be greater than zero", nameof(days));
        }

        var business = await _context.Businesses
            .Include(b => b.Subscription)
            .FirstOrDefaultAsync(b => b.Id == businessId, cancellationToken)
            ?? throw new InvalidOperationException($"Business {businessId} not found");

        if (business.Subscription == null)
        {
            throw new InvalidOperationException($"No subscription found for business {businessId}");
        }

        var subscription = business.Subscription;

        // Extend the trial end date
        if (subscription.TrialEnd.HasValue)
        {
            subscription.TrialEnd = subscription.TrialEnd.Value.AddDays(days);
        }
        else
        {
            subscription.TrialEnd = DateTime.UtcNow.AddDays(days);
            subscription.TrialStart ??= DateTime.UtcNow;
        }

        // If subscription was expired or not in trial, set it back to trial
        if (subscription.Status == SubscriptionStatus.Expired || subscription.Status == SubscriptionStatus.Cancelled)
        {
            subscription.Status = SubscriptionStatus.Trial;
        }

        // Also extend the current period end if it's before the new trial end
        if (subscription.CurrentPeriodEnd.HasValue && subscription.CurrentPeriodEnd < subscription.TrialEnd)
        {
            subscription.CurrentPeriodEnd = subscription.TrialEnd;
        }

        subscription.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Extended trial for business {BusinessId} by {Days} days. New trial end: {TrialEnd}",
            businessId, days, subscription.TrialEnd);
    }

    /// <inheritdoc/>
    public async Task ApplyCreditAsync(Guid businessId, decimal amount, string reason, CancellationToken cancellationToken)
    {
        if (amount <= 0)
        {
            throw new ArgumentException("Amount must be greater than zero", nameof(amount));
        }

        var business = await _context.Businesses
            .Include(b => b.Subscription)
            .FirstOrDefaultAsync(b => b.Id == businessId, cancellationToken)
            ?? throw new InvalidOperationException($"Business {businessId} not found");

        // Create a billing transaction record for the credit
        var transaction = new BillingTransaction
        {
            BusinessId = businessId,
            SubscriptionId = business.Subscription?.Id,
            Type = "credit",
            Amount = amount,
            Currency = business.Subscription?.Currency ?? "USD",
            Status = "succeeded",
            Description = reason,
            TransactionDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
        };

        _context.Set<BillingTransaction>().Add(transaction);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Applied credit of {Amount} {Currency} to business {BusinessId}. Reason: {Reason}",
            amount, transaction.Currency, businessId, reason);
    }
}
