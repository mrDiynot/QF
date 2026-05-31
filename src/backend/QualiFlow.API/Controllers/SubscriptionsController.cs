using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Authorization;
using QualiFlow.Application.Features.Subscriptions.Services;
using QualiFlow.Domain.Constants;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for subscription management.
/// Read operations require any business role.
/// Billing changes (upgrade, downgrade, cancel) require Owner role.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
[Produces("application/json")]
public class SubscriptionsController : ControllerBase
{
    private readonly ISubscriptionService _subscriptionService;
    private readonly IUsageLimitService _usageLimitService;
    private readonly IStripeService _stripeService;
    private readonly IOverageAlertService _overageAlertService;
    private readonly ICurrentUserService _currentUserService;
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<SubscriptionsController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="SubscriptionsController"/> class.
    /// </summary>
    /// <param name="subscriptionService">The subscription service.</param>
    /// <param name="usageLimitService">The usage limit service.</param>
    /// <param name="stripeService">The Stripe service.</param>
    /// <param name="overageAlertService">The overage alert service.</param>
    /// <param name="currentUserService">The current user service.</param>
    /// <param name="context">The database context.</param>
    /// <param name="logger">The logger.</param>
    public SubscriptionsController(
        ISubscriptionService subscriptionService,
        IUsageLimitService usageLimitService,
        IStripeService stripeService,
        IOverageAlertService overageAlertService,
        ICurrentUserService currentUserService,
        QualiFlowDbContext context,
        ILogger<SubscriptionsController> logger)
    {
        _subscriptionService = subscriptionService;
        _usageLimitService = usageLimitService;
        _stripeService = stripeService;
        _overageAlertService = overageAlertService;
        _currentUserService = currentUserService;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Gets all available subscription plans.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>List of subscription plans with features and limits.</returns>
    [HttpGet("plans")]
    [AllowAnonymous] // Public endpoint for pricing page
    [CacheControl(CacheStrategies.VeryLongTerm)] // Cache for 24 hours - public, rarely changes
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllPlans(CancellationToken cancellationToken)
    {
        var plans = await _subscriptionService.GetAllPlansAsync(includeInactive: false, cancellationToken);

        // Map to DTOs to avoid circular reference issues
        // Include both feature keys (for frontend logic) and display names (for UI)
        var response = plans.Select(p => new
        {
            p.Id,
            p.Name,
            p.DisplayName,
            p.Description,
            p.PriceMonthly,
            p.PriceQuarterly,
            p.PriceYearly,
            p.DiscountQuarterly,
            p.DiscountAnnual,
            p.OnboardingPrice,
            p.OnboardingRequired,
            p.StripePriceIdMonthly,
            p.StripePriceIdQuarterly,
            p.StripePriceIdYearly,

            // Trial settings (configurable via admin CMS)
            p.AllowsTrial,
            p.TrialDays,
            p.IsActive,
            p.SortOrder,
            Limits = p.Limits?.ToDictionary(l => l.LimitKey, l => l.LimitValue) ?? new Dictionary<string, string>(),

            // Return feature keys for programmatic access checking
            FeatureKeys = p.Features?.Select(f => f.Feature?.FeatureKey ?? string.Empty).Where(k => !string.IsNullOrEmpty(k)).ToList() ?? [],

            // Return feature display names for UI display
            Features = p.Features?.Select(f => new FeatureDto
            {
                Key = f.Feature?.FeatureKey ?? string.Empty,
                DisplayName = f.Feature?.DisplayName ?? f.FeatureId.ToString(),
                Category = f.Feature?.Category ?? "unknown"
            }).ToList() ?? [],
        });

        return Ok(response);
    }

    /// <summary>
    /// Gets the current subscription with limits, usage, and feature access.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The current subscription details including features.</returns>
    [HttpGet("current")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)] // No caching - subscription data must always be fresh
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCurrentSubscription(CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var subscription = await _subscriptionService.GetSubscriptionAsync(businessId, cancellationToken);

        // Auto-create FreeFlow subscription for existing businesses without one (OAuth migration fix)
        if (subscription == null)
        {
            _logger.LogWarning("No subscription found for business {BusinessId}, auto-creating FreeFlow subscription", businessId);
            try
            {
                subscription = await _subscriptionService.CreateDefaultSubscriptionAsync(businessId, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to auto-create subscription for business {BusinessId}", businessId);
                return NotFound(new { message = "Subscription not found and could not be created. Please contact support." });
            }
        }

        // CRITICAL: Check for completed subscription intents that haven't been reconciled
        // This handles the race condition where payment is complete but webhook hasn't processed
        var completedIntent = await _context.SubscriptionIntents
            .Include(si => si.IntendedPlan)
                .ThenInclude(p => p.Features)
                    .ThenInclude(pf => pf.Feature)
            .Where(si => si.BusinessId == businessId)
            .Where(si => si.Status == SubscriptionIntentStatus.Completed)
            .Where(si => si.CompletedAt > DateTime.UtcNow.AddHours(-24)) // Only check intents completed in last 24 hours
            .OrderByDescending(si => si.CompletedAt)
            .FirstOrDefaultAsync(cancellationToken);

        // If there's a completed intent for a different (upgraded) plan, reconcile now
        if (completedIntent != null && completedIntent.IntendedPlanId != subscription.PlanId)
        {
            _logger.LogWarning(
                "Found unreconciled completed intent {IntentId} for business {BusinessId}: current plan {CurrentPlanId}, intended plan {IntendedPlanId}. Reconciling now.",
                completedIntent.Id,
                businessId,
                subscription.PlanId,
                completedIntent.IntendedPlanId);

            try
            {
                // Upgrade the subscription immediately
                subscription = await _subscriptionService.UpgradeSubscriptionAsync(
                    businessId,
                    completedIntent.IntendedPlanId,
                    cancellationToken);

                _logger.LogInformation(
                    "Successfully reconciled subscription for business {BusinessId} to plan {PlanId}",
                    businessId,
                    completedIntent.IntendedPlanId);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to reconcile subscription for business {BusinessId} to plan {PlanId}",
                    businessId,
                    completedIntent.IntendedPlanId);

                // Continue with current subscription - don't fail the request
            }
        }

        var limits = await _subscriptionService.GetBusinessLimitsAsync(businessId, cancellationToken);
        var usage = await _usageLimitService.GetUsageCountersAsync(businessId, cancellationToken);

        // Get the plan with features (re-fetch in case we just upgraded)
        var plan = await _subscriptionService.GetPlanByIdAsync(subscription.PlanId, cancellationToken);
        var featureKeys = plan?.Features?.Select(f => f.Feature?.FeatureKey ?? string.Empty)
            .Where(k => !string.IsNullOrEmpty(k)).ToList() ?? new List<string>();

        var response = new
        {
            subscription = new
            {
                subscription.Id,
                subscription.PlanId,
                PlanName = plan?.DisplayName ?? plan?.Name ?? "Unknown",
                subscription.Status,
                subscription.CurrentPeriodStart,
                subscription.CurrentPeriodEnd,
                subscription.TrialEnd,
                subscription.CancelAtPeriodEnd,
                subscription.MonthlyAmount,
                subscription.Currency
            },
            limits,

            // Feature keys for programmatic access checking in frontend
            featureKeys,
            usage = new
            {
                usage?.CurrentLeadsCount,
                usage?.CurrentChannelsCount,
                usage?.CurrentPhoneNumbersCount,
                usage?.CurrentSeatsCount,
                usage?.CurrentWorkflowsCount,
                usage?.CurrentCrmContactsCount,
                usage?.MonthlyMessagesCount,
                usage?.MonthlyAiConversationsCount,
                usage?.StorageUsedGB,
                usage?.BillingCycleStart,
                usage?.BillingCycleEnd
            }
        };

        return Ok(response);
    }

