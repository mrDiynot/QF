// -----------------------------------------------------------------------
// <copyright file="AdminSubscriptionsController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Common.Models;
using QualiFlow.Application.Features.Admin.Authorization;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Controllers.Admin;

/// <summary>
/// Admin controller for managing business subscriptions.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/subscriptions")]
[Authorize(AuthenticationSchemes = "AdminBearer", Policy = AdminPolicies.RequirePlatformAdmin)]
[Produces("application/json")]
public class AdminSubscriptionsController : ControllerBase
{
    private readonly ISubscriptionService _subscriptionService;
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<AdminSubscriptionsController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AdminSubscriptionsController"/> class.
    /// </summary>
    /// <param name="subscriptionService">The subscription service.</param>
    /// <param name="context">The database context.</param>
    /// <param name="logger">The logger.</param>
    public AdminSubscriptionsController(
        ISubscriptionService subscriptionService,
        QualiFlowDbContext context,
        ILogger<AdminSubscriptionsController> logger)
    {
        _subscriptionService = subscriptionService;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Gets all subscriptions with pagination and filtering.
    /// </summary>
    /// <param name="query">Query parameters for filtering.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paginated list of subscriptions.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<SubscriptionWithDetailsDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<SubscriptionWithDetailsDto>>> GetSubscriptions(
        [FromQuery] AdminSubscriptionQuery query,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Admin fetching subscriptions with query: {@Query}", query);

        var allSubscriptions = await _subscriptionService.GetAllSubscriptionsForAdminAsync(cancellationToken);

        // Apply filters
        var filtered = allSubscriptions.AsEnumerable();

        if (!string.IsNullOrEmpty(query.Status))
        {
            filtered = filtered.Where(s => s.Status.Equals(query.Status, StringComparison.OrdinalIgnoreCase));
        }

        if (query.PlanId.HasValue)
        {
            filtered = filtered.Where(s => s.PlanId == query.PlanId.Value);
        }

        if (!string.IsNullOrEmpty(query.Search))
        {
            var search = query.Search.ToLowerInvariant();
            filtered = filtered.Where(s =>
                s.BusinessName.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                s.BusinessEmail.Contains(search, StringComparison.OrdinalIgnoreCase));
        }

        var filteredList = filtered.ToList();
        var totalItems = filteredList.Count;

        // Apply pagination
        var items = filteredList
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToList();

        return Ok(new PagedResult<SubscriptionWithDetailsDto>
        {
            Items = items,
            TotalItems = totalItems,
            Page = query.Page,
            PageSize = query.PageSize,
        });
    }

