using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Email.Services;
using QualiFlow.Application.Features.Subscriptions.Services;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Constants;
using QualiFlow.Infrastructure.Data;
using Stripe;
using Stripe.Checkout;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for Stripe payment integration.
/// </summary>
public partial class StripeService : IStripeService
{
    private readonly QualiFlowDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<StripeService> _logger;
    private readonly ISubscriptionService _subscriptionService;
    private readonly ISubscriptionNotificationService _notificationService;
    private readonly IEmailService _emailService;

    /// <summary>
    /// Initializes a new instance of the <see cref="StripeService"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="configuration">The configuration.</param>
    /// <param name="logger">The logger.</param>
    /// <param name="subscriptionService">The subscription service.</param>
    /// <param name="notificationService">The subscription notification service.</param>
    /// <param name="emailService">The email service for sending notifications.</param>
    public StripeService(
        QualiFlowDbContext context,
        IConfiguration configuration,
        ILogger<StripeService> logger,
        ISubscriptionService subscriptionService,
        ISubscriptionNotificationService notificationService,
        IEmailService emailService)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
        _subscriptionService = subscriptionService;
        _notificationService = notificationService;
        _emailService = emailService;

        // Set Stripe API key
        StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
    }

    /// <inheritdoc/>
    public async Task<string> CreateCheckoutSessionAsync(
        Guid businessId,
        Guid targetPlanId,
        CancellationToken cancellationToken)
    {
        return await CreateCheckoutSessionAsync(
            businessId,
            targetPlanId,
            SubscriptionConstants.BillingIntervalMonthly,
            false,
            null,
            null,
            cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<string> CreateCheckoutSessionAsync(
        Guid businessId,
        Guid targetPlanId,
        string billingInterval,
        bool includeOnboarding,
        string? successUrl,
        string? cancelUrl,
        CancellationToken cancellationToken)
    {
        var business = await _context.Businesses
            .Include(b => b.Subscription)
            .FirstOrDefaultAsync(b => b.Id == businessId, cancellationToken)
            ?? throw new InvalidOperationException($"Business {businessId} not found");

        // Get customer email - prefer business email, fall back to first user's email
        var customerEmail = business.Email;
        if (string.IsNullOrEmpty(customerEmail))
        {
            var firstUser = await _context.Users
                .Where(u => u.BusinessId == businessId)
                .Select(u => u.Email)
                .FirstOrDefaultAsync(cancellationToken);
            customerEmail = firstUser;
        }

        // Get target plan
        var targetPlan = await _context.SubscriptionPlans
            .FirstOrDefaultAsync(p => p.Id == targetPlanId, cancellationToken)
            ?? throw new InvalidOperationException($"Plan {targetPlanId} not found");

        // Get or create Stripe customer
        var customerId = business.StripeCustomerId;
        if (string.IsNullOrEmpty(customerId))
        {
            customerId = await CreateCustomerAsync(
                businessId,
                customerEmail ?? string.Empty,
                business.Name,
                cancellationToken);
        }
        else if (!string.IsNullOrEmpty(customerEmail))
        {
            // Update existing customer's email if not set in Stripe
            var customerService = new CustomerService();
            var existingCustomer = await customerService.GetAsync(customerId, cancellationToken: cancellationToken);
            if (string.IsNullOrEmpty(existingCustomer.Email))
            {
                await customerService.UpdateAsync(customerId, new CustomerUpdateOptions { Email = customerEmail }, cancellationToken: cancellationToken);
                _logger.LogInformation("Updated Stripe customer {CustomerId} email to {Email}", customerId, customerEmail);
            }
        }

        // Get Stripe price ID based on billing interval
        var priceId = billingInterval.ToLowerInvariant() switch
        {
            SubscriptionConstants.BillingIntervalYearly or "annual" => targetPlan.StripePriceIdYearly ?? targetPlan.StripePriceIdMonthly,
            "quarterly" => targetPlan.StripePriceIdQuarterly ?? targetPlan.StripePriceIdMonthly,
            _ => targetPlan.StripePriceIdMonthly
        };

        // Use custom URLs or defaults
        var finalSuccessUrl = !string.IsNullOrEmpty(successUrl)
            ? successUrl
            : $"{_configuration["App:FrontendUrl"]}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}";
        var finalCancelUrl = !string.IsNullOrEmpty(cancelUrl)
            ? cancelUrl
            : $"{_configuration["App:FrontendUrl"]}/subscription/cancel";

        // Build line items - subscription price + optional onboarding
        var lineItems = new List<SessionLineItemOptions>();

        // If price ID is configured, use it; otherwise create dynamic price_data
        if (!string.IsNullOrEmpty(priceId))
        {
            lineItems.Add(new SessionLineItemOptions
            {
                Price = priceId,
                Quantity = 1
            });
        }
        else
        {
            // Create dynamic price for development/testing when Stripe price IDs aren't configured
            var (unitAmount, intervalCount, interval) = GetPriceDetails(targetPlan, billingInterval);

            lineItems.Add(new SessionLineItemOptions
            {
                PriceData = new SessionLineItemPriceDataOptions
                {
                    Currency = "usd",
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = targetPlan.DisplayName ?? targetPlan.Name,
                        Description = targetPlan.Description ?? $"{targetPlan.Name} subscription plan"
                    },
                    UnitAmount = unitAmount,
                    Recurring = new SessionLineItemPriceDataRecurringOptions
                    {
                        Interval = interval,
                        IntervalCount = intervalCount
                    }
                },
                Quantity = 1
            });

            _logger.LogWarning(
                "Using dynamic price_data for plan {PlanName} - consider configuring Stripe price IDs for production",
                targetPlan.Name);
        }

        // Add onboarding as one-time charge if:
        // 1. Onboarding is required for the plan, OR
        // 2. User opted into optional onboarding
        if (targetPlan.OnboardingPrice.HasValue && (targetPlan.OnboardingRequired || includeOnboarding))
        {
            // Add onboarding as a one-time price_data item
            lineItems.Add(new SessionLineItemOptions
            {
                PriceData = new SessionLineItemPriceDataOptions
                {
                    Currency = "usd",
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = $"{targetPlan.DisplayName ?? targetPlan.Name} - Professional Onboarding",
                        Description = "One-time professional onboarding and setup assistance"
                    },
                    UnitAmount = (long)(targetPlan.OnboardingPrice!.Value * 100) // Convert to cents
                },
                Quantity = 1
            });
        }

        // Create checkout session
        var options = new SessionCreateOptions
        {
            Customer = customerId,
            CustomerEmail = !string.IsNullOrEmpty(customerEmail) && string.IsNullOrEmpty(customerId) ? customerEmail : null,
            PaymentMethodTypes = new List<string> { "card" },
            LineItems = lineItems,
            Mode = "subscription",
            SuccessUrl = finalSuccessUrl,
            CancelUrl = finalCancelUrl,
            CustomerUpdate = new SessionCustomerUpdateOptions
            {
                Address = "auto",
                Name = "auto"
            },
            Metadata = new Dictionary<string, string>
            {
                { "business_id", businessId.ToString() },
                { "target_plan_id", targetPlanId.ToString() },
                { "billing_interval", billingInterval },
                { "include_onboarding", includeOnboarding.ToString() }
            }
        };

        var service = new SessionService();
        var session = await service.CreateAsync(options, cancellationToken: cancellationToken);

        // Create SubscriptionIntent to track user's plan selection for reconciliation
        // This ensures we can always recover the user's intent even if webhooks fail
        var (intentAmountCents, _, _) = GetPriceDetails(targetPlan, billingInterval);
        var subscriptionIntent = new Domain.Entities.SubscriptionIntent
        {
            BusinessId = businessId,
            IntendedPlanId = targetPlanId,
            BillingInterval = billingInterval,
            IncludeOnboarding = includeOnboarding,
            StripeCheckoutSessionId = session.Id,
            StripeCustomerId = customerId,
            Status = Domain.Entities.SubscriptionIntentStatus.Pending,
            ExpiresAt = DateTime.UtcNow.AddHours(24), // Stripe sessions expire after 24 hours
            Source = "checkout",
            AmountCents = intentAmountCents,
            Currency = "USD",
            CreatedAt = DateTime.UtcNow,
        };

        _context.SubscriptionIntents.Add(subscriptionIntent);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Created Stripe checkout session {SessionId} and SubscriptionIntent {IntentId} for business {BusinessId} plan {PlanName} interval {Interval} onboarding {IncludeOnboarding}",
            session.Id,
            subscriptionIntent.Id,
            businessId,
            targetPlan.DisplayName,
            billingInterval,
            includeOnboarding);

        return session.Url;
    }

    /// <summary>
    /// Gets price details for dynamic pricing based on billing interval.
    /// </summary>
    private static (long unitAmount, long intervalCount, string interval) GetPriceDetails(
        QualiFlow.Domain.Entities.SubscriptionPlan plan,
        string billingInterval)
    {
        return billingInterval.ToLowerInvariant() switch
        {
            SubscriptionConstants.BillingIntervalYearly or "annual" => ((long)((plan.PriceYearly ?? plan.PriceMonthly * 12) * 100), 1, "year"),
            "quarterly" => ((long)((plan.PriceQuarterly ?? plan.PriceMonthly * 3) * 100), 3, "month"),
            _ => ((long)(plan.PriceMonthly * 100), 1, "month")
        };
    }

    /// <inheritdoc/>
    public async Task<string> CreateCustomerAsync(
        Guid businessId,
        string email,
        string name,
        CancellationToken cancellationToken)
    {
        var options = new CustomerCreateOptions
        {
            Email = email,
            Name = name,
            Metadata = new Dictionary<string, string>
            {
                { "business_id", businessId.ToString() }
            }
        };

        var service = new CustomerService();
        var customer = await service.CreateAsync(options, cancellationToken: cancellationToken);

        // Update business with Stripe customer ID
        var business = await _context.Businesses.FindAsync(new object[] { businessId }, cancellationToken)
            ?? throw new InvalidOperationException($"Business {businessId} not found");

        business.StripeCustomerId = customer.Id;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Created Stripe customer {CustomerId} for business {BusinessId}",
            customer.Id,
            businessId);

        return customer.Id;
    }

    /// <inheritdoc/>
    public async Task CancelStripeSubscriptionAsync(
        string stripeSubscriptionId,
        CancellationToken cancellationToken)
    {
        var service = new Stripe.SubscriptionService();
        await service.CancelAsync(stripeSubscriptionId, cancellationToken: cancellationToken);

        _logger.LogInformation(
            "Cancelled Stripe subscription {SubscriptionId}",
            stripeSubscriptionId);
    }

    /// <inheritdoc/>
    public async Task UpdateSubscriptionAsync(
        string stripeSubscriptionId,
        string newPriceId,
        CancellationToken cancellationToken)
    {
        var service = new Stripe.SubscriptionService();
        var subscription = await service.GetAsync(stripeSubscriptionId, cancellationToken: cancellationToken);

        var options = new SubscriptionUpdateOptions
        {
            Items = new List<SubscriptionItemOptions>
            {
                new()
                {
                    Id = subscription.Items.Data[0].Id,
                    Price = newPriceId
                }
            },
            ProrationBehavior = "create_prorations"
        };

        await service.UpdateAsync(stripeSubscriptionId, options, cancellationToken: cancellationToken);

        _logger.LogInformation(
            "Updated Stripe subscription {SubscriptionId} to price {PriceId}",
            stripeSubscriptionId,
            newPriceId);
    }

    /// <inheritdoc/>
    public async Task<CheckoutSessionDetails?> VerifyCheckoutSessionAsync(
        string sessionId,
        Guid businessId,
        CancellationToken cancellationToken)
    {
        try
        {
            var sessionService = new SessionService();
            var session = await sessionService.GetAsync(
                sessionId,
                new SessionGetOptions { Expand = new List<string> { "line_items", "subscription" } },
                cancellationToken: cancellationToken);

            // Verify the session belongs to this business
            if (!session.Metadata.TryGetValue("business_id", out var sessionBusinessId) ||
                sessionBusinessId != businessId.ToString())
            {
                _logger.LogWarning(
                    "Checkout session {SessionId} does not belong to business {BusinessId}",
                    sessionId,
                    businessId);
                return null;
            }

            // Get plan details from metadata
            var planId = session.Metadata.GetValueOrDefault("target_plan_id");
            var billingInterval = session.Metadata.GetValueOrDefault("billing_interval") ?? SubscriptionConstants.BillingIntervalMonthly;
            var includeOnboarding = session.Metadata.GetValueOrDefault("include_onboarding") == "True";

            // Get plan from database
            Domain.Entities.SubscriptionPlan? plan = null;
            Guid planGuid = Guid.Empty;
            if (Guid.TryParse(planId, out planGuid))
            {
                plan = await _context.SubscriptionPlans
                    .Include(p => p.Features)
                        .ThenInclude(pf => pf.Feature)
                    .FirstOrDefaultAsync(p => p.Id == planGuid, cancellationToken);
            }

            // Get business name
            var business = await _context.Businesses
                .FirstOrDefaultAsync(b => b.Id == businessId, cancellationToken);
            var businessName = business?.Name;

            // Calculate amounts
            var amountTotal = session.AmountTotal.HasValue ? session.AmountTotal.Value / 100m : 0m;
            decimal? onboardingAmount = null;

            // Include onboarding amount if required by plan OR user opted in
            if (plan?.OnboardingPrice.HasValue == true && (plan.OnboardingRequired || includeOnboarding))
            {
                onboardingAmount = plan.OnboardingPrice.Value;
            }

            // Get subscription dates
            DateTime? subscriptionStart = null;
            DateTime? subscriptionEnd = null;

            if (session.Subscription is Stripe.Subscription subscription)
            {
                subscriptionStart = subscription.CurrentPeriodStart;
                subscriptionEnd = subscription.CurrentPeriodEnd;
            }

            // Get feature names
            var features = plan?.Features
                .Where(pf => pf.Feature != null)
                .Select(pf => pf.Feature!.DisplayName ?? pf.Feature.FeatureKey)
                .ToList() ?? new List<string>();

            // CRITICAL: If payment is complete, immediately upgrade the subscription
            // This ensures the user gets their paid features without waiting for webhook
            // The webhook will be a no-op if it runs later (idempotent update)
            if (session.Status == "complete" && session.PaymentStatus == "paid" && plan != null)
            {
                _logger.LogInformation(
                    "Payment verified for session {SessionId}, immediately upgrading business {BusinessId} to plan {PlanId}",
                    sessionId,
                    businessId,
                    planGuid);

                // Update SubscriptionIntent status first
                var subscriptionIntent = await _context.SubscriptionIntents
                    .FirstOrDefaultAsync(si => si.StripeCheckoutSessionId == sessionId, cancellationToken);

                if (subscriptionIntent != null && subscriptionIntent.Status == Domain.Entities.SubscriptionIntentStatus.Pending)
                {
                    subscriptionIntent.Status = Domain.Entities.SubscriptionIntentStatus.Completed;
                    subscriptionIntent.CompletedAt = DateTime.UtcNow;
                    subscriptionIntent.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync(cancellationToken);

                    _logger.LogInformation(
                        "Updated SubscriptionIntent {IntentId} to Completed status",
                        subscriptionIntent.Id);
                }

                // Upgrade the subscription - this is idempotent (checks if already upgraded)
                try
                {
                    await _subscriptionService.UpgradeSubscriptionAsync(businessId, planGuid, cancellationToken);

                    _logger.LogInformation(
                        "Successfully upgraded business {BusinessId} to plan {PlanName} ({PlanId})",
                        businessId,
                        plan.DisplayName ?? plan.Name,
                        planGuid);
                }
                catch (Exception ex)
                {
                    // Log but don't fail - the webhook will retry
                    _logger.LogError(
                        ex,
                        "Failed to upgrade subscription during verify for business {BusinessId}, webhook will retry",
                        businessId);
                }
            }

            return new CheckoutSessionDetails(
                SessionId: session.Id,
                Status: session.Status ?? "unknown",
                PaymentStatus: session.PaymentStatus,
                CustomerEmail: session.CustomerDetails?.Email ?? session.CustomerEmail,
                BusinessName: businessName,
                PlanName: plan?.Name ?? "Unknown Plan",
                PlanDisplayName: plan?.DisplayName,
                BillingInterval: billingInterval,
                AmountTotal: amountTotal,
                Currency: session.Currency?.ToUpperInvariant() ?? "USD",
                IncludeOnboarding: includeOnboarding,
                OnboardingAmount: onboardingAmount,
                SubscriptionStart: subscriptionStart,
                SubscriptionEnd: subscriptionEnd,
                Features: features);
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, "Failed to verify checkout session {SessionId}", sessionId);
            return null;
        }
    }

    /// <inheritdoc/>
    public async Task HandleWebhookAsync(
        string json,
        string signature,
        CancellationToken cancellationToken)
    {
        var webhookSecret = _configuration["Stripe:WebhookSecret"]
            ?? throw new InvalidOperationException("Stripe webhook secret not configured");

        try
        {
            var stripeEvent = EventUtility.ConstructEvent(json, signature, webhookSecret, throwOnApiVersionMismatch: false);

            _logger.LogInformation(
                "Processing Stripe webhook event {EventType} {EventId}",
                stripeEvent.Type,
                stripeEvent.Id);

            switch (stripeEvent.Type)
            {
                case SubscriptionConstants.StripeEventCheckoutCompleted:
                    await HandleCheckoutSessionCompletedAsync(stripeEvent, cancellationToken);
                    break;

                case SubscriptionConstants.StripeEventSubscriptionUpdated:
                    await HandleSubscriptionUpdatedAsync(stripeEvent, cancellationToken);
                    break;

                case SubscriptionConstants.StripeEventSubscriptionDeleted:
                    await HandleSubscriptionDeletedAsync(stripeEvent, cancellationToken);
                    break;

                case SubscriptionConstants.StripeEventInvoicePaid:
                    await HandleInvoicePaidAsync(stripeEvent, cancellationToken);
                    break;

                case SubscriptionConstants.StripeEventInvoicePaymentFailed:
                    await HandleInvoicePaymentFailedAsync(stripeEvent, cancellationToken);
                    break;

                default:
                    _logger.LogInformation(
                        "Unhandled Stripe webhook event type {EventType}",
                        stripeEvent.Type);
                    break;
            }
        }
        catch (StripeException ex)
        {
            _logger.LogError(
                ex,
                "Stripe webhook signature verification failed");
            throw;
        }
    }

    private async Task HandleCheckoutSessionCompletedAsync(Event stripeEvent, CancellationToken cancellationToken)
    {
        var session = stripeEvent.Data.Object as Session;
        if (session == null)
        {
            return;
        }

        // First, try to find the SubscriptionIntent by session ID for proper reconciliation
        var subscriptionIntent = await _context.SubscriptionIntents
            .FirstOrDefaultAsync(si => si.StripeCheckoutSessionId == session.Id, cancellationToken);

        Guid businessId;
        Guid targetPlanId;

        if (subscriptionIntent != null)
        {
            // Use the SubscriptionIntent as the source of truth
            businessId = subscriptionIntent.BusinessId;
            targetPlanId = subscriptionIntent.IntendedPlanId;

            _logger.LogInformation(
                "Found SubscriptionIntent {IntentId} for session {SessionId}, upgrading business {BusinessId} to plan {PlanId}",
                subscriptionIntent.Id,
                session.Id,
                businessId,
                targetPlanId);
        }
        else
        {
            // Fallback to session metadata (legacy support)
            _logger.LogWarning(
                "No SubscriptionIntent found for session {SessionId}, falling back to metadata",
                session.Id);

            businessId = Guid.Parse(session.Metadata["business_id"]);
            targetPlanId = Guid.Parse(session.Metadata["target_plan_id"]);
        }

        // Upgrade the subscription
        await _subscriptionService.UpgradeSubscriptionAsync(businessId, targetPlanId, cancellationToken);

        // Update SubscriptionIntent status if found
        if (subscriptionIntent != null)
        {
            subscriptionIntent.Status = Domain.Entities.SubscriptionIntentStatus.Completed;
            subscriptionIntent.CompletedAt = DateTime.UtcNow;
            subscriptionIntent.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
        }

        _logger.LogInformation(
            "Upgraded business {BusinessId} to plan {PlanId} from checkout session {SessionId}",
            businessId,
            targetPlanId,
            session.Id);

        // Send subscription confirmation email
        try
        {
            await _notificationService.SendSubscriptionConfirmationAsync(businessId, targetPlanId, cancellationToken);
        }
        catch (Exception ex)
        {
            // Log but don't fail the webhook - email is not critical
            _logger.LogError(ex, "Failed to send subscription confirmation email for business {BusinessId}", businessId);
        }
    }

    private async Task HandleSubscriptionUpdatedAsync(Event stripeEvent, CancellationToken cancellationToken)
    {
        LogSubscriptionUpdated(_logger, stripeEvent.Id);

        if (stripeEvent.Data.Object is not Subscription stripeSubscription)
        {
            _logger.LogWarning("Invalid subscription object in event {EventId}", stripeEvent.Id);
            return;
        }

        // Find the local subscription by Stripe subscription ID
        var subscription = await _context.Set<Domain.Entities.Subscription>()
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.StripeSubscriptionId == stripeSubscription.Id, cancellationToken);

        if (subscription == null)
        {
            _logger.LogWarning("No local subscription found for Stripe subscription {StripeSubscriptionId}", stripeSubscription.Id);
            return;
        }

        // Update subscription status based on Stripe status
        var newStatus = MapStripeStatusToLocal(stripeSubscription.Status);
        if (subscription.Status != newStatus)
        {
            _logger.LogInformation(
                "Updating subscription {SubscriptionId} status from {OldStatus} to {NewStatus}",
                subscription.Id, subscription.Status, newStatus);

            subscription.Status = newStatus;
        }

        // Update billing period dates
        if (stripeSubscription.CurrentPeriodStart != default)
        {
            subscription.CurrentPeriodStart = stripeSubscription.CurrentPeriodStart;
        }

        if (stripeSubscription.CurrentPeriodEnd != default)
        {
            subscription.CurrentPeriodEnd = stripeSubscription.CurrentPeriodEnd;
        }

        subscription.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Successfully updated subscription {SubscriptionId} from Stripe event {EventId}",
            subscription.Id, stripeEvent.Id);
    }

    private async Task HandleSubscriptionDeletedAsync(Event stripeEvent, CancellationToken cancellationToken)
    {
        LogSubscriptionDeleted(_logger, stripeEvent.Id);

        if (stripeEvent.Data.Object is not Subscription stripeSubscription)
        {
            _logger.LogWarning("Invalid subscription object in event {EventId}", stripeEvent.Id);
            return;
        }

        // Find the local subscription by Stripe subscription ID
        var subscription = await _context.Set<Domain.Entities.Subscription>()
            .FirstOrDefaultAsync(s => s.StripeSubscriptionId == stripeSubscription.Id, cancellationToken);

        if (subscription == null)
        {
            _logger.LogWarning("No local subscription found for Stripe subscription {StripeSubscriptionId}", stripeSubscription.Id);
            return;
        }

        // Mark subscription as cancelled
        subscription.Status = SubscriptionStatus.Cancelled;
        subscription.CancelledAt = DateTime.UtcNow;
        subscription.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Marked subscription {SubscriptionId} as cancelled from Stripe event {EventId}",
            subscription.Id, stripeEvent.Id);

        // Send cancellation notification email
        try
        {
            await _emailService.SendSubscriptionCancelledNotificationAsync(
                subscription.BusinessId,
                cancellationToken);

            _logger.LogInformation(
                "Sent subscription cancelled notification to business {BusinessId}",
                subscription.BusinessId);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to send subscription cancelled notification to business {BusinessId}",
                subscription.BusinessId);
        }
    }

    private async Task HandleInvoicePaidAsync(Event stripeEvent, CancellationToken cancellationToken)
    {
        LogInvoicePaid(_logger, stripeEvent.Id);

        if (stripeEvent.Data.Object is not Invoice stripeInvoice)
        {
            _logger.LogWarning("Invalid invoice object in event {EventId}", stripeEvent.Id);
            return;
        }

        // Find the subscription by Stripe subscription ID
        var subscription = await _context.Set<Domain.Entities.Subscription>()
            .FirstOrDefaultAsync(s => s.StripeSubscriptionId == stripeInvoice.SubscriptionId, cancellationToken);

        if (subscription == null)
        {
            _logger.LogWarning("No local subscription found for Stripe subscription {StripeSubscriptionId}", stripeInvoice.SubscriptionId);
            return;
        }

        // Create billing transaction record
        var transaction = new Domain.Entities.BillingTransaction
        {
            Id = Guid.NewGuid(),
            SubscriptionId = subscription.Id,
            StripeInvoiceId = stripeInvoice.Id,
            StripePaymentIntentId = stripeInvoice.PaymentIntentId,
            Amount = stripeInvoice.AmountPaid / 100m, // Convert from cents
            Currency = stripeInvoice.Currency?.ToUpperInvariant() ?? "USD",
            Type = "payment",
            Status = "succeeded",
            Description = $"Payment for invoice {stripeInvoice.Number}",
            CreatedAt = DateTime.UtcNow
        };

        _context.Set<Domain.Entities.BillingTransaction>().Add(transaction);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Created billing transaction {TransactionId} for invoice {InvoiceId}",
            transaction.Id, stripeInvoice.Id);
    }

    private async Task HandleInvoicePaymentFailedAsync(Event stripeEvent, CancellationToken cancellationToken)
    {
        LogInvoicePaymentFailed(_logger, stripeEvent.Id);

        if (stripeEvent.Data.Object is not Invoice stripeInvoice)
        {
            _logger.LogWarning("Invalid invoice object in event {EventId}", stripeEvent.Id);
            return;
        }

        // Find the subscription by Stripe subscription ID
        var subscription = await _context.Set<Domain.Entities.Subscription>()
            .FirstOrDefaultAsync(s => s.StripeSubscriptionId == stripeInvoice.SubscriptionId, cancellationToken);

        if (subscription == null)
        {
            _logger.LogWarning("No local subscription found for Stripe subscription {StripeSubscriptionId}", stripeInvoice.SubscriptionId);
            return;
        }

        // Create billing transaction record for failed payment
        var transaction = new Domain.Entities.BillingTransaction
        {
            Id = Guid.NewGuid(),
            SubscriptionId = subscription.Id,
            StripeInvoiceId = stripeInvoice.Id,
            StripePaymentIntentId = stripeInvoice.PaymentIntentId,
            Amount = stripeInvoice.AmountDue / 100m, // Convert from cents
            Currency = stripeInvoice.Currency?.ToUpperInvariant() ?? "USD",
            Type = "payment",
            Status = "failed",
            Description = $"Failed payment for invoice {stripeInvoice.Number}",
            CreatedAt = DateTime.UtcNow
        };

        _context.Set<Domain.Entities.BillingTransaction>().Add(transaction);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Created failed billing transaction {TransactionId} for invoice {InvoiceId}",
            transaction.Id, stripeInvoice.Id);

        // Send payment failed notification email
        try
        {
            await _emailService.SendPaymentFailedNotificationAsync(
                subscription.BusinessId,
                stripeInvoice.Id,
                stripeInvoice.AmountDue / 100m,
                cancellationToken);

            _logger.LogInformation(
                "Sent payment failed notification to business {BusinessId}",
                subscription.BusinessId);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to send payment failed notification to business {BusinessId}",
                subscription.BusinessId);
        }
    }

    /// <summary>
    /// Maps Stripe subscription status to local SubscriptionStatus enum.
    /// </summary>
    private static SubscriptionStatus MapStripeStatusToLocal(string stripeStatus)
    {
        return stripeStatus switch
        {
            "active" => SubscriptionStatus.Active,
            "trialing" => SubscriptionStatus.Trial,
            "past_due" => SubscriptionStatus.Suspended, // Map past_due to Suspended (grace period)
            "canceled" => SubscriptionStatus.Cancelled,
            "unpaid" => SubscriptionStatus.Suspended,
            "incomplete" => SubscriptionStatus.Suspended, // Map incomplete to Suspended
            "incomplete_expired" => SubscriptionStatus.Expired,
            "paused" => SubscriptionStatus.Suspended,
            _ => SubscriptionStatus.Active
        };
    }

    /// <inheritdoc/>
    public async Task<InvoiceListResult> GetInvoicesAsync(
        Guid businessId,
        int limit = 10,
        string? startingAfter = null,
        CancellationToken cancellationToken = default)
    {
        var business = await _context.Businesses.FindAsync([businessId], cancellationToken)
            ?? throw new InvalidOperationException($"Business {businessId} not found");

        if (string.IsNullOrEmpty(business.StripeCustomerId))
        {
            return new InvoiceListResult { Invoices = [], HasMore = false };
        }

        var options = new InvoiceListOptions
        {
            Customer = business.StripeCustomerId,
            Limit = limit,
        };

        if (!string.IsNullOrEmpty(startingAfter))
        {
            options.StartingAfter = startingAfter;
        }

        var service = new InvoiceService();
        var invoices = await service.ListAsync(options, cancellationToken: cancellationToken);

        return new InvoiceListResult
        {
            Invoices = invoices.Data.Select(MapToInvoiceDto).ToList(),
            HasMore = invoices.HasMore,
            NextCursor = invoices.Data.LastOrDefault()?.Id,
        };
    }

    /// <inheritdoc/>
    public async Task<InvoiceDto?> GetInvoiceByIdAsync(
        Guid businessId,
        string invoiceId,
        CancellationToken cancellationToken = default)
    {
        var business = await _context.Businesses.FindAsync([businessId], cancellationToken)
            ?? throw new InvalidOperationException($"Business {businessId} not found");

        var service = new InvoiceService();
        var invoice = await service.GetAsync(invoiceId, cancellationToken: cancellationToken);

        // Verify the invoice belongs to this business
        if (invoice.CustomerId != business.StripeCustomerId)
        {
            return null;
        }

        return MapToInvoiceDto(invoice);
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<PaymentMethodDto>> GetPaymentMethodsAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        var business = await _context.Businesses.FindAsync([businessId], cancellationToken)
            ?? throw new InvalidOperationException($"Business {businessId} not found");

        if (string.IsNullOrEmpty(business.StripeCustomerId))
        {
            return [];
        }

        var options = new PaymentMethodListOptions
        {
            Customer = business.StripeCustomerId,
            Type = "card",
        };

        var service = new PaymentMethodService();
        var paymentMethods = await service.ListAsync(options, cancellationToken: cancellationToken);

        // Get the default payment method
        var customerService = new CustomerService();
        var customer = await customerService.GetAsync(business.StripeCustomerId, cancellationToken: cancellationToken);
        var defaultPaymentMethodId = customer.InvoiceSettings?.DefaultPaymentMethodId;

        return paymentMethods.Data.Select(pm => new PaymentMethodDto
        {
            Id = pm.Id,
            Type = pm.Type,
            CardBrand = pm.Card?.Brand,
            CardLast4 = pm.Card?.Last4,
            CardExpMonth = (int?)pm.Card?.ExpMonth,
            CardExpYear = (int?)pm.Card?.ExpYear,
            IsDefault = pm.Id == defaultPaymentMethodId,
            CreatedAt = pm.Created,
        }).ToList();
    }

    /// <inheritdoc/>
    public async Task<string> CreateSetupIntentAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        var business = await _context.Businesses.FindAsync([businessId], cancellationToken)
            ?? throw new InvalidOperationException($"Business {businessId} not found");

        // Create customer if not exists
        var customerId = business.StripeCustomerId;
        if (string.IsNullOrEmpty(customerId))
        {
            customerId = await CreateCustomerAsync(businessId, business.Email, business.Name, cancellationToken);
        }

        var options = new SetupIntentCreateOptions
        {
            Customer = customerId,
            PaymentMethodTypes = ["card"],
            Metadata = new Dictionary<string, string>
            {
                { "business_id", businessId.ToString() },
            },
        };

        var service = new SetupIntentService();
        var setupIntent = await service.CreateAsync(options, cancellationToken: cancellationToken);

        return setupIntent.ClientSecret;
    }

    /// <inheritdoc/>
    public async Task<bool> SetDefaultPaymentMethodAsync(
        Guid businessId,
        string paymentMethodId,
        CancellationToken cancellationToken = default)
    {
        var business = await _context.Businesses.FindAsync([businessId], cancellationToken)
            ?? throw new InvalidOperationException($"Business {businessId} not found");

        if (string.IsNullOrEmpty(business.StripeCustomerId))
        {
            return false;
        }

        var options = new CustomerUpdateOptions
        {
            InvoiceSettings = new CustomerInvoiceSettingsOptions
            {
                DefaultPaymentMethod = paymentMethodId,
            },
        };

        var service = new CustomerService();
        await service.UpdateAsync(business.StripeCustomerId, options, cancellationToken: cancellationToken);

        _logger.LogInformation(
            "Set default payment method {PaymentMethodId} for business {BusinessId}",
            paymentMethodId, businessId);

        return true;
    }

    /// <inheritdoc/>
    public async Task<bool> DeletePaymentMethodAsync(
        Guid businessId,
        string paymentMethodId,
        CancellationToken cancellationToken = default)
    {
        var business = await _context.Businesses.FindAsync([businessId], cancellationToken)
            ?? throw new InvalidOperationException($"Business {businessId} not found");

        // Verify payment method belongs to this customer
        var pmService = new PaymentMethodService();
        var paymentMethod = await pmService.GetAsync(paymentMethodId, cancellationToken: cancellationToken);

        if (paymentMethod.CustomerId != business.StripeCustomerId)
        {
            return false;
        }

        await pmService.DetachAsync(paymentMethodId, cancellationToken: cancellationToken);

        _logger.LogInformation(
            "Deleted payment method {PaymentMethodId} for business {BusinessId}",
            paymentMethodId, businessId);

        return true;
    }

    /// <inheritdoc/>
    public async Task<string> CreateBillingPortalSessionAsync(
        Guid businessId,
        string returnUrl,
        CancellationToken cancellationToken = default)
    {
        var business = await _context.Businesses
            .FirstOrDefaultAsync(b => b.Id == businessId, cancellationToken)
            ?? throw new InvalidOperationException($"Business {businessId} not found");

        if (string.IsNullOrEmpty(business.StripeCustomerId))
        {
            throw new InvalidOperationException("Business does not have a Stripe customer ID. Cannot create billing portal session.");
        }

        var options = new Stripe.BillingPortal.SessionCreateOptions
        {
            Customer = business.StripeCustomerId,
            ReturnUrl = returnUrl,
        };

        var service = new Stripe.BillingPortal.SessionService();
        var session = await service.CreateAsync(options, cancellationToken: cancellationToken);

        _logger.LogInformation(
            "Created billing portal session for business {BusinessId}",
            businessId);

        return session.Url;
    }

    private static InvoiceDto MapToInvoiceDto(Stripe.Invoice invoice)
    {
        return new InvoiceDto
        {
            Id = invoice.Id,
            Number = invoice.Number,
            Status = invoice.Status ?? "unknown",
            AmountDue = invoice.AmountDue,
            AmountPaid = invoice.AmountPaid,
            Currency = invoice.Currency,
            CreatedAt = invoice.Created,
            DueDate = invoice.DueDate,
            PaidAt = invoice.StatusTransitions?.PaidAt,
            Description = invoice.Description,
            HostedInvoiceUrl = invoice.HostedInvoiceUrl,
            InvoicePdfUrl = invoice.InvoicePdf,
            LineItems = invoice.Lines?.Data?.Select(line => new InvoiceLineItemDto
            {
                Description = line.Description ?? string.Empty,
                Quantity = line.Quantity ?? 1,
                UnitAmount = line.Price?.UnitAmount ?? 0,
                Amount = line.Amount,
            }).ToList() ?? [],
        };
    }

    // LoggerMessage delegates for high-performance logging
    [LoggerMessage(Level = LogLevel.Information, Message = "Subscription updated event received: {EventId}")]
    private static partial void LogSubscriptionUpdated(ILogger logger, string eventId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Subscription deleted event received: {EventId}")]
    private static partial void LogSubscriptionDeleted(ILogger logger, string eventId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Invoice paid event received: {EventId}")]
    private static partial void LogInvoicePaid(ILogger logger, string eventId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Invoice payment failed event received: {EventId}")]
    private static partial void LogInvoicePaymentFailed(ILogger logger, string eventId);
}