    /// <summary>
    /// Verifies a Stripe checkout session and returns subscription details.
    /// </summary>
    /// <param name="sessionId">The Stripe checkout session ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The checkout session details.</returns>
    [HttpGet("verify-checkout/{sessionId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> VerifyCheckoutSession(
        string sessionId,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var result = await _stripeService.VerifyCheckoutSessionAsync(sessionId, businessId, cancellationToken);

        if (result == null)
        {
            return NotFound(new { message = "Checkout session not found or does not belong to this business" });
        }

        return Ok(result);
    }

    /// <summary>
    /// Gets any pending subscription intent for the current user's business.
    /// This is used after login to detect incomplete payment flows and resume them.
    /// Returns the most recent pending intent that hasn't expired.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The pending subscription intent if one exists, otherwise 204 No Content.</returns>
    [HttpGet("pending-intent")]
    [ProducesResponseType(typeof(PendingIntentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> GetPendingIntent(CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        // Find the most recent pending intent that hasn't expired
        var pendingIntent = await _context.SubscriptionIntents
            .Include(si => si.IntendedPlan)
            .Where(si => si.BusinessId == businessId)
            .Where(si => si.Status == SubscriptionIntentStatus.Pending)
            .Where(si => si.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(si => si.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (pendingIntent == null)
        {
            return NoContent();
        }

        _logger.LogInformation(
            "Found pending subscription intent {IntentId} for business {BusinessId} - Plan: {PlanName}",
            pendingIntent.Id,
            businessId,
            pendingIntent.IntendedPlan?.DisplayName ?? pendingIntent.IntendedPlan?.Name);

        return Ok(new PendingIntentResponse
        {
            IntentId = pendingIntent.Id,
            PlanId = pendingIntent.IntendedPlanId,
            PlanName = pendingIntent.IntendedPlan?.Name ?? string.Empty,
            PlanDisplayName = pendingIntent.IntendedPlan?.DisplayName ?? pendingIntent.IntendedPlan?.Name ?? string.Empty,
            BillingInterval = pendingIntent.BillingInterval ?? "monthly",
            IncludeOnboarding = pendingIntent.IncludeOnboarding,
            StripeCheckoutSessionId = pendingIntent.StripeCheckoutSessionId,
            AmountCents = pendingIntent.AmountCents,
            Currency = pendingIntent.Currency ?? "USD",
            CreatedAt = pendingIntent.CreatedAt,
            ExpiresAt = pendingIntent.ExpiresAt,
        });
    }

    /// <summary>
    /// Creates a Stripe checkout session for initial subscription or upgrade.
    /// This endpoint is used during registration for paid plans.
    /// </summary>
    /// <param name="request">The checkout request.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The checkout session URL.</returns>
    [HttpPost("checkout")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateCheckoutSession(
        [FromBody] CreateCheckoutRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        // Find the plan by slug or ID
        var plan = await _subscriptionService.GetPlanBySlugAsync(request.PlanId, cancellationToken);
        if (plan == null && Guid.TryParse(request.PlanId, out var planGuid))
        {
            plan = await _subscriptionService.GetPlanByIdAsync(planGuid, cancellationToken);
        }

        if (plan == null)
        {
            return BadRequest(new { message = $"Plan '{request.PlanId}' not found" });
        }

        var checkoutUrl = await _stripeService.CreateCheckoutSessionAsync(
            businessId,
            plan.Id,
            request.BillingInterval,
            request.IncludeOnboarding,
            request.SuccessUrl,
            request.CancelUrl,
            cancellationToken);

        _logger.LogInformation(
            "Created checkout session for business {BusinessId} for plan {PlanId} with interval {Interval}, onboarding: {IncludeOnboarding}",
            businessId,
            plan.Id,
            request.BillingInterval,
            request.IncludeOnboarding);

        return Ok(new { checkoutUrl });
    }

    /// <summary>
    /// Creates a Stripe checkout session for subscription upgrade.
    /// Requires Owner role (billing changes).
    /// </summary>
    /// <param name="request">The upgrade request.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The checkout session URL.</returns>
    [HttpPost("upgrade")]
    [Authorize(Policy = BusinessPolicies.RequireOwner)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpgradeSubscription(
        [FromBody] UpgradeSubscriptionRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var subscription = await _subscriptionService.GetSubscriptionAsync(businessId, cancellationToken);

        if (subscription == null)
        {
            return BadRequest(new { message = "Subscription not found" });
        }

        var checkoutUrl = await _stripeService.CreateCheckoutSessionAsync(
            businessId,
            request.TargetPlanId,
            cancellationToken);

        _logger.LogInformation(
            "Created checkout session for business {BusinessId} to upgrade to plan {PlanId}",
            businessId,
            request.TargetPlanId);

        return Ok(new { checkoutUrl });
    }

    /// <summary>
    /// Schedules a subscription downgrade to the next billing cycle.
    /// Requires Owner role (billing changes).
    /// </summary>
    /// <param name="request">The downgrade request.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The updated subscription.</returns>
    [HttpPost("downgrade")]
    [Authorize(Policy = BusinessPolicies.RequireOwner)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DowngradeSubscription(
        [FromBody] DowngradeSubscriptionRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var subscription = await _subscriptionService.GetSubscriptionAsync(businessId, cancellationToken);

        if (subscription == null)
        {
            return BadRequest(new { message = "Subscription not found" });
        }

        var updatedSubscription = await _subscriptionService.DowngradeSubscriptionAsync(
            businessId,
            request.TargetPlanId,
            cancellationToken);

        _logger.LogInformation(
            "Scheduled downgrade for business {BusinessId} to plan {PlanId} on {ScheduledDate}",
            businessId,
            request.TargetPlanId,
            updatedSubscription.ScheduledChangeDate);

        return Ok(new
        {
            message = "Downgrade scheduled for next billing cycle",
            scheduledPlanId = updatedSubscription.ScheduledPlanId,
            scheduledDate = updatedSubscription.ScheduledChangeDate
        });
    }

    /// <summary>
    /// Cancels the subscription (30-day grace period).
    /// Requires Owner role (billing changes).
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The cancellation confirmation.</returns>
    [HttpPost("cancel")]
    [Authorize(Policy = BusinessPolicies.RequireOwner)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelSubscription(CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var subscription = await _subscriptionService.CancelSubscriptionAsync(businessId, cancellationToken);

        _logger.LogInformation(
            "Cancelled subscription for business {BusinessId}",
            businessId);

        return Ok(new
        {
            message = "Subscription cancelled. Access will continue until the end of the billing period.",
            cancelledAt = subscription.CancelledAt,
            accessUntil = subscription.CurrentPeriodEnd
        });
    }

    /// <summary>
    /// Gets detailed usage breakdown.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The usage details.</returns>
    [HttpGet("usage")]
    [ResponseCache(Duration = 30, VaryByHeader = "Authorization")] // Cache for 30 seconds, vary by user
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUsage(CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var subscription = await _subscriptionService.GetSubscriptionAsync(businessId, cancellationToken);

        if (subscription == null)
        {
            return NotFound(new { message = "Subscription not found" });
        }

        var limits = await _subscriptionService.GetBusinessLimitsAsync(businessId, cancellationToken);
        var usage = await _usageLimitService.GetUsageCountersAsync(businessId, cancellationToken);

        var response = new
        {
            billingCycle = new
            {
                start = usage?.BillingCycleStart,
                end = usage?.BillingCycleEnd
            },
            hardLimits = new
            {
                leads = new { current = usage?.CurrentLeadsCount, limit = ParseLimit(limits, LimitConstants.MaxLeads), percentage = CalculatePercentage(usage?.CurrentLeadsCount, ParseLimit(limits, LimitConstants.MaxLeads)) },
                channels = new { current = usage?.CurrentChannelsCount, limit = ParseLimit(limits, LimitConstants.MaxChannels), percentage = CalculatePercentage(usage?.CurrentChannelsCount, ParseLimit(limits, LimitConstants.MaxChannels)) },
                phoneNumbers = new { current = usage?.CurrentPhoneNumbersCount, limit = ParseLimit(limits, LimitConstants.MaxPhoneNumbers), percentage = CalculatePercentage(usage?.CurrentPhoneNumbersCount, ParseLimit(limits, LimitConstants.MaxPhoneNumbers)) },
                seats = new { current = usage?.CurrentSeatsCount, limit = ParseLimit(limits, LimitConstants.MaxSeats), percentage = CalculatePercentage(usage?.CurrentSeatsCount, ParseLimit(limits, LimitConstants.MaxSeats)) },
                workflows = new { current = usage?.CurrentWorkflowsCount, limit = ParseLimit(limits, LimitConstants.MaxWorkflows), percentage = CalculatePercentage(usage?.CurrentWorkflowsCount, ParseLimit(limits, LimitConstants.MaxWorkflows)) },
                crmContacts = new { current = usage?.CurrentCrmContactsCount, limit = ParseLimit(limits, LimitConstants.MaxCrmContacts), percentage = CalculatePercentage(usage?.CurrentCrmContactsCount, ParseLimit(limits, LimitConstants.MaxCrmContacts)) },
                storageGB = new { current = usage?.StorageUsedGB, limit = ParseLimit(limits, LimitConstants.MaxStorageGb), percentage = CalculatePercentage((int?)usage?.StorageUsedGB, ParseLimit(limits, LimitConstants.MaxStorageGb)) }
            },
            softLimits = new
            {
                messages = new { current = usage?.MonthlyMessagesCount, limit = ParseLimit(limits, LimitConstants.MaxMessages), overage = Math.Max(0, (usage?.MonthlyMessagesCount ?? 0) - ParseLimit(limits, LimitConstants.MaxMessages)) },
                aiConversations = new { current = usage?.MonthlyAiConversationsCount, limit = int.MaxValue, overage = 0 }
            }
        };

        return Ok(response);
    }

    private static int ParseLimit(IReadOnlyDictionary<string, string> limits, string key)
    {
        var value = limits.GetValueOrDefault(key, "unlimited");
        return value == "unlimited" ? int.MaxValue : int.Parse(value, System.Globalization.CultureInfo.InvariantCulture);
    }

    private static int CalculatePercentage(int? current, int limit)
    {
        if (limit == int.MaxValue || !current.HasValue)
        {
            return 0;
        }

        return (int)((current.Value / (double)limit) * 100);
    }

    /// <summary>
    /// Creates a Stripe billing portal session for managing subscription.
    /// </summary>
    /// <param name="returnUrl">The URL to return to after the portal session.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The billing portal URL.</returns>
    [HttpGet("billing-portal")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
#pragma warning disable CA1054 // URI parameters should not be strings
    public async Task<IActionResult> GetBillingPortalUrl(
        [FromQuery] string? returnUrl = null,
        CancellationToken cancellationToken = default)
#pragma warning restore CA1054
    {
        var businessId = _currentUserService.GetBusinessId();
#pragma warning disable S1075 // Hardcoded URI is a fallback for development
        var defaultReturnUrl = "http://localhost:3000/settings/subscription";
#pragma warning restore S1075
        var portalUrl = await _stripeService.CreateBillingPortalSessionAsync(
            businessId,
            returnUrl ?? defaultReturnUrl,
            cancellationToken);

        return Ok(new { portalUrl });
    }

    /// <summary>
    /// Gets invoice history for the current business.
    /// </summary>
    /// <param name="limit">Maximum number of invoices to return (default 10).</param>
    /// <param name="startingAfter">Pagination cursor for next page.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>List of invoices with pagination info.</returns>
    [HttpGet("invoices")]
    [ProducesResponseType(typeof(InvoiceListResult), StatusCodes.Status200OK)]
    public async Task<ActionResult<InvoiceListResult>> GetInvoicesAsync(
        [FromQuery] int limit = 10,
        [FromQuery] string? startingAfter = null,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var result = await _stripeService.GetInvoicesAsync(businessId, limit, startingAfter, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Gets a specific invoice by ID.
    /// </summary>
    /// <param name="invoiceId">The Stripe invoice ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The invoice details.</returns>
    [HttpGet("invoices/{invoiceId}")]
    [ProducesResponseType(typeof(InvoiceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<InvoiceDto>> GetInvoiceByIdAsync(
        string invoiceId,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var invoice = await _stripeService.GetInvoiceByIdAsync(businessId, invoiceId, cancellationToken);

        if (invoice == null)
        {
            return NotFound();
        }

        return Ok(invoice);
    }

    /// <summary>
    /// Gets payment methods for the current business.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>List of payment methods.</returns>
    [HttpGet("payment-methods")]
    [ProducesResponseType(typeof(IEnumerable<PaymentMethodDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<PaymentMethodDto>>> GetPaymentMethodsAsync(
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var paymentMethods = await _stripeService.GetPaymentMethodsAsync(businessId, cancellationToken);
        return Ok(paymentMethods);
    }

    /// <summary>
    /// Creates a setup intent for adding a new payment method.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The setup intent client secret.</returns>
    [HttpPost("payment-methods/setup-intent")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> CreateSetupIntentAsync(CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var clientSecret = await _stripeService.CreateSetupIntentAsync(businessId, cancellationToken);
        return Ok(new { clientSecret });
    }

    /// <summary>
    /// Sets a payment method as the default.
    /// </summary>
    /// <param name="paymentMethodId">The Stripe payment method ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>Success status.</returns>
    [HttpPost("payment-methods/{paymentMethodId}/default")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetDefaultPaymentMethodAsync(
        string paymentMethodId,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var success = await _stripeService.SetDefaultPaymentMethodAsync(businessId, paymentMethodId, cancellationToken);

        if (!success)
        {
            return NotFound();
        }

        return Ok(new { success = true });
    }

    /// <summary>
    /// Deletes a payment method.
    /// </summary>
    /// <param name="paymentMethodId">The Stripe payment method ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>No content on success.</returns>
    [HttpDelete("payment-methods/{paymentMethodId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePaymentMethodAsync(
        string paymentMethodId,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var success = await _stripeService.DeletePaymentMethodAsync(businessId, paymentMethodId, cancellationToken);

        if (!success)
        {
            return NotFound();
        }

        return NoContent();
    }

    /// <summary>
    /// Gets overage alert settings for the current business.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>Alert settings.</returns>
    [HttpGet("overage-alerts")]
    [ProducesResponseType(typeof(OverageAlertSettingsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<OverageAlertSettingsDto>> GetOverageAlertSettingsAsync(
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var settings = await _overageAlertService.GetSettingsAsync(businessId, cancellationToken);
        return Ok(settings);
    }

    /// <summary>
    /// Updates overage alert settings for the current business.
    /// </summary>
    /// <param name="request">The update request.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>Updated settings.</returns>
    [HttpPut("overage-alerts")]
    [ProducesResponseType(typeof(OverageAlertSettingsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<OverageAlertSettingsDto>> UpdateOverageAlertSettingsAsync(
        [FromBody] UpdateOverageAlertSettingsRequest request,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var settings = await _overageAlertService.UpdateSettingsAsync(businessId, request, cancellationToken);
        return Ok(settings);
    }
}

/// <summary>
/// Request to create a checkout session for subscription.
/// </summary>
/// <param name="PlanId">The plan ID or slug.</param>
/// <param name="BillingInterval">The billing interval (monthly, quarterly, yearly).</param>
/// <param name="IncludeOnboarding">Whether to include optional onboarding in billing.</param>
/// <param name="SuccessUrl">Optional custom success URL.</param>
/// <param name="CancelUrl">Optional custom cancel URL.</param>
#pragma warning disable CA1054, CA1056 // URI parameters/properties should not be strings - URLs come from frontend as strings
public record CreateCheckoutRequest(
    string PlanId,
    string BillingInterval = PlanConstants.BillingMonthly,
    bool IncludeOnboarding = false,
    string? SuccessUrl = null,
    string? CancelUrl = null);
#pragma warning restore CA1054, CA1056

/// <summary>
/// Request to upgrade subscription.
/// </summary>
/// <param name="TargetPlanId">The target subscription plan ID.</param>
public record UpgradeSubscriptionRequest(Guid TargetPlanId);

/// <summary>
/// Request to downgrade subscription.
/// </summary>
/// <param name="TargetPlanId">The target subscription plan ID.</param>
public record DowngradeSubscriptionRequest(Guid TargetPlanId);

/// <summary>
/// Feature information for API response.
/// </summary>
public class FeatureDto
{
    /// <summary>
    /// Gets or sets the feature key (e.g., "webchat", "ai_sms").
    /// </summary>
    public string Key { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the display name for UI.
    /// </summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the feature category.
    /// </summary>
    public string Category { get; set; } = string.Empty;
}

/// <summary>
/// Response for pending subscription intent.
/// </summary>
public class PendingIntentResponse
{
    /// <summary>Gets or sets the intent ID.</summary>
    public Guid IntentId { get; set; }

    /// <summary>Gets or sets the intended plan ID.</summary>
    public Guid PlanId { get; set; }

    /// <summary>Gets or sets the plan name (slug).</summary>
    public string PlanName { get; set; } = string.Empty;

    /// <summary>Gets or sets the plan display name.</summary>
    public string PlanDisplayName { get; set; } = string.Empty;

    /// <summary>Gets or sets the billing interval (monthly/yearly).</summary>
    public string BillingInterval { get; set; } = "monthly";

    /// <summary>Gets or sets a value indicating whether onboarding assistance is included.</summary>
    public bool IncludeOnboarding { get; set; }

    /// <summary>Gets or sets the Stripe checkout session ID for resuming payment.</summary>
    public string? StripeCheckoutSessionId { get; set; }

    /// <summary>Gets or sets the amount in cents.</summary>
    public long? AmountCents { get; set; }

    /// <summary>Gets or sets the currency.</summary>
    public string Currency { get; set; } = "USD";

    /// <summary>Gets or sets when the intent was created.</summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>Gets or sets when the intent expires.</summary>
    public DateTime? ExpiresAt { get; set; }
}