    /// <summary>
    /// Gets a subscription by ID.
    /// </summary>
    /// <param name="id">The subscription ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The subscription details.</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(SubscriptionWithDetailsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SubscriptionWithDetailsDto>> GetSubscription(
        Guid id,
        CancellationToken cancellationToken)
    {
        var subscription = await _subscriptionService.GetSubscriptionByIdForAdminAsync(id, cancellationToken);

        if (subscription == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Detail = $"Subscription {id} not found",
                Status = StatusCodes.Status404NotFound,
            });
        }

        return Ok(subscription);
    }

    /// <summary>
    /// Changes a subscription's plan (upgrade/downgrade).
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="request">The change plan request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated subscription.</returns>
    [HttpPost("{businessId:guid}/change-plan")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> ChangePlan(
        Guid businessId,
        [FromBody] ChangePlanRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Admin changing plan for business {BusinessId} to plan {PlanId}",
            businessId, request.NewPlanId);

        try
        {
            await _subscriptionService.AdminChangePlanAsync(
                businessId,
                request.NewPlanId,
                request.Immediate,
                cancellationToken);

            return Ok(new { message = "Plan changed successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound,
            });
        }
    }

    /// <summary>
    /// Cancels a subscription.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Success message.</returns>
    [HttpPost("{businessId:guid}/cancel")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> CancelSubscription(
        Guid businessId,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Admin cancelling subscription for business {BusinessId}", businessId);

        try
        {
            await _subscriptionService.CancelSubscriptionAsync(businessId, cancellationToken);
            return Ok(new { message = "Subscription cancelled successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound,
            });
        }
    }

    /// <summary>
    /// Reactivates a cancelled subscription.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Success message.</returns>
    [HttpPost("{businessId:guid}/reactivate")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> ReactivateSubscription(
        Guid businessId,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Admin reactivating subscription for business {BusinessId}", businessId);

        try
        {
            await _subscriptionService.ReactivateSubscriptionAsync(businessId, cancellationToken);
            return Ok(new { message = "Subscription reactivated successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound,
            });
        }
    }

    /// <summary>
    /// Gets subscription statistics for the admin dashboard.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Subscription statistics.</returns>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(SubscriptionStatsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SubscriptionStatsDto>> GetStats(CancellationToken cancellationToken)
    {
        var stats = await _subscriptionService.GetSubscriptionStatsAsync(cancellationToken);
        return Ok(stats);
    }

    /// <summary>
    /// Gets all subscription intents with optional filtering.
    /// Used for reconciliation when Stripe webhooks fail.
    /// </summary>
    /// <param name="query">Query parameters for filtering.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paginated list of subscription intents.</returns>
    [HttpGet("intents")]
    [ProducesResponseType(typeof(PagedResult<SubscriptionIntentDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<SubscriptionIntentDto>>> GetSubscriptionIntents(
        [FromQuery] SubscriptionIntentQuery query,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Admin fetching subscription intents with query: {@Query}", query);

        var queryable = _context.SubscriptionIntents
            .Include(si => si.Business)
            .Include(si => si.IntendedPlan)
            .AsNoTracking();

        // Apply filters
        if (query.Status.HasValue)
        {
            queryable = queryable.Where(si => si.Status == query.Status.Value);
        }

        if (query.BusinessId.HasValue)
        {
            queryable = queryable.Where(si => si.BusinessId == query.BusinessId.Value);
        }

        if (!string.IsNullOrEmpty(query.Search))
        {
            var search = query.Search.ToUpperInvariant();
            queryable = queryable.Where(si =>
                si.Business.Name.ToUpperInvariant().Contains(search, StringComparison.OrdinalIgnoreCase) ||
                (si.StripeCheckoutSessionId != null && si.StripeCheckoutSessionId.ToUpperInvariant().Contains(search, StringComparison.OrdinalIgnoreCase)));
        }

        var totalItems = await queryable.CountAsync(cancellationToken);

        var items = await queryable
            .OrderByDescending(si => si.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(si => new SubscriptionIntentDto
            {
                Id = si.Id,
                BusinessId = si.BusinessId,
                BusinessName = si.Business.Name,
                IntendedPlanId = si.IntendedPlanId,
                IntendedPlanName = si.IntendedPlan.DisplayName ?? si.IntendedPlan.Name,
                BillingInterval = si.BillingInterval,
                IncludeOnboarding = si.IncludeOnboarding,
                StripeCheckoutSessionId = si.StripeCheckoutSessionId,
                StripeCustomerId = si.StripeCustomerId,
                Status = si.Status.ToString(),
                AmountCents = si.AmountCents,
                Currency = si.Currency,
                Source = si.Source,
                CreatedAt = si.CreatedAt,
                CompletedAt = si.CompletedAt,
                ExpiresAt = si.ExpiresAt,
                FailureReason = si.FailureReason,
            })
            .ToListAsync(cancellationToken);

        return Ok(new PagedResult<SubscriptionIntentDto>
        {
            Items = items,
            TotalItems = totalItems,
            Page = query.Page,
            PageSize = query.PageSize,
        });
    }

    /// <summary>
    /// Manually reconciles a pending subscription intent.
    /// This upgrades the business to the intended plan.
    /// </summary>
    /// <param name="intentId">The subscription intent ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Success message.</returns>
    [HttpPost("intents/{intentId:guid}/reconcile")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> ReconcileIntent(
        Guid intentId,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Admin reconciling subscription intent {IntentId}", intentId);

        var intent = await _context.SubscriptionIntents
            .Include(si => si.IntendedPlan)
            .FirstOrDefaultAsync(si => si.Id == intentId, cancellationToken);

        if (intent == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Detail = $"Subscription intent {intentId} not found",
                Status = StatusCodes.Status404NotFound,
            });
        }

        if (intent.Status == SubscriptionIntentStatus.Completed)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Already Completed",
                Detail = "This subscription intent has already been completed",
                Status = StatusCodes.Status400BadRequest,
            });
        }

        // Upgrade the subscription
        await _subscriptionService.UpgradeSubscriptionAsync(
            intent.BusinessId,
            intent.IntendedPlanId,
            cancellationToken);

        // Mark intent as completed
        intent.Status = SubscriptionIntentStatus.Completed;
        intent.CompletedAt = DateTime.UtcNow;
        intent.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Reconciled subscription intent {IntentId} - upgraded business {BusinessId} to plan {PlanId}",
            intentId,
            intent.BusinessId,
            intent.IntendedPlanId);

        return Ok(new
        {
            message = "Subscription intent reconciled successfully",
            businessId = intent.BusinessId,
            planId = intent.IntendedPlanId,
            planName = intent.IntendedPlan.DisplayName ?? intent.IntendedPlan.Name,
        });
    }

    /// <summary>
    /// Marks a subscription intent as failed or cancelled.
    /// </summary>
    /// <param name="intentId">The subscription intent ID.</param>
    /// <param name="request">The update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Success message.</returns>
    [HttpPost("intents/{intentId:guid}/update-status")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> UpdateIntentStatus(
        Guid intentId,
        [FromBody] UpdateIntentStatusRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Admin updating subscription intent {IntentId} status to {Status}",
            intentId,
            request.Status);

        var intent = await _context.SubscriptionIntents
            .FirstOrDefaultAsync(si => si.Id == intentId, cancellationToken);

        if (intent == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Detail = $"Subscription intent {intentId} not found",
                Status = StatusCodes.Status404NotFound,
            });
        }

        intent.Status = request.Status;
        intent.FailureReason = request.Reason;
        intent.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new { message = $"Subscription intent status updated to {request.Status}" });
    }

    /// <summary>
    /// Extends a business's trial period by the specified number of days.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="request">The extend trial request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    [HttpPost("{businessId:guid}/extend-trial")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ExtendTrial(
        Guid businessId,
        [FromBody] ExtendTrialRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Admin extending trial for business {BusinessId} by {Days} days",
            businessId, request.Days);

        try
        {
            await _subscriptionService.ExtendTrialAsync(businessId, request.Days, cancellationToken);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Bad Request",
                Detail = ex.Message,
                Status = StatusCodes.Status400BadRequest,
            });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound,
            });
        }
    }

    /// <summary>
    /// Applies a credit to a business's subscription account.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="request">The apply credit request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    [HttpPost("{businessId:guid}/apply-credit")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ApplyCredit(
        Guid businessId,
        [FromBody] ApplyCreditRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Admin applying credit of {Amount} to business {BusinessId}. Reason: {Reason}",
            request.Amount, businessId, request.Reason);

        try
        {
            await _subscriptionService.ApplyCreditAsync(
                businessId, request.Amount, request.Reason, cancellationToken);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Bad Request",
                Detail = ex.Message,
                Status = StatusCodes.Status400BadRequest,
            });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound,
            });
        }
    }
}

