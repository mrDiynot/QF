using System.Globalization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Attributes;

/// <summary>
/// Authorization filter that enforces usage limits based on subscription plan.
/// Checks if the current business has reached their plan limit for the specified resource.
/// Returns 403 Forbidden with upgrade message if limit is exceeded.
/// Example usage: [RequiresLimit("max_workflows")].
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
public class RequiresLimitAttribute : Attribute, IAsyncAuthorizationFilter
{
    private readonly string _limitKey;
    private readonly bool _checkBeforeIncrement;

    /// <summary>
    /// Initializes a new instance of the <see cref="RequiresLimitAttribute"/> class.
    /// </summary>
    /// <param name="limitKey">The limit key to check (e.g., "max_workflows", "max_leads", "max_seats").</param>
    /// <param name="checkBeforeIncrement">If true, allows the action when current = limit (for creation). If false, blocks when current >= limit.</param>
    public RequiresLimitAttribute(string limitKey, bool checkBeforeIncrement = true)
    {
        _limitKey = limitKey ?? throw new ArgumentNullException(nameof(limitKey));
        _checkBeforeIncrement = checkBeforeIncrement;
    }

    /// <summary>
    /// Gets the limit key to check.
    /// </summary>
    public string LimitKey => _limitKey;

    /// <summary>
    /// Gets a value indicating whether to check before increment.
    /// </summary>
    public bool CheckBeforeIncrement => _checkBeforeIncrement;

    /// <inheritdoc/>
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        // Get required services from DI
        var currentUserService = context.HttpContext.RequestServices.GetService<ICurrentUserService>();
        var subscriptionService = context.HttpContext.RequestServices.GetService<ISubscriptionService>();
        var usageLimitService = context.HttpContext.RequestServices.GetService<IUsageLimitService>();
        var logger = context.HttpContext.RequestServices.GetService<ILogger<RequiresLimitAttribute>>();

        if (currentUserService == null || subscriptionService == null || usageLimitService == null || logger == null)
        {
            context.Result = new StatusCodeResult(StatusCodes.Status500InternalServerError);
            return;
        }

        try
        {
            var businessId = currentUserService.GetBusinessId();

            // Get business limits from subscription plan
            var limits = await subscriptionService.GetBusinessLimitsAsync(businessId, default);

            if (!limits.TryGetValue(_limitKey, out var limitValueStr))
            {
                // Limit not defined for this plan - allow by default
                logger.LogWarning(
                    "Limit {LimitKey} not defined for business {BusinessId}, allowing by default",
                    _limitKey,
                    businessId);
                return;
            }

            // Parse limit value ("unlimited" means no limit)
            if (limitValueStr.Equals("unlimited", StringComparison.OrdinalIgnoreCase))
            {
                return; // Unlimited - allow
            }

            if (!int.TryParse(limitValueStr, CultureInfo.InvariantCulture, out var limit))
            {
                logger.LogWarning(
                    "Invalid limit value '{LimitValue}' for {LimitKey}, allowing by default",
                    limitValueStr,
                    _limitKey);
                return;
            }

            // Get current usage
            var usage = await usageLimitService.GetUsageCountersAsync(businessId, default);
            if (usage == null)
            {
                // No usage counters yet - allow (will be created on first use)
                return;
            }

            var currentUsage = GetCurrentUsageForLimit(_limitKey, usage);

            // Check if limit is exceeded
            var limitExceeded = _checkBeforeIncrement
                ? currentUsage >= limit // For creation: block if current >= limit (next increment would exceed)
                : currentUsage > limit; // For updates: block if current > limit (already exceeded)

            if (limitExceeded)
            {
                logger.LogWarning(
                    "Limit {LimitKey} exceeded for business {BusinessId}: {CurrentUsage}/{Limit}",
                    _limitKey,
                    businessId,
                    currentUsage,
                    limit);

                var subscription = await subscriptionService.GetSubscriptionAsync(businessId, default);
                var limitLabel = GetLimitLabel(_limitKey);

                context.Result = new ObjectResult(new
                {
                    error = "limit_exceeded",
                    message = $"You've reached your {limitLabel} limit ({limit}). Please upgrade your subscription.",
                    limitKey = _limitKey,
                    currentUsage,
                    limit,
                    currentPlan = subscription?.Plan?.DisplayName ?? "Unknown",
                    upgradeUrl = "/settings/subscription"
                })
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };
                return;
            }

            // Limit not exceeded - continue to controller action
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Error checking limit {LimitKey} for business",
                _limitKey);

            context.Result = new StatusCodeResult(StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Maps limit key to current usage count from UsageCounters.
    /// </summary>
    private static int GetCurrentUsageForLimit(string limitKey, Domain.Entities.UsageCounters usage)
    {
        return limitKey switch
        {
            "max_workflows" or "max_active_workflows" => usage.CurrentWorkflowsCount,
            "max_leads" or "max_active_leads" => usage.CurrentLeadsCount,
            "max_seats" or "max_team_seats" => usage.CurrentSeatsCount,
            "max_channels" or "max_active_channels" => usage.CurrentChannelsCount,
            "max_phone_numbers" => usage.CurrentPhoneNumbersCount,
            "max_crm_contacts" => usage.CurrentCrmContactsCount,
            "max_ai_voice_agents" => usage.CurrentAiVoiceAgentsCount,
            "max_ai_interactions" or "max_ai_conversations" => usage.MonthlyAiConversationsCount,
            "max_ai_sms" => usage.MonthlyAiSmsCount,
            "max_ai_voice_minutes" => usage.MonthlyAiVoiceMinutes,
            "max_messages" or "max_monthly_messages" => usage.MonthlyMessagesCount,
            "max_api_calls" => usage.MonthlyApiCallsCount,
            _ => 0 // Unknown limit key - default to 0 (no usage)
        };
    }

    /// <summary>
    /// Gets a human-readable label for the limit key.
    /// </summary>
    private static string GetLimitLabel(string limitKey)
    {
        return limitKey switch
        {
            "max_workflows" or "max_active_workflows" => "active workflows",
            "max_leads" or "max_active_leads" => "active leads",
            "max_seats" or "max_team_seats" => "team seats",
            "max_channels" or "max_active_channels" => "communication channels",
            "max_phone_numbers" => "phone numbers",
            "max_crm_contacts" => "CRM contacts",
            "max_ai_voice_agents" => "AI voice agents",
            "max_ai_interactions" or "max_ai_conversations" => "monthly AI conversations",
            "max_ai_sms" => "monthly AI SMS messages",
            "max_ai_voice_minutes" => "monthly AI voice minutes",
            "max_messages" or "max_monthly_messages" => "monthly messages",
            "max_api_calls" => "monthly API calls",
            _ => limitKey.Replace("max_", string.Empty, StringComparison.Ordinal).Replace("_", " ", StringComparison.Ordinal)
        };
    }
}
