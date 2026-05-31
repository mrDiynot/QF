using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Enums;
using System.Net;
using System.Text.Json;

namespace QualiFlow.API.Middleware;

/// <summary>
/// Middleware to check subscription status and enforce access control.
/// </summary>
public class SubscriptionCheckMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<SubscriptionCheckMiddleware> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="SubscriptionCheckMiddleware"/> class.
    /// </summary>
    /// <param name="next">The next middleware in the pipeline.</param>
    /// <param name="logger">The logger.</param>
    public SubscriptionCheckMiddleware(RequestDelegate next, ILogger<SubscriptionCheckMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    /// <summary>
    /// Invokes the middleware to check subscription status.
    /// </summary>
    /// <param name="context">The HTTP context.</param>
    /// <param name="currentUserService">The current user service.</param>
    /// <param name="subscriptionService">The subscription service.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task InvokeAsync(
        HttpContext context,
        ICurrentUserService currentUserService,
        ISubscriptionService subscriptionService)
    {
        // Skip subscription check for certain paths
        if (ShouldSkipSubscriptionCheck(context.Request.Path))
        {
            await _next(context);
            return;
        }

        // Skip if user is not authenticated
        if (!context.User.Identity?.IsAuthenticated ?? true)
        {
            await _next(context);
            return;
        }

        try
        {
            var businessId = currentUserService.GetBusinessId();

            // Check if subscription is active
            var isActive = await subscriptionService.IsSubscriptionActiveAsync(businessId, context.RequestAborted);

            if (!isActive)
            {
                // Check if trial expired
                var isTrialExpired = await subscriptionService.IsTrialExpiredAsync(businessId, context.RequestAborted);

                if (isTrialExpired)
                {
                    _logger.LogWarning("Trial expired for business {BusinessId}", businessId);
                    await WriteErrorResponse(
                        context,
                        HttpStatusCode.PaymentRequired,
                        "Trial Expired",
                        "Your trial period has expired. Please upgrade to continue using QualiFlow.");
                    return;
                }

                // Get subscription to check status
                var subscription = await subscriptionService.GetSubscriptionAsync(businessId, context.RequestAborted);

                if (subscription?.Status == SubscriptionStatus.Suspended)
                {
                    _logger.LogWarning("Subscription suspended for business {BusinessId}", businessId);

                    // Allow read-only access during suspension (GET requests only)
                    if (context.Request.Method != HttpMethods.Get)
                    {
                        await WriteErrorResponse(
                            context,
                            HttpStatusCode.PaymentRequired,
                            "Subscription Suspended",
                            "Your subscription is suspended due to payment failure. Please update your payment method.");
                        return;
                    }
                }
                else if (subscription?.Status == SubscriptionStatus.Cancelled)
                {
                    _logger.LogWarning("Subscription cancelled for business {BusinessId}", businessId);
                    await WriteErrorResponse(
                        context,
                        HttpStatusCode.Forbidden,
                        "Subscription Cancelled",
                        "Your subscription has been cancelled. Please contact support to reactivate.");
                    return;
                }
            }

            // Store subscription in HttpContext for downstream use
            var sub = await subscriptionService.GetSubscriptionAsync(businessId, context.RequestAborted);
            if (sub != null)
            {
                context.Items["Subscription"] = sub;
            }

            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking subscription status");
            await _next(context); // Allow request to proceed on error
        }
    }

    private static bool ShouldSkipSubscriptionCheck(PathString path)
    {
        var pathValue = path.Value?.ToLowerInvariant() ?? string.Empty;

        // Skip subscription check for these paths
        // Note: These endpoints need access even during payment processing delays
        // (Stripe webhook may not have processed yet)
        return pathValue.StartsWith("/api/v1/admin", StringComparison.OrdinalIgnoreCase) ||
               pathValue.StartsWith("/api/v1/auth", StringComparison.OrdinalIgnoreCase) ||
               pathValue.StartsWith("/api/v1/subscriptions", StringComparison.OrdinalIgnoreCase) ||
               pathValue.StartsWith("/api/v1/stripe-webhooks", StringComparison.OrdinalIgnoreCase) ||
               pathValue.StartsWith("/api/v1/onboarding", StringComparison.OrdinalIgnoreCase) ||
               pathValue.StartsWith("/api/v1/analytics", StringComparison.OrdinalIgnoreCase) ||
               pathValue.StartsWith("/api/v1/channels", StringComparison.OrdinalIgnoreCase) ||
               pathValue.StartsWith("/api/v1/business", StringComparison.OrdinalIgnoreCase) ||
               pathValue.StartsWith("/api/v1/users", StringComparison.OrdinalIgnoreCase) ||
               pathValue.StartsWith("/api/v1/voice-agents", StringComparison.OrdinalIgnoreCase) ||
               pathValue.StartsWith("/api/v1/voice-calls", StringComparison.OrdinalIgnoreCase) ||
               pathValue.StartsWith("/health", StringComparison.OrdinalIgnoreCase) ||
               pathValue.StartsWith("/swagger", StringComparison.OrdinalIgnoreCase) ||
               pathValue.StartsWith("/hubs", StringComparison.OrdinalIgnoreCase);
    }

    private static async Task WriteErrorResponse(
        HttpContext context,
        HttpStatusCode statusCode,
        string title,
        string detail)
    {
        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/problem+json";

        var problemDetails = new
        {
            type = "https://tools.ietf.org/html/rfc9110#section-15.5.2",
            title,
            status = (int)statusCode,
            detail,
            instance = context.Request.Path.Value
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(problemDetails));
    }
}

