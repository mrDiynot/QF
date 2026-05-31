// -----------------------------------------------------------------------
// <copyright file="AdminBillingService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.Admin.Billing;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for admin billing analytics operations.
/// </summary>
public class AdminBillingService : IAdminBillingService
{
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<AdminBillingService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AdminBillingService"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="logger">The logger.</param>
    public AdminBillingService(QualiFlowDbContext context, ILogger<AdminBillingService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<RevenueMetricsDto> GetRevenueMetricsAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Calculating revenue metrics");

        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        // Get all subscriptions with plan details — only those with existing businesses
        var subscriptions = await _context.Subscriptions
            .AsNoTracking()
            .Include(s => s.Plan)
            .Where(s => _context.Businesses.Any(b => b.Id == s.BusinessId && b.DeletedAt == null))
            .ToListAsync(cancellationToken);

        // Current MRR from active subscriptions
        var activeSubscriptions = subscriptions
            .Where(s => s.Status == SubscriptionStatus.Active && s.Plan != null)
            .ToList();

        var totalMrr = activeSubscriptions.Sum(s => s.Plan!.PriceMonthly);
        var payingCustomers = activeSubscriptions.Count;

        // Calculate ARPU
        var arpu = payingCustomers > 0 ? totalMrr / payingCustomers : 0;

        // New MRR this month (subscriptions created this month that are active)
        var newThisMonth = subscriptions
            .Where(s => s.CreatedAt >= startOfMonth && s.Status == SubscriptionStatus.Active && s.Plan != null)
            .Sum(s => s.Plan!.PriceMonthly);

        // Churned MRR this month (subscriptions cancelled this month)
        var churnedThisMonth = subscriptions
            .Where(s => s.CancelledAt >= startOfMonth && s.Plan != null)
            .Sum(s => s.Plan!.PriceMonthly);

        // Last month's MRR for comparison
        var lastMonthSubscriptions = subscriptions
            .Where(s => s.CreatedAt < startOfMonth && s.Plan != null)
            .ToList();

        var lastMonthMrr = lastMonthSubscriptions
            .Where(s => s.Status == SubscriptionStatus.Active || s.CancelledAt >= startOfMonth)
            .Sum(s => s.Plan!.PriceMonthly);

        // MRR growth
        decimal mrrGrowth;
        if (lastMonthMrr > 0)
        {
            mrrGrowth = ((totalMrr - lastMonthMrr) / lastMonthMrr) * 100;
        }
        else
        {
            mrrGrowth = totalMrr > 0 ? 100 : 0;
        }

        // Churn rate (cancelled this month / active last month)
        var cancelledThisMonth = subscriptions.Count(s => s.CancelledAt >= startOfMonth);
        var activeLastMonth = subscriptions.Count(s =>
            s.CreatedAt < startOfMonth &&
            (s.Status == SubscriptionStatus.Active || s.CancelledAt >= startOfMonth));

        var churnRate = activeLastMonth > 0
            ? (decimal)cancelledThisMonth / activeLastMonth * 100
            : 0;

        // LTV calculation (ARPU / monthly churn rate)
        var monthlyChurnDecimal = churnRate / 100;
        var ltv = monthlyChurnDecimal > 0 ? arpu / monthlyChurnDecimal : arpu * 24; // Default to 24 months if no churn

        // Net new MRR
        var netNewMrr = newThisMonth - churnedThisMonth;

        return new RevenueMetricsDto
        {
            TotalMRR = totalMrr,
            MrrGrowthPercent = Math.Round(mrrGrowth, 1),
            TotalARR = totalMrr * 12,
            NewMRR = newThisMonth,
            ChurnedMRR = churnedThisMonth,
            ExpansionMRR = 0, // Would need upgrade tracking to calculate
            NetNewMRR = netNewMrr,
            ARPU = Math.Round(arpu, 2),
            LTV = Math.Round(ltv, 2),
            ChurnRate = Math.Round(churnRate, 1),
            PayingCustomers = payingCustomers,
        };
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<MonthlyRevenueDto>> GetMrrHistoryAsync(int months = 6, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting MRR history for {Months} months", months);

        var now = DateTime.UtcNow;
        var result = new List<MonthlyRevenueDto>();

        // Get all subscriptions with plan details — only those with existing businesses
        var subscriptions = await _context.Subscriptions
            .AsNoTracking()
            .Include(s => s.Plan)
            .Where(s => _context.Businesses.Any(b => b.Id == s.BusinessId && b.DeletedAt == null))
            .ToListAsync(cancellationToken);

        for (var i = months - 1; i >= 0; i--)
        {
            var targetDate = now.AddMonths(-i);
            var startOfMonth = new DateTime(targetDate.Year, targetDate.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var endOfMonth = startOfMonth.AddMonths(1);

            // Subscriptions that were active at end of this month
            var activeAtEndOfMonth = subscriptions
                .Where(s =>
                    s.CreatedAt < endOfMonth &&
                    s.Plan != null &&
                    (s.CancelledAt == null || s.CancelledAt >= endOfMonth) &&
                    s.Status != SubscriptionStatus.Cancelled)
                .ToList();

            var mrr = activeAtEndOfMonth.Sum(s => s.Plan!.PriceMonthly);
            var customerCount = activeAtEndOfMonth.Count;

            // New subscriptions this month
            var newSubs = subscriptions.Count(s =>
                s.CreatedAt >= startOfMonth && s.CreatedAt < endOfMonth);

            // Cancellations this month
            var cancellations = subscriptions.Count(s =>
                s.CancelledAt >= startOfMonth && s.CancelledAt < endOfMonth);

            result.Add(new MonthlyRevenueDto
            {
                Month = targetDate.ToString("MMM", System.Globalization.CultureInfo.InvariantCulture),
                Year = targetDate.Year,
                MonthNumber = targetDate.Month,
                MRR = mrr,
                CustomerCount = customerCount,
                NewSubscriptions = newSubs,
                Cancellations = cancellations,
            });
        }

        return result.AsReadOnly();
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<AdminInvoiceDto>> GetAllInvoicesAsync(int limit = 50, string? status = null, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting all invoices with limit {Limit}, status {Status}", limit, status);

        // Stripe integration not yet implemented — return empty list
        // Real invoices will come from Stripe API when billing is connected
        _logger.LogDebug("Stripe not integrated — returning empty invoice list");
        await Task.CompletedTask;
        return Array.Empty<AdminInvoiceDto>();
    }

    /// <inheritdoc/>
    public Task ResendInvoiceAsync(string invoiceId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Resending invoice {InvoiceId}", invoiceId);

        // In a real implementation, this would call Stripe API to resend the invoice
        // For now, we just log the action
        return Task.CompletedTask;
    }

    /// <inheritdoc/>
    public Task<AdminRefundResultDto> RefundInvoiceAsync(string invoiceId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Refunding invoice {InvoiceId}", invoiceId);

        // Stripe integration not yet implemented
        _logger.LogWarning("Refund requested for invoice {InvoiceId} but Stripe is not yet integrated", invoiceId);
        return Task.FromResult(new AdminRefundResultDto
        {
            RefundId = string.Empty,
            Amount = 0,
            Status = "not_available",
            Success = false,
        });
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<AdminPaymentMethodDto>> GetAllPaymentMethodsAsync(int limit = 50, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting all payment methods with limit {Limit}", limit);

        // Stripe integration not yet implemented — return empty list
        // Real payment methods will come from Stripe API when billing is connected
        _logger.LogDebug("Stripe not integrated — returning empty payment methods list");
        await Task.CompletedTask;
        return Array.Empty<AdminPaymentMethodDto>();
    }

    /// <inheritdoc/>
    public Task<IReadOnlyList<AdminDisputeDto>> GetAllDisputesAsync(int limit = 50, string? status = null, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting all disputes with limit {Limit}, status {Status}", limit, status);

        // In a real implementation, this would call Stripe API to get disputes
        // For now, we return an empty list (no disputes is good!)
        return Task.FromResult<IReadOnlyList<AdminDisputeDto>>(Array.Empty<AdminDisputeDto>());
    }
}
