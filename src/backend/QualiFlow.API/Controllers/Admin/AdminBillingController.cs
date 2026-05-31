// -----------------------------------------------------------------------
// <copyright file="AdminBillingController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Features.Admin.Authorization;
using QualiFlow.Application.Features.Admin.Billing;

namespace QualiFlow.API.Controllers.Admin;

/// <summary>
/// Admin controller for billing analytics and revenue metrics.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/billing")]
[Authorize(AuthenticationSchemes = "AdminBearer", Policy = AdminPolicies.RequirePlatformAdmin)]
[Produces("application/json")]
public class AdminBillingController : ControllerBase
{
    private readonly IAdminBillingService _billingService;
    private readonly ILogger<AdminBillingController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AdminBillingController"/> class.
    /// </summary>
    /// <param name="billingService">The billing service.</param>
    /// <param name="logger">The logger.</param>
    public AdminBillingController(
        IAdminBillingService billingService,
        ILogger<AdminBillingController> logger)
    {
        _billingService = billingService;
        _logger = logger;
    }

    /// <summary>
    /// Gets revenue metrics for the admin dashboard.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Revenue metrics including MRR, ARR, churn, and trends.</returns>
    [HttpGet("metrics")]
    [ProducesResponseType(typeof(RevenueMetricsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<RevenueMetricsDto>> GetMetrics(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Admin fetching revenue metrics");
        var metrics = await _billingService.GetRevenueMetricsAsync(cancellationToken);
        return Ok(metrics);
    }

    /// <summary>
    /// Gets MRR history for trend analysis.
    /// </summary>
    /// <param name="months">Number of months to include (default 6).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Monthly MRR data.</returns>
    [HttpGet("mrr-history")]
    [ProducesResponseType(typeof(IReadOnlyList<MonthlyRevenueDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<MonthlyRevenueDto>>> GetMrrHistory(
        [FromQuery] int months = 6,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Admin fetching MRR history for {Months} months", months);

        if (months < 1 || months > 24)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Bad Request",
                Detail = "Months must be between 1 and 24",
                Status = StatusCodes.Status400BadRequest,
            });
        }

        var history = await _billingService.GetMrrHistoryAsync(months, cancellationToken);
        return Ok(history);
    }

    /// <summary>
    /// Gets all invoices across all businesses for admin review.
    /// </summary>
    /// <param name="limit">Maximum number of invoices to return.</param>
    /// <param name="status">Filter by invoice status.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of invoices.</returns>
    [HttpGet("invoices")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllInvoices(
        [FromQuery] int limit = 50,
        [FromQuery] string? status = null,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Admin fetching invoices with limit {Limit}, status {Status}", limit, status);
        var invoices = await _billingService.GetAllInvoicesAsync(limit, status, cancellationToken);
        return Ok(invoices);
    }

    /// <summary>
    /// Resends an invoice email to the customer.
    /// </summary>
    /// <param name="invoiceId">The invoice ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Success status.</returns>
    [HttpPost("invoices/{invoiceId}/resend")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResendInvoice(
        string invoiceId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Admin resending invoice {InvoiceId}", invoiceId);
        await _billingService.ResendInvoiceAsync(invoiceId, cancellationToken);
        return Ok(new { success = true, message = "Invoice resent successfully" });
    }

    /// <summary>
    /// Issues a refund for an invoice.
    /// </summary>
    /// <param name="invoiceId">The invoice ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Refund details.</returns>
    [HttpPost("invoices/{invoiceId}/refund")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RefundInvoice(
        string invoiceId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Admin issuing refund for invoice {InvoiceId}", invoiceId);
        var result = await _billingService.RefundInvoiceAsync(invoiceId, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Gets all payment methods across all businesses.
    /// </summary>
    /// <param name="limit">Maximum number of payment methods to return.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of payment methods.</returns>
    [HttpGet("payment-methods")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllPaymentMethods(
        [FromQuery] int limit = 50,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Admin fetching payment methods with limit {Limit}", limit);
        var paymentMethods = await _billingService.GetAllPaymentMethodsAsync(limit, cancellationToken);
        return Ok(paymentMethods);
    }

    /// <summary>
    /// Gets all disputes across all businesses.
    /// </summary>
    /// <param name="limit">Maximum number of disputes to return.</param>
    /// <param name="status">Filter by dispute status.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of disputes.</returns>
    [HttpGet("disputes")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllDisputes(
        [FromQuery] int limit = 50,
        [FromQuery] string? status = null,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Admin fetching disputes with limit {Limit}, status {Status}", limit, status);
        var disputes = await _billingService.GetAllDisputesAsync(limit, status, cancellationToken);
        return Ok(disputes);
    }
}