/// <summary>
/// Query parameters for admin subscription listing.
/// </summary>
public class AdminSubscriptionQuery
{
    /// <summary>Gets or sets the page number.</summary>
    public int Page { get; set; } = 1;

    /// <summary>Gets or sets the page size.</summary>
    public int PageSize { get; set; } = 20;

    /// <summary>Gets or sets the status filter.</summary>
    public string? Status { get; set; }

    /// <summary>Gets or sets the plan filter.</summary>
    public Guid? PlanId { get; set; }

    /// <summary>Gets or sets the search term.</summary>
    public string? Search { get; set; }
}

/// <summary>
/// Request to change a subscription plan.
/// </summary>
public class ChangePlanRequest
{
    /// <summary>Gets or sets the new plan ID.</summary>
    public required Guid NewPlanId { get; set; }

    /// <summary>Gets or sets a value indicating whether to apply immediately.</summary>
    public bool Immediate { get; set; } = true;
}

/// <summary>
/// Query parameters for subscription intent listing.
/// </summary>
public class SubscriptionIntentQuery
{
    /// <summary>Gets or sets the page number.</summary>
    public int Page { get; set; } = 1;

    /// <summary>Gets or sets the page size.</summary>
    public int PageSize { get; set; } = 20;

    /// <summary>Gets or sets the status filter.</summary>
    public SubscriptionIntentStatus? Status { get; set; }

