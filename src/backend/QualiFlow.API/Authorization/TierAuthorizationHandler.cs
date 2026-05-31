using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Authorization;

/// <summary>
/// Authorization handler to enforce subscription tier requirements.
/// </summary>
public class TierAuthorizationHandler : AuthorizationHandler<RequiresTierAttribute>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly ISubscriptionService _subscriptionService;
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<TierAuthorizationHandler> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="TierAuthorizationHandler"/> class.
    /// </summary>
    /// <param name="currentUserService">The current user service.</param>
    /// <param name="subscriptionService">The subscription service.</param>
    /// <param name="context">The database context.</param>
    /// <param name="logger">The logger.</param>
    public TierAuthorizationHandler(
        ICurrentUserService currentUserService,
        ISubscriptionService subscriptionService,
        QualiFlowDbContext context,
        ILogger<TierAuthorizationHandler> logger)
    {
        _currentUserService = currentUserService;
        _subscriptionService = subscriptionService;
        _context = context;
        _logger = logger;
    }

    /// <inheritdoc/>
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        RequiresTierAttribute requirement)
    {
        try
        {
            var businessId = _currentUserService.GetBusinessId();
            var subscription = await _subscriptionService.GetSubscriptionAsync(
                businessId,
                CancellationToken.None);

            if (subscription == null)
            {
                _logger.LogWarning(
                    "No subscription found for business {BusinessId}",
                    businessId);
                context.Fail();
                return;
            }

            // Get current plan
            var currentPlan = await _context.SubscriptionPlans
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == subscription.PlanId);

            if (currentPlan == null)
            {
                _logger.LogWarning(
                    "Plan {PlanId} not found for business {BusinessId}",
                    subscription.PlanId,
                    businessId);
                context.Fail();
                return;
            }

            // Map tier to minimum price (aligned with Figma pricing)
            var minimumPrice = requirement.MinimumTier switch
            {
                SubscriptionTier.FreeFlow => 0m,
                SubscriptionTier.SmartFlow => 199m,
                SubscriptionTier.UltraFlow => 699m,
                SubscriptionTier.Enterprise => 999m,
                _ => 0m
            };

            // Check if current plan meets minimum requirement (by price)
            if (currentPlan.PriceMonthly >= minimumPrice)
            {
                context.Succeed(requirement);
            }
            else
            {
                _logger.LogWarning(
                    "Business {BusinessId} plan {PlanName} (${Price}) does not meet requirement {RequiredTier} (${MinPrice})",
                    businessId,
                    currentPlan.Name,
                    currentPlan.PriceMonthly,
                    requirement.MinimumTier,
                    minimumPrice);
                context.Fail();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error checking tier authorization for requirement {RequiredTier}",
                requirement.MinimumTier);
            context.Fail();
        }
    }
}

