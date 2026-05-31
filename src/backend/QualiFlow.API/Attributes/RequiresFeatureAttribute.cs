using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Attributes;

/// <summary>
/// Authorization filter that enforces feature access based on subscription plan.
/// Checks if the current business's subscription plan includes the specified feature.
/// Returns 403 Forbidden with upgrade message if feature is not available.
/// Example usage: [RequiresFeature("whatsapp")].
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
public class RequiresFeatureAttribute : Attribute, IAsyncAuthorizationFilter
{
    private readonly string _featureKey;

    /// <summary>
    /// Initializes a new instance of the <see cref="RequiresFeatureAttribute"/> class.
    /// </summary>
    /// <param name="featureKey">The feature key to check (e.g., "whatsapp", "ai_voice", "ai_sms").</param>
    public RequiresFeatureAttribute(string featureKey)
    {
        _featureKey = featureKey ?? throw new ArgumentNullException(nameof(featureKey));
    }

    /// <summary>
    /// Gets the feature key to check.
    /// </summary>
    public string FeatureKey => _featureKey;

    /// <inheritdoc/>
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        // Get required services from DI
        var currentUserService = context.HttpContext.RequestServices.GetService<ICurrentUserService>();
        var dbContext = context.HttpContext.RequestServices.GetService<QualiFlowDbContext>();
        var logger = context.HttpContext.RequestServices.GetService<ILogger<RequiresFeatureAttribute>>();

        if (currentUserService == null || dbContext == null || logger == null)
        {
            context.Result = new StatusCodeResult(StatusCodes.Status500InternalServerError);
            return;
        }

        try
        {
            var businessId = currentUserService.GetBusinessId();

            // Get business subscription with plan and features
            var subscription = await dbContext.Set<Domain.Entities.Subscription>()
                .Include(s => s.Plan)
                    .ThenInclude(p => p.Features)
                        .ThenInclude(pf => pf.Feature)
                .FirstOrDefaultAsync(s => s.BusinessId == businessId);

            if (subscription == null)
            {
                logger.LogWarning(
                    "No subscription found for business {BusinessId} when checking feature {FeatureKey}",
                    businessId,
                    _featureKey);

                context.Result = new ObjectResult(new
                {
                    error = "subscription_not_found",
                    message = "No active subscription found. Please contact support.",
                    featureKey = _featureKey
                })
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };
                return;
            }

            // Check if subscription is active or in trial
            if (subscription.Status != Domain.Enums.SubscriptionStatus.Active &&
                subscription.Status != Domain.Enums.SubscriptionStatus.Trial)
            {
                logger.LogWarning(
                    "Subscription for business {BusinessId} is not active (status: {Status}) when checking feature {FeatureKey}",
                    businessId,
                    subscription.Status,
                    _featureKey);

                context.Result = new ObjectResult(new
                {
                    error = "subscription_inactive",
                    message = $"Subscription is {subscription.Status.ToString().ToLowerInvariant()}. Please activate your subscription.",
                    featureKey = _featureKey,
                    status = subscription.Status.ToString().ToLowerInvariant()
                })
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };
                return;
            }

            // Check if plan includes the required feature
            var hasFeature = subscription.Plan.Features?.Any(pf =>
                pf.Feature != null &&
                pf.Feature.FeatureKey.Equals(_featureKey, StringComparison.OrdinalIgnoreCase) &&
                pf.Feature.IsActive) ?? false;

            if (!hasFeature)
            {
                logger.LogWarning(
                    "Feature {FeatureKey} not available for business {BusinessId} on plan {PlanName}",
                    _featureKey,
                    businessId,
                    subscription.Plan.DisplayName ?? subscription.Plan.Name);

                // Get the minimum plan that has this feature
                var requiredPlan = await GetRequiredPlanForFeatureAsync(dbContext, _featureKey);

                context.Result = new ObjectResult(new
                {
                    error = "feature_not_available",
                    message = $"This feature requires {requiredPlan ?? "a higher"} plan. Please upgrade your subscription.",
                    featureKey = _featureKey,
                    currentPlan = subscription.Plan.DisplayName ?? subscription.Plan.Name,
                    requiredPlan = requiredPlan,
                    upgradeUrl = "/settings/subscription"
                })
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };
                return;
            }

            // Feature access granted - continue to controller action
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Error checking feature {FeatureKey} for business",
                _featureKey);

            context.Result = new StatusCodeResult(StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Gets the minimum plan name that includes the specified feature.
    /// </summary>
    private static async Task<string?> GetRequiredPlanForFeatureAsync(QualiFlowDbContext dbContext, string featureKey)
    {
        var plan = await dbContext.Set<Domain.Entities.SubscriptionPlan>()
            .Where(p => p.IsActive && p.IsPublic)
            .Where(p => p.Features.Any(pf =>
                pf.Feature != null &&
                EF.Functions.ILike(pf.Feature.FeatureKey, featureKey)))
            .OrderBy(p => p.SortOrder)
            .Select(p => p.DisplayName ?? p.Name)
            .FirstOrDefaultAsync();

        return plan;
    }
}