    /// <summary>Gets or sets the business ID filter.</summary>
    public Guid? BusinessId { get; set; }

    /// <summary>Gets or sets the search term.</summary>
    public string? Search { get; set; }
}

/// <summary>
/// DTO for subscription intent.
/// </summary>
public class SubscriptionIntentDto
{
    /// <summary>Gets or sets the intent ID.</summary>
    public Guid Id { get; set; }

    /// <summary>Gets or sets the business ID.</summary>
    public Guid BusinessId { get; set; }

    /// <summary>Gets or sets the business name.</summary>
    public string BusinessName { get; set; } = string.Empty;

    /// <summary>Gets or sets the intended plan ID.</summary>
    public Guid IntendedPlanId { get; set; }

    /// <summary>Gets or sets the intended plan name.</summary>
    public string IntendedPlanName { get; set; } = string.Empty;

    /// <summary>Gets or sets the billing interval.</summary>
    public string BillingInterval { get; set; } = string.Empty;

    /// <summary>Gets or sets a value indicating whether onboarding was included.</summary>
    public bool IncludeOnboarding { get; set; }

    /// <summary>Gets or sets the Stripe checkout session ID.</summary>
    public string? StripeCheckoutSessionId { get; set; }

    /// <summary>Gets or sets the Stripe customer ID.</summary>
    public string? StripeCustomerId { get; set; }

    /// <summary>Gets or sets the status.</summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>Gets or sets the amount in cents.</summary>
    public long? AmountCents { get; set; }

    /// <summary>Gets or sets the currency.</summary>
    public string Currency { get; set; } = "USD";

    /// <summary>Gets or sets the source.</summary>
    public string Source { get; set; } = string.Empty;

    /// <summary>Gets or sets the created date.</summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>Gets or sets the completed date.</summary>
    public DateTime? CompletedAt { get; set; }

    /// <summary>Gets or sets the expiration date.</summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>Gets or sets the failure reason.</summary>
    public string? FailureReason { get; set; }
}

/// <summary>
/// Request to update subscription intent status.
/// </summary>
public class UpdateIntentStatusRequest
{
    /// <summary>Gets or sets the new status.</summary>
    public required SubscriptionIntentStatus Status { get; set; }

    /// <summary>Gets or sets the reason for the status change.</summary>
    public string? Reason { get; set; }
}

/// <summary>
/// Request to extend a trial period.
/// </summary>
public class ExtendTrialRequest
{
    /// <summary>Gets or sets the number of days to extend.</summary>
    public required int Days { get; set; }
}

/// <summary>
/// Request to apply a credit.
/// </summary>
public class ApplyCreditRequest
{
    /// <summary>Gets or sets the credit amount.</summary>
    public required decimal Amount { get; set; }

    /// <summary>Gets or sets the reason for the credit.</summary>
    public required string Reason { get; set; }
}
